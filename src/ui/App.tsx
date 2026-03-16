import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useStdout, useApp } from 'ink';
import { colors } from './theme';
import { WelcomeScreen } from './WelcomeScreen';
import { HelpScreen } from './HelpScreen';
import { ResultCard } from './ResultCard';
import { ErrorDisplay } from './ErrorDisplay';
import { InputPrompt } from './InputPrompt';
import { processCommand } from '../cliCommands';
import { runCalculation, type CalculationResult } from '../cliCalculationRunner';
import { loadSession, saveSession, type SessionData } from '../cliSession';

type HistoryItem =
  | { type: 'welcome' }
  | { type: 'help' }
  | { type: 'input'; content: string }
  | { type: 'result'; data: CalculationResult }
  | { type: 'info'; content: string }
  | { type: 'error'; content: string }
  | { type: 'command'; content: string };

interface AppProps {
  initialApiUrl?: string;
  localOnly?: boolean;
}

export const App: React.FC<AppProps> = ({ initialApiUrl, localOnly }) => {
  const { exit } = useApp();
  const { write: writeStdout } = useStdout();

  const [session, setSession] = useState<SessionData>(() => {
    const loaded = loadSession();
    if (localOnly) loaded.apiUrl = null;
    if (initialApiUrl) loaded.apiUrl = initialApiUrl;
    return loaded;
  });

  const [history, setHistory] = useState<HistoryItem[]>([{ type: 'welcome' }]);
  const [commandHistory, setCommandHistory] = useState<string[]>(session.commandHistory);

  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedLines, setCollectedLines] = useState<string[]>([]);
  const [expectedPackageCount, setExpectedPackageCount] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Refs for values needed in callbacks to avoid stale closures
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const commandHistoryRef = useRef(commandHistory);
  commandHistoryRef.current = commandHistory;
  const isCollectingRef = useRef(isCollecting);
  isCollectingRef.current = isCollecting;
  const collectedLinesRef = useRef(collectedLines);
  collectedLinesRef.current = collectedLines;
  const expectedPackageCountRef = useRef(expectedPackageCount);
  expectedPackageCountRef.current = expectedPackageCount;

  useEffect(() => {
    saveSession({ ...session, commandHistory });
  }, [session, commandHistory]);

  const addHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => [...prev, item]);
  }, []);

  const addToCommandHistory = useCallback((cmd: string) => {
    setCommandHistory(prev => {
      const trimmed = cmd.trim();
      if (!trimmed) return prev;
      if (prev.length > 0 && prev[prev.length - 1] === trimmed) return prev;
      const updated = [...prev, trimmed];
      return updated.length > 50 ? updated.slice(-50) : updated;
    });
  }, []);

  const executeCalculation = useCallback(async (fullInput: string) => {
    setIsCalculating(true);
    addHistory({ type: 'input', content: fullInput });

    const s = sessionRef.current;
    const result = await runCalculation(fullInput, s.mode, s.apiUrl, s.transitPackages);

    addHistory({ type: 'result', data: result });

    if (result.success && result.mode === 'time' && result.updatedTransit) {
      setSession(prev => ({ ...prev, transitPackages: result.updatedTransit! }));
      if (result.renamedPackages && result.renamedPackages.length > 0) {
        const renames = result.renamedPackages.map(r => `${r.oldId} → ${r.newId}`).join(', ');
        addHistory({ type: 'info', content: `Renamed packages: ${renames}` });
      }
    }

    setIsCalculating(false);
  }, [addHistory]);

  const handleCancelInput = useCallback(() => {
    if (isCollectingRef.current) {
      setIsCollecting(false);
      setCollectedLines([]);
      setExpectedPackageCount(null);
      addHistory({ type: 'info', content: 'Input cancelled' });
    }
  }, [addHistory]);

  const handleEditLine = useCallback((index: number, newValue: string) => {
    setCollectedLines(prev => {
      const updated = [...prev];
      updated[index] = newValue.trim();
      return updated;
    });
  }, []);

  const handleSubmit = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // If currently collecting multi-line input
    if (isCollectingRef.current) {
      const newLines = [...collectedLinesRef.current, trimmed];
      setCollectedLines(newLines);
      collectedLinesRef.current = newLines;

      const mode = sessionRef.current.mode;
      const pkgCount = expectedPackageCountRef.current!;
      const totalExpected = mode === 'cost' ? pkgCount + 1 : pkgCount + 2;

      if (newLines.length >= totalExpected) {
        setIsCollecting(false);
        isCollectingRef.current = false;
        setCollectedLines([]);
        collectedLinesRef.current = [];
        setExpectedPackageCount(null);
        expectedPackageCountRef.current = null;
        const fullInput = newLines.join('\n');
        addToCommandHistory(fullInput);
        executeCalculation(fullInput);
      }
      return;
    }

    // If input contains newlines (e.g. from history), execute directly
    if (trimmed.includes('\n')) {
      addToCommandHistory(trimmed);
      executeCalculation(trimmed);
      return;
    }

    // Check if it's a command
    const action = processCommand(trimmed);
    if (action) {
      addToCommandHistory(trimmed);

      switch (action.type) {
        case 'clear':
          writeStdout('\x1B[2J\x1B[3J\x1B[H');
          setHistory([{ type: 'welcome' }]);
          break;

        case 'help':
          addHistory({ type: 'command', content: trimmed });
          addHistory({ type: 'help' });
          break;

        case 'change_mode':
          addHistory({ type: 'command', content: trimmed });
          setSession(prev => ({ ...prev, mode: action.mode }));
          addHistory({ type: 'info', content: `Mode changed to ${action.mode}` });
          break;

        case 'exit':
          exit();
          break;
      }
      return;
    }

    // Not a command — parse header and start collecting
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      addHistory({ type: 'error', content: 'Header line requires: base_delivery_cost no_of_packages' });
      return;
    }

    const packageCount = parseInt(parts[1], 10);
    if (isNaN(packageCount) || packageCount <= 0) {
      addHistory({ type: 'error', content: 'Invalid package count in header' });
      return;
    }

    setCollectedLines([trimmed]);
    collectedLinesRef.current = [trimmed];
    setExpectedPackageCount(packageCount);
    expectedPackageCountRef.current = packageCount;
    setIsCollecting(true);
    isCollectingRef.current = true;
  }, [addHistory, addToCommandHistory, executeCalculation]);

  const getExpectedTotalLines = () => {
    if (!expectedPackageCount) return null;
    return session.mode === 'cost'
      ? expectedPackageCount + 1
      : expectedPackageCount + 2;
  };

  return (
    <Box flexDirection="column">
      {history.map((item, i) => {
        switch (item.type) {
          case 'welcome':
            return <WelcomeScreen key={i} mode={session.mode} />;
          case 'help':
            return <HelpScreen key={i} />;
          case 'input':
            return (
              <Box key={i} flexDirection="column" marginTop={1} marginBottom={1}>
                {item.content.split('\n').map((line, j) => (
                  <Text key={j} color={colors.dimWhite}>{line}</Text>
                ))}
              </Box>
            );
          case 'result':
            return item.data.success ? (
              <Box key={i} marginTop={1} marginBottom={1}>
                <ResultCard mode={item.data.mode} results={item.data.results} renamedPackages={item.data.renamedPackages} />
              </Box>
            ) : (
              <Box key={i} marginTop={1} marginBottom={1}>
                <ErrorDisplay error={item.data.error} />
              </Box>
            );
          case 'info':
            return (
              <Box key={i} marginTop={1} marginBottom={1}>
                <Text color={colors.cyan}>ℹ {item.content}</Text>
              </Box>
            );
          case 'error':
            return (
              <Box key={i} marginTop={1} marginBottom={1}>
                <ErrorDisplay error={item.content} />
              </Box>
            );
          case 'command':
            return (
              <Box key={i} marginBottom={1}>
                <Text color={colors.muted}>❯ {item.content}</Text>
              </Box>
            );
          default:
            return null;
        }
      })}

      <Box marginTop={1} flexDirection="column">
        {isCalculating ? (
          <Text color={colors.amber}>⏳ Calculating...</Text>
        ) : (
          <InputPrompt
            mode={session.mode}
            isCollecting={isCollecting}
            currentLine={collectedLines.length + 1}
            expectedLines={getExpectedTotalLines()}
            collectedLines={collectedLines}
            onSubmit={handleSubmit}
            onCancel={handleCancelInput}
            onEditLine={handleEditLine}
            history={commandHistory}
            transitCount={session.transitPackages.length}
          />
        )}
      </Box>
    </Box>
  );
};
