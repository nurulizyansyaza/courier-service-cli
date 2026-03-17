import { useState, useRef, useCallback } from 'react';
import { resetInputState } from '../inputHelpers';

/**
 * Synchronise React state with a mutable ref so that
 * `useInput` callbacks always read the latest value.
 */
function syncSet<T>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  ref: React.MutableRefObject<T>,
  val: T,
) {
  setter(val);
  ref.current = val;
}

export interface InputStateAPI {
  // Current values
  value: string;
  cursorPos: number;
  historyIndex: number;
  draft: string;
  editingLineIndex: number;

  // Refs for synchronous access inside useInput
  valueRef: React.MutableRefObject<string>;
  cursorPosRef: React.MutableRefObject<number>;
  historyIndexRef: React.MutableRefObject<number>;
  draftRef: React.MutableRefObject<string>;
  editingLineIndexRef: React.MutableRefObject<number>;

  // Atomic setters
  setValueAndCursor: (val: string, pos: number) => void;
  setCursorPos: (pos: number) => void;
  setHistoryIndex: (idx: number) => void;
  setDraft: (d: string) => void;
  setEditingLineIndex: (idx: number) => void;
  resetState: () => void;
}

export function useInputState(): InputStateAPI {
  const [value, setValue] = useState('');
  const [cursorPos, setCursorPosState] = useState(0);
  const [historyIndex, setHistoryIndexState] = useState(-1);
  const [draft, setDraftState] = useState('');
  const [editingLineIndex, setEditingLineIndexState] = useState(-1);

  const valueRef = useRef(value);
  valueRef.current = value;
  const cursorPosRef = useRef(cursorPos);
  cursorPosRef.current = cursorPos;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const editingLineIndexRef = useRef(editingLineIndex);
  editingLineIndexRef.current = editingLineIndex;

  const setValueAndCursor = useCallback((val: string, pos: number) => {
    syncSet(setValue, valueRef, val);
    syncSet(setCursorPosState, cursorPosRef, pos);
  }, []);

  const setCursorPosWrapped = useCallback((pos: number) => {
    syncSet(setCursorPosState, cursorPosRef, pos);
  }, []);

  const setHistoryIndexWrapped = useCallback((idx: number) => {
    syncSet(setHistoryIndexState, historyIndexRef, idx);
  }, []);

  const setDraftWrapped = useCallback((d: string) => {
    syncSet(setDraftState, draftRef, d);
  }, []);

  const setEditingLineIndexWrapped = useCallback((idx: number) => {
    syncSet(setEditingLineIndexState, editingLineIndexRef, idx);
  }, []);

  const resetStateCallback = useCallback(() => {
    const s = resetInputState();
    syncSet(setValue, valueRef, s.value);
    syncSet(setCursorPosState, cursorPosRef, s.cursorPos);
    syncSet(setHistoryIndexState, historyIndexRef, s.historyIndex);
    syncSet(setDraftState, draftRef, s.draft);
    syncSet(setEditingLineIndexState, editingLineIndexRef, s.editingLineIndex);
  }, []);

  return {
    value,
    cursorPos,
    historyIndex,
    draft,
    editingLineIndex,
    valueRef,
    cursorPosRef,
    historyIndexRef,
    draftRef,
    editingLineIndexRef,
    setValueAndCursor,
    setCursorPos: setCursorPosWrapped,
    setHistoryIndex: setHistoryIndexWrapped,
    setDraft: setDraftWrapped,
    setEditingLineIndex: setEditingLineIndexWrapped,
    resetState: resetStateCallback,
  };
}
