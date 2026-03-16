import {
  getCursorLinePosition,
  splitPastedInput,
  resetInputState,
  type InputState,
} from '../src/inputHelpers';

describe('inputHelpers', () => {
  describe('getCursorLinePosition', () => {
    it('returns line 0 col 0 for empty string at position 0', () => {
      const pos = getCursorLinePosition('', 0);
      expect(pos).toEqual({ lineIndex: 0, colInLine: 0 });
    });

    it('returns correct position for single-line text', () => {
      const pos = getCursorLinePosition('hello', 3);
      expect(pos).toEqual({ lineIndex: 0, colInLine: 3 });
    });

    it('returns correct line and column for multiline text', () => {
      // "hello\nworld" → cursor at position 7 means line 1 col 1 ("o" in "world")
      const pos = getCursorLinePosition('hello\nworld', 7);
      expect(pos).toEqual({ lineIndex: 1, colInLine: 1 });
    });

    it('returns first line when cursor is at newline boundary', () => {
      // "hello\nworld" → cursor at position 5 means end of first line
      const pos = getCursorLinePosition('hello\nworld', 5);
      expect(pos).toEqual({ lineIndex: 0, colInLine: 5 });
    });

    it('handles three lines correctly', () => {
      // "ab\ncd\nef" → cursor at position 6 means line 2 col 0
      const pos = getCursorLinePosition('ab\ncd\nef', 6);
      expect(pos).toEqual({ lineIndex: 2, colInLine: 0 });
    });

    it('handles cursor at very end of text', () => {
      const pos = getCursorLinePosition('ab\ncd', 5);
      expect(pos).toEqual({ lineIndex: 1, colInLine: 2 });
    });
  });

  describe('splitPastedInput', () => {
    it('splits on newlines', () => {
      expect(splitPastedInput('line1\nline2\nline3')).toEqual(['line1', 'line2', 'line3']);
    });

    it('splits on carriage returns', () => {
      expect(splitPastedInput('line1\rline2\rline3')).toEqual(['line1', 'line2', 'line3']);
    });

    it('splits on CRLF', () => {
      expect(splitPastedInput('line1\r\nline2\r\nline3')).toEqual(['line1', 'line2', 'line3']);
    });

    it('filters out empty lines', () => {
      expect(splitPastedInput('line1\n\nline2\n\n')).toEqual(['line1', 'line2']);
    });

    it('trims whitespace from lines', () => {
      expect(splitPastedInput('  line1  \n  line2  ')).toEqual(['line1', 'line2']);
    });

    it('prepends current input to first line', () => {
      expect(splitPastedInput('line2\nline3', 'line1 ')).toEqual(['line1 line2', 'line3']);
    });

    it('returns empty array for whitespace-only input', () => {
      expect(splitPastedInput('  \n  \n  ')).toEqual([]);
    });
  });

  describe('resetInputState', () => {
    it('returns a clean initial state', () => {
      const state = resetInputState();
      expect(state).toEqual({
        value: '',
        cursorPos: 0,
        historyIndex: -1,
        draft: '',
        editingLineIndex: -1,
      });
    });
  });
});
