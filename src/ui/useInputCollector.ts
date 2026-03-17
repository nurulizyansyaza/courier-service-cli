import { useState, useCallback, useRef } from 'react';

export interface InputCollectorState {
  isCollecting: boolean;
  collectedLines: string[];
  expectedPackageCount: number | null;
  pastedLines: string[];
}

export interface InputCollectorAPI {
  isCollecting: boolean;
  collectedLines: string[];
  expectedPackageCount: number | null;
  pastedLines: string[];

  startCollecting: (headerLine: string, packageCount: number) => void;
  addCollectedLine: (line: string) => string[];
  resetCollecting: () => void;

  setPastedLines: (lines: string[]) => void;
  clearPastedLines: () => void;

  handleEditLine: (index: number, newValue: string) => void;

  // Refs for synchronous access
  isCollectingRef: React.MutableRefObject<boolean>;
  collectedLinesRef: React.MutableRefObject<string[]>;
  expectedPackageCountRef: React.MutableRefObject<number | null>;
  pastedLinesRef: React.MutableRefObject<string[]>;
}

export function useInputCollector(): InputCollectorAPI {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedLines, setCollectedLines] = useState<string[]>([]);
  const [expectedPackageCount, setExpectedPackageCount] = useState<number | null>(null);
  const [pastedLines, setPastedLinesState] = useState<string[]>([]);

  const isCollectingRef = useRef(isCollecting);
  isCollectingRef.current = isCollecting;
  const collectedLinesRef = useRef(collectedLines);
  collectedLinesRef.current = collectedLines;
  const expectedPackageCountRef = useRef(expectedPackageCount);
  expectedPackageCountRef.current = expectedPackageCount;
  const pastedLinesRef = useRef(pastedLines);
  pastedLinesRef.current = pastedLines;

  const startCollecting = useCallback((headerLine: string, packageCount: number) => {
    setCollectedLines([headerLine]);
    collectedLinesRef.current = [headerLine];
    setExpectedPackageCount(packageCount);
    expectedPackageCountRef.current = packageCount;
    setIsCollecting(true);
    isCollectingRef.current = true;
  }, []);

  const addCollectedLine = useCallback((line: string): string[] => {
    const newLines = [...collectedLinesRef.current, line];
    setCollectedLines(newLines);
    collectedLinesRef.current = newLines;
    return newLines;
  }, []);

  const resetCollecting = useCallback(() => {
    setIsCollecting(false);
    isCollectingRef.current = false;
    setCollectedLines([]);
    collectedLinesRef.current = [];
    setExpectedPackageCount(null);
    expectedPackageCountRef.current = null;
  }, []);

  const setPastedLines = useCallback((lines: string[]) => {
    setPastedLinesState(lines);
    pastedLinesRef.current = lines;
  }, []);

  const clearPastedLines = useCallback(() => {
    setPastedLinesState([]);
    pastedLinesRef.current = [];
  }, []);

  const handleEditLine = useCallback((index: number, newValue: string) => {
    if (pastedLinesRef.current.length > 0) {
      setPastedLinesState(prev => {
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

  return {
    isCollecting,
    collectedLines,
    expectedPackageCount,
    pastedLines,
    startCollecting,
    addCollectedLine,
    resetCollecting,
    setPastedLines,
    clearPastedLines,
    handleEditLine,
    isCollectingRef,
    collectedLinesRef,
    expectedPackageCountRef,
    pastedLinesRef,
  };
}
