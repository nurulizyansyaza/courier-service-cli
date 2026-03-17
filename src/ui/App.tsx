import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useApp } from 'ink';
import { colors } from './theme';
import { HistoryRenderer, type HistoryItem } from './HistoryRenderer';
import { InputPrompt } from './InputPrompt';
import { processCommand } from '../cliCommands';
import { runCalculation } from '../cliCalculationRunner';
import { loadSession, saveSession, type SessionData } from '../cliSession';
import { useInputCollector } from './useInputCollector';

interface AppProps {
  initialApiUrl?: string;
  localOnly?: boolean;
}

export const App: React.FC<AppProps> = ({ initialApiUrl, localOnly }) => {
  const { exit } = useApp();

  // Force dark background on the terminal so colors are always legible
  useEffect(() => {
    // ESC ] 11 ; rgb:RR/GG/BB ST — set terminal background (xterm/VTE/iTerm2)
    process.stdout.write('\x1b]11;rgb:0d/01/18\x07');
    // Also set via ANSI 24-bit SGR for terminals that support it
    process.stdout.write('\x1b[48;2;13;1;24m\x1b[J');
    return () => {
      // Reset background on exit
      process.stdout.write('\x1b]111\x07');
      process.stdout.write('\x1b[49m\x1b[J');
    };
  }, []);

  const [session, setSession] = useState<SessionData>(() => {
    const loaded = loadSession();
    if (localOnly) loaded.apiUrl = null;
    if (initialApiUrl) loaded.apiUrl = initialApiUrl;
    return loaded;
  });

  const [history, setHistory] = useState<HistoryItem[]>([{ type: 'welcome' }]);
  const [commandHistory, setCommandHistory] = useState<string[]>(session.commandHistory);
  const [isCalculating, setIsCalculating] = useState(false);

  const collector = useInputCollector();

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const commandHistoryRef = useRef(commandHistory);
  commandHistoryRef.current = commandHistory;

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

  const handleCancelInput = useCallback(() => {
    if (collector.pastedLinesRef.current.length > 0) {
      collector.clearPastedLines();
      addHistory({ type: 'info', content: 'Input cancelled' });
      return;
    }
    if (collector.isCollectingRef.current) {
      collector.resetCollecting();
      addHistory({ type: 'info', content: 'Input cancelled' });
    }
  }, [addHistory, collector]);

  const handlePastedSubmit = useCallback(() => {
    const lines = collector.pastedLinesRef.current;
    collector.clearPastedLines();
    const fullInput = lines.join('\n');
    addToCommandHistory(fullInput);
    executeCalculation(fullInput);
  }, [addToCommandHistory, executeCalculation, collector]);

  const handleCollectedLine = useCallback((trimmed: string) => {
    const newLines = collector.addCollectedLine(trimmed);

    const mode = sessionRef.current.mode;
    const pkgCount = collector.expectedPackageCountRef.current!;
    const totalExpected = mode === 'cost' ? pkgCount + 1 : pkgCount + 2;

    if (newLines.length >= totalExpected) {
      collector.resetCollecting();
      const fullInput = newLines.join('\n');
      addToCommandHistory(fullInput);
      executeCalculation(fullInput);
    }
  }, [addToCommandHistory, executeCalculation, collector]);

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
      case 'error':
        addHistory({ type: 'command', content: trimmed });
        addHistory({ type: 'error', content: action.message });
        break;
      case 'exit':
        exit();
        break;
    }
    return true;
  }, [addHistory, addToCommandHistory, exit]);

  const handleSubmit = useCallback((value: string) => {
    const trimmed = value.trim();

    if (collector.pastedLinesRef.current.length > 0 && !trimmed) {
      handlePastedSubmit();
      return;
    }

    if (!trimmed) return;

    if (collector.isCollectingRef.current) {
      handleCollectedLine(trimmed);
      return;
    }

    if (trimmed.includes('\n')) {
      addToCommandHistory(trimmed);
      executeCalculation(trimmed);
      return;
    }

    if (handleCommand(trimmed)) return;

    const parts = trimmed.split(/\s+/);

    if (parts.length >= 1) {
      const baseCostStr = parts[0];
      if (!/^\d+(\.\d+)?$/.test(baseCostStr) || Number(baseCostStr) <= 0) {
        addHistory({ type: 'error', content: `Base delivery cost "${baseCostStr}" must be a positive number` });
        return;
      }
    }

    if (parts.length < 2) {
      addHistory({ type: 'error', content: 'Incomplete header: expected base_delivery_cost no_of_packages (e.g. 100 3)' });
      return;
    }

    if (parts.length > 2) {
      addHistory({ type: 'error', content: `Header must have exactly 2 values (base_delivery_cost no_of_packages) but found ${parts.length}` });
      return;
    }

    const packageCount = parseInt(parts[1], 10);
    if (!/^\d+$/.test(parts[1]) || isNaN(packageCount) || packageCount < 1) {
      addHistory({ type: 'error', content: `Package count "${parts[1]}" must be a whole number greater than 0` });
      return;
    }

    collector.startCollecting(trimmed, packageCount);
  }, [addHistory, addToCommandHistory, executeCalculation, handleCommand, handleCollectedLine, handlePastedSubmit, collector]);

  const getExpectedTotalLines = () => {
    if (!collector.expectedPackageCount) return null;
    return session.mode === 'cost'
      ? collector.expectedPackageCount + 1
      : collector.expectedPackageCount + 2;
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
            isCollecting={collector.isCollecting || collector.pastedLines.length > 0}
            currentLine={collector.collectedLines.length + 1}
            expectedLines={getExpectedTotalLines()}
            collectedLines={collector.pastedLines.length > 0 ? collector.pastedLines : collector.collectedLines}
            onSubmit={handleSubmit}
            onCancel={handleCancelInput}
            onEditLine={collector.handleEditLine}
            onPaste={collector.setPastedLines}
            history={commandHistory}
            transitCount={session.transitPackages.length}
          />
        )}
      </Box>
    </Box>
  );
};
