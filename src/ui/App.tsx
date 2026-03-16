import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useApp } from 'ink';
import { colors } from './theme';
import { HistoryRenderer, type HistoryItem } from './HistoryRenderer';
import { InputPrompt } from './InputPrompt';
import { processCommand } from '../cliCommands';
import { runCalculation } from '../cliCalculationRunner';
import { loadSession, saveSession, type SessionData } from '../cliSession';

interface AppProps {
  initialApiUrl?: string;
  localOnly?: boolean;
}

export const App: React.FC<AppProps> = ({ initialApiUrl, localOnly }) => {
  const { exit } = useApp();

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
  const [pastedLines, setPastedLines] = useState<string[]>([]);

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
  const pastedLinesRef = useRef(pastedLines);
  pastedLinesRef.current = pastedLines;

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
      if (result.renamedPackages?.length) {
        const renames = result.renamedPackages.map(r => `${r.oldId} → ${r.newId}`).join(', ');
        addHistory({ type: 'info', content: `Renamed packages: ${renames}` });
      }
    }

    setIsCalculating(false);
  }, [addHistory]);

  const clearPastedLines = useCallback(() => {
    setPastedLines([]);
    pastedLinesRef.current = [];
  }, []);

  const resetCollecting = useCallback(() => {
    setIsCollecting(false);
    isCollectingRef.current = false;
    setCollectedLines([]);
    collectedLinesRef.current = [];
    setExpectedPackageCount(null);
    expectedPackageCountRef.current = null;
  }, []);

  const handleCancelInput = useCallback(() => {
    if (pastedLinesRef.current.length > 0) {
      clearPastedLines();
      addHistory({ type: 'info', content: 'Input cancelled' });
      return;
    }
    if (isCollectingRef.current) {
      resetCollecting();
      addHistory({ type: 'info', content: 'Input cancelled' });
    }
  }, [addHistory, clearPastedLines, resetCollecting]);

  const handleEditLine = useCallback((index: number, newValue: string) => {
    if (pastedLinesRef.current.length > 0) {
      setPastedLines(prev => {
        const updated = [...prev];
        updated[index] = newValue.trim();
        return updated;
      });
      pastedLinesRef.current = [...pastedLinesRef.current];
      pastedLinesRef.current[index] = newValue.trim();
      return;
    }
    setCollectedLines(prev => {
      const updated = [...prev];
      updated[index] = newValue.trim();
      return updated;
    });
  }, []);

  const handlePaste = useCallback((lines: string[]) => {
    setPastedLines(lines);
    pastedLinesRef.current = lines;
  }, []);

  const handlePastedSubmit = useCallback(() => {
    const lines = pastedLinesRef.current;
    clearPastedLines();
    const fullInput = lines.join('\n');
    addToCommandHistory(fullInput);
    executeCalculation(fullInput);
  }, [addToCommandHistory, executeCalculation, clearPastedLines]);

  const handleCollectedLine = useCallback((trimmed: string) => {
    const newLines = [...collectedLinesRef.current, trimmed];
    setCollectedLines(newLines);
    collectedLinesRef.current = newLines;

    const mode = sessionRef.current.mode;
    const pkgCount = expectedPackageCountRef.current!;
    const totalExpected = mode === 'cost' ? pkgCount + 1 : pkgCount + 2;

    if (newLines.length >= totalExpected) {
      resetCollecting();
      const fullInput = newLines.join('\n');
      addToCommandHistory(fullInput);
      executeCalculation(fullInput);
    }
  }, [addToCommandHistory, executeCalculation, resetCollecting]);

  const handleCommand = useCallback((trimmed: string) => {
    const action = processCommand(trimmed);
    if (!action) return false;

    addToCommandHistory(trimmed);
    switch (action.type) {
      case 'clear':
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
    return true;
  }, [addHistory, addToCommandHistory, exit]);

  const startCollecting = useCallback((trimmed: string, packageCount: number) => {
    setCollectedLines([trimmed]);
    collectedLinesRef.current = [trimmed];
    setExpectedPackageCount(packageCount);
    expectedPackageCountRef.current = packageCount;
    setIsCollecting(true);
    isCollectingRef.current = true;
  }, []);

  const handleSubmit = useCallback((value: string) => {
    const trimmed = value.trim();

    // Confirm pasted lines
    if (pastedLinesRef.current.length > 0 && !trimmed) {
      handlePastedSubmit();
      return;
    }

    if (!trimmed) return;

    // Collecting multi-line input
    if (isCollectingRef.current) {
      handleCollectedLine(trimmed);
      return;
    }

    // Multiline from history
    if (trimmed.includes('\n')) {
      addToCommandHistory(trimmed);
      executeCalculation(trimmed);
      return;
    }

    // Commands
    if (handleCommand(trimmed)) return;

    // Parse header and start collecting
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

    startCollecting(trimmed, packageCount);
  }, [addHistory, addToCommandHistory, executeCalculation, handleCommand, handleCollectedLine, handlePastedSubmit, startCollecting]);

  const getExpectedTotalLines = () => {
    if (!expectedPackageCount) return null;
    return session.mode === 'cost'
      ? expectedPackageCount + 1
      : expectedPackageCount + 2;
  };

  return (
    <Box flexDirection="column">
      <HistoryRenderer history={history} mode={session.mode} />

      <Box marginTop={1} flexDirection="column">
        {isCalculating ? (
          <Text color={colors.amber}>⏳ Calculating...</Text>
        ) : (
          <InputPrompt
            mode={session.mode}
            isCollecting={isCollecting || pastedLines.length > 0}
            currentLine={collectedLines.length + 1}
            expectedLines={getExpectedTotalLines()}
            collectedLines={pastedLines.length > 0 ? pastedLines : collectedLines}
            onSubmit={handleSubmit}
            onCancel={handleCancelInput}
            onEditLine={handleEditLine}
            onPaste={handlePaste}
            history={commandHistory}
            transitCount={session.transitPackages.length}
          />
        )}
      </Box>
    </Box>
  );
};
