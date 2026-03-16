import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from './theme';
import { WelcomeScreen } from './WelcomeScreen';
import { HelpScreen } from './HelpScreen';
import { StatusBar } from './StatusBar';
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
  const [session, setSession] = useState<SessionData>(() => {
    const loaded = loadSession();
    if (localOnly) loaded.apiUrl = null;
    if (initialApiUrl) loaded.apiUrl = initialApiUrl;
    return loaded;
  });

  const [history, setHistory] = useState<HistoryItem[]>([{ type: 'welcome' }]);
  const [commandHistory, setCommandHistory] = useState<string[]>(session.commandHistory);

  // Multi-line input collection state
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedLines, setCollectedLines] = useState<string[]>([]);
  const [expectedPackageCount, setExpectedPackageCount] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Save session on state changes
  useEffect(() => {
    saveSession({
      ...session,
      commandHistory,
    });
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

    const result = await runCalculation(
      fullInput,
      session.mode,
      session.apiUrl,
      session.transitPackages,
    );

    addHistory({ type: 'result', data: result });

    if (result.success && result.mode === 'time' && result.updatedTransit) {
      setSession(prev => ({ ...prev, transitPackages: result.updatedTransit! }));
      if (result.renamedPackages && result.renamedPackages.length > 0) {
        const renames = result.renamedPackages
          .map(r => `${r.oldId} → ${r.newId}`)
          .join(', ');
        addHistory({ type: 'info', content: `Renamed packages: ${renames}` });
      }
    }

    setIsCalculating(false);
  }, [session, addHistory]);

  const handleHeaderLine = useCallback((line: string) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) {
      addHistory({ type: 'error', content: 'Header line requires: base_delivery_cost no_of_packages' });
      return;
    }

    const packageCount = parseInt(parts[1], 10);
    if (isNaN(packageCount) || packageCount <= 0) {
      addHistory({ type: 'error', content: 'Invalid package count in header' });
      return;
    }

    setCollectedLines([line.trim()]);
    setExpectedPackageCount(packageCount);
    setIsCollecting(true);
  }, [addHistory]);

  const handleCollectedLine = useCallback((line: string) => {
    const newLines = [...collectedLines, line.trim()];
    setCollectedLines(newLines);

    const totalExpected = session.mode === 'cost'
      ? (expectedPackageCount! + 1)   // header + packages
      : (expectedPackageCount! + 2);  // header + packages + fleet

    if (newLines.length >= totalExpected) {
      setIsCollecting(false);
      setCollectedLines([]);
      setExpectedPackageCount(null);
      const fullInput = newLines.join('\n');
      addToCommandHistory(fullInput);
      executeCalculation(fullInput);
    }
  }, [collectedLines, expectedPackageCount, session.mode, addToCommandHistory, executeCalculation]);

  const handleCancelInput = useCallback(() => {
    if (isCollecting) {
      setIsCollecting(false);
      setCollectedLines([]);
      setExpectedPackageCount(null);
      addHistory({ type: 'info', content: 'Input cancelled' });
    }
  }, [isCollecting, addHistory]);

  const handleSubmit = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (isCollecting) {
      handleCollectedLine(trimmed);
      return;
    }

    // Check if it's a command
    const action = processCommand(trimmed);
    if (action) {
      addToCommandHistory(trimmed);
      addHistory({ type: 'command', content: trimmed });

      switch (action.type) {
        case 'clear':
          setHistory([]);
          break;

        case 'help':
          addHistory({ type: 'help' });
          break;

        case 'restart':
          setHistory([{ type: 'welcome' }]);
          break;

        case 'change_mode':
          setSession(prev => ({ ...prev, mode: action.mode }));
          addHistory({
            type: 'info',
            content: `Mode changed to ${action.mode}`,
          });
          break;
      }
      return;
    }

    // Not a command — start collecting multi-line input
    handleHeaderLine(trimmed);
  }, [isCollecting, addHistory, addToCommandHistory, handleHeaderLine, handleCollectedLine]);

  const getExpectedTotalLines = () => {
    if (!expectedPackageCount) return null;
    return session.mode === 'cost'
      ? expectedPackageCount + 1
      : expectedPackageCount + 2;
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      {history.map((item, i) => {
        switch (item.type) {
          case 'welcome':
            return <WelcomeScreen key={i} mode={session.mode} />;
          case 'help':
            return <HelpScreen key={i} />;
          case 'input':
            return (
              <Box key={i} flexDirection="column">
                {item.content.split('\n').map((line, j) => (
                  <Text key={j} color={colors.dimWhite}>  {line}</Text>
                ))}
              </Box>
            );
          case 'result':
            return item.data.success ? (
              <ResultCard key={i} mode={item.data.mode} results={item.data.results} renamedPackages={item.data.renamedPackages} />
            ) : (
              <ErrorDisplay key={i} error={item.data.error} />
            );
          case 'info':
            return (
              <Box key={i} marginBottom={1}>
                <Text color={colors.cyan}>ℹ {item.content}</Text>
              </Box>
            );
          case 'error':
            return <ErrorDisplay key={i} error={item.content} />;
          case 'command':
            return (
              <Box key={i}>
                <Text color={colors.muted}>❯ {item.content}</Text>
              </Box>
            );
          default:
            return null;
        }
      })}

      <StatusBar
        mode={session.mode}
        transitCount={session.transitPackages.length}
      />

      {isCalculating ? (
        <Box>
          <Text color={colors.amber}>⏳ Calculating...</Text>
        </Box>
      ) : (
        <InputPrompt
          mode={session.mode}
          isCollecting={isCollecting}
          currentLine={collectedLines.length + 1}
          expectedLines={getExpectedTotalLines()}
          onSubmit={handleSubmit}
          onCancel={handleCancelInput}
          history={commandHistory}
        />
      )}
    </Box>
  );
};
