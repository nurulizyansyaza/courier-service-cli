import {
  handleCancel,
  handleReturn,
  handleLeftArrow,
  handleRightArrow,
  handleUpArrow,
  handleDownArrow,
  handleTextInput,
  handleBackspace,
  type InputHandlerDeps,
} from '../src/ui/inputHandlers';

function createMockDeps(overrides?: Partial<InputHandlerDeps>): InputHandlerDeps {
  const deps: InputHandlerDeps = {
    valueRef: { current: '' },
    cursorPosRef: { current: 0 },
    historyIndexRef: { current: -1 },
    draftRef: { current: '' },
    editingLineIndexRef: { current: -1 },
    isCollectingRef: { current: false },
    collectedLinesRef: { current: [] },
    historyRef: { current: [] },
    onSubmitRef: { current: jest.fn() },
    onCancelRef: { current: jest.fn() },
    onEditLineRef: { current: jest.fn() },
    onPasteRef: { current: jest.fn() },
    setValueAndCursor: jest.fn(),
    setCursorPos: jest.fn(),
    setHistoryIndex: jest.fn(),
    setDraft: jest.fn(),
    setEditingLineIndex: jest.fn(),
    resetState: jest.fn(),
    ...overrides,
  };
  return deps;
}

describe('inputHandlers', () => {
  describe('handleCancel', () => {
    it('should reset state and call onCancel', () => {
      const deps = createMockDeps();
      handleCancel(deps);
      expect(deps.resetState).toHaveBeenCalled();
      expect(deps.onCancelRef.current).toHaveBeenCalled();
    });
  });

  describe('handleReturn', () => {
    it('should submit value when not editing a collected line', () => {
      const deps = createMockDeps();
      handleReturn(deps, 'hello', -1);
      expect(deps.onSubmitRef.current).toHaveBeenCalledWith('hello');
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('', 0);
    });

    it('should edit the line when editing a collected line', () => {
      const deps = createMockDeps();
      handleReturn(deps, 'edited', 2);
      expect(deps.onEditLineRef.current).toHaveBeenCalledWith(2, 'edited');
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(-1);
      expect(deps.onSubmitRef.current).not.toHaveBeenCalled();
    });
  });

  describe('handleLeftArrow', () => {
    it('should move cursor left by one', () => {
      const deps = createMockDeps();
      handleLeftArrow(deps, 'hello', 3, -1, false, []);
      expect(deps.setCursorPos).toHaveBeenCalledWith(2);
    });

    it('should not move cursor below 0', () => {
      const deps = createMockDeps();
      handleLeftArrow(deps, 'hello', 0, -1, false, []);
      expect(deps.setCursorPos).toHaveBeenCalledWith(0);
    });

    it('should navigate to last collected line when at start in collecting mode', () => {
      const deps = createMockDeps({
        collectedLinesRef: { current: ['line1', 'line2'] },
      });
      handleLeftArrow(deps, 'current', 0, -1, true, ['line1', 'line2']);
      expect(deps.setDraft).toHaveBeenCalledWith('current');
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(1);
    });

    it('should navigate to previous collected line when editing', () => {
      const deps = createMockDeps({
        collectedLinesRef: { current: ['line1', 'line2'] },
      });
      handleLeftArrow(deps, 'line2', 0, 1, true, ['line1', 'line2']);
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(0);
    });
  });

  describe('handleRightArrow', () => {
    it('should move cursor right by one', () => {
      const deps = createMockDeps();
      handleRightArrow(deps, 'hello', 2, -1, false, []);
      expect(deps.setCursorPos).toHaveBeenCalledWith(3);
    });

    it('should not move cursor beyond text length', () => {
      const deps = createMockDeps();
      handleRightArrow(deps, 'hi', 2, -1, false, []);
      expect(deps.setCursorPos).toHaveBeenCalledWith(2);
    });

    it('should navigate to next collected line when at end of editing', () => {
      const deps = createMockDeps({
        collectedLinesRef: { current: ['line1', 'line2', 'line3'] },
      });
      handleRightArrow(deps, 'line1', 5, 0, true, ['line1', 'line2', 'line3']);
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(1);
    });

    it('should return to draft when at end of last collected line', () => {
      const deps = createMockDeps({
        draftRef: { current: 'my draft' },
        collectedLinesRef: { current: ['line1', 'line2'] },
      });
      handleRightArrow(deps, 'line2', 5, 1, true, ['line1', 'line2']);
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(-1);
    });
  });

  describe('handleUpArrow', () => {
    it('should navigate to last collected line when collecting', () => {
      const deps = createMockDeps({
        collectedLinesRef: { current: ['line1', 'line2'] },
      });
      handleUpArrow(deps, 'current', 0, -1, true, ['line1', 'line2'], -1, []);
      expect(deps.setDraft).toHaveBeenCalledWith('current');
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(1);
    });

    it('should navigate to previous collected line when editing', () => {
      const deps = createMockDeps({
        collectedLinesRef: { current: ['line1', 'line2'] },
      });
      handleUpArrow(deps, 'line2', 0, 1, true, ['line1', 'line2'], -1, []);
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(0);
    });

    it('should navigate command history when not collecting', () => {
      const deps = createMockDeps();
      handleUpArrow(deps, '', 0, -1, false, [], -1, ['cmd1', 'cmd2']);
      expect(deps.setHistoryIndex).toHaveBeenCalledWith(1);
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('cmd2', 4);
    });

    it('should save draft when entering history', () => {
      const deps = createMockDeps();
      handleUpArrow(deps, 'my draft', 0, -1, false, [], -1, ['cmd1']);
      expect(deps.setDraft).toHaveBeenCalledWith('my draft');
    });

    it('should move cursor up in multiline text', () => {
      const deps = createMockDeps();
      // "ab\ncd" cursor at position 4 (col 1 of line 1) => should move to col 1 of line 0
      handleUpArrow(deps, 'ab\ncd', 4, -1, false, [], -1, []);
      expect(deps.setCursorPos).toHaveBeenCalledWith(1);
    });
  });

  describe('handleDownArrow', () => {
    it('should navigate to next collected line when editing', () => {
      const deps = createMockDeps({
        collectedLinesRef: { current: ['line1', 'line2', 'line3'] },
      });
      handleDownArrow(deps, 'line1', 0, 0, true, ['line1', 'line2', 'line3'], -1, []);
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(1);
    });

    it('should return to draft when at last collected line', () => {
      const deps = createMockDeps({
        draftRef: { current: 'draft' },
        collectedLinesRef: { current: ['line1', 'line2'] },
      });
      handleDownArrow(deps, 'line2', 0, 1, true, ['line1', 'line2'], -1, []);
      expect(deps.setEditingLineIndex).toHaveBeenCalledWith(-1);
    });

    it('should navigate forward through command history', () => {
      const deps = createMockDeps();
      handleDownArrow(deps, 'cmd1', 0, -1, false, [], 0, ['cmd1', 'cmd2']);
      expect(deps.setHistoryIndex).toHaveBeenCalledWith(1);
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('cmd2', 4);
    });

    it('should restore draft when reaching end of history', () => {
      const deps = createMockDeps({
        draftRef: { current: 'my draft' },
      });
      handleDownArrow(deps, 'cmd1', 0, -1, false, [], 0, ['cmd1']);
      expect(deps.setHistoryIndex).toHaveBeenCalledWith(-1);
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('my draft', 8);
    });

    it('should move cursor down in multiline text', () => {
      const deps = createMockDeps();
      // "ab\ncd" cursor at position 1 (col 1 of line 0) => should move to col 1 of line 1
      handleDownArrow(deps, 'ab\ncd', 1, -1, false, [], -1, []);
      expect(deps.setCursorPos).toHaveBeenCalledWith(4);
    });
  });

  describe('handleTextInput', () => {
    it('should insert text at cursor position', () => {
      const deps = createMockDeps();
      handleTextInput(deps, 'x', 'hello', 2);
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('hexllo', 3);
    });

    it('should append text at end', () => {
      const deps = createMockDeps();
      handleTextInput(deps, '!', 'hello', 5);
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('hello!', 6);
    });

    it('should detect pasted multiline input and call onPaste', () => {
      const deps = createMockDeps();
      handleTextInput(deps, '100 2\npkg1 50 30 ofr001', '', 0);
      expect(deps.onPasteRef.current).toHaveBeenCalled();
      expect(deps.resetState).toHaveBeenCalled();
    });

    it('should handle carriage return in paste', () => {
      const deps = createMockDeps();
      handleTextInput(deps, '100 2\rpkg1 50 30 ofr001', '', 0);
      expect(deps.onPasteRef.current).toHaveBeenCalled();
    });
  });

  describe('handleBackspace', () => {
    it('should delete character before cursor', () => {
      const deps = createMockDeps();
      handleBackspace(deps, 'hello', 3);
      expect(deps.setValueAndCursor).toHaveBeenCalledWith('helo', 2);
    });

    it('should not delete when cursor is at position 0', () => {
      const deps = createMockDeps();
      handleBackspace(deps, 'hello', 0);
      expect(deps.setValueAndCursor).not.toHaveBeenCalled();
    });
  });
});
