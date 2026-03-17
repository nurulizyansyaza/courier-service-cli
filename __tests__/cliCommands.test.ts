import { processCommand } from '../src/cliCommands';

describe('processCommand', () => {
  describe('clear command', () => {
    it('recognizes clear', () => {
      expect(processCommand('clear')).toEqual({ type: 'clear' });
    });

    it('is case-insensitive', () => {
      expect(processCommand('CLEAR')).toEqual({ type: 'clear' });
    });
  });

  describe('help command', () => {
    it('recognizes help', () => {
      expect(processCommand('help')).toEqual({ type: 'help' });
    });

    it('is case-insensitive', () => {
      expect(processCommand('HELP')).toEqual({ type: 'help' });
    });
  });

  describe('exit command', () => {
    it('recognizes exit', () => {
      expect(processCommand('exit')).toEqual({ type: 'exit' });
    });

    it('recognizes quit as alias', () => {
      expect(processCommand('quit')).toEqual({ type: 'exit' });
    });

    it('is case-insensitive', () => {
      expect(processCommand('EXIT')).toEqual({ type: 'exit' });
    });
  });

  describe('/change mode command', () => {
    it('switches to cost mode', () => {
      expect(processCommand('/change mode cost')).toEqual({ type: 'change_mode', mode: 'cost' });
    });

    it('switches to time mode', () => {
      expect(processCommand('/change mode time')).toEqual({ type: 'change_mode', mode: 'time' });
    });

    it('returns error for invalid mode', () => {
      const result = processCommand('/change mode invalid');
      expect(result).toEqual({ type: 'error', message: 'Usage: /change mode cost | time' });
    });
  });

  describe('incomplete or unknown slash commands', () => {
    it('returns error for incomplete /change command', () => {
      const result = processCommand('/change');
      expect(result).toEqual({ type: 'error', message: 'Usage: /change mode cost | time' });
    });

    it('returns error for partial /change mode', () => {
      const result = processCommand('/change mod');
      expect(result).toEqual({ type: 'error', message: 'Usage: /change mode cost | time' });
    });

    it('returns error for /change mode without value', () => {
      const result = processCommand('/change mode');
      expect(result).toEqual({ type: 'error', message: 'Usage: /change mode cost | time' });
    });

    it('returns error for unknown slash commands', () => {
      const result = processCommand('/connect');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('error');
    });
  });

  describe('typo suggestions', () => {
    it('suggests "help" for "hlp"', () => {
      const result = processCommand('hlp');
      expect(result).toEqual({ type: 'error', message: 'Unknown command "hlp". Did you mean "help"?' });
    });

    it('suggests "clear" for "clera"', () => {
      const result = processCommand('clera');
      expect(result).toEqual({ type: 'error', message: 'Unknown command "clera". Did you mean "clear"?' });
    });

    it('suggests "exit" for "exti"', () => {
      const result = processCommand('exti');
      expect(result).toEqual({ type: 'error', message: 'Unknown command "exti". Did you mean "exit"?' });
    });

    it('suggests "quit" for "quite"', () => {
      const result = processCommand('quite');
      expect(result).toEqual({ type: 'error', message: 'Unknown command "quite". Did you mean "quit"?' });
    });

    it('does not suggest for unrelated input like "100 3"', () => {
      expect(processCommand('100 3')).toBeNull();
    });

    it('does not suggest for package-like input', () => {
      expect(processCommand('PKG1 5 5 OFR001')).toBeNull();
    });
  });

  describe('whitespace handling', () => {
    it('trims leading/trailing whitespace', () => {
      expect(processCommand('  help  ')).toEqual({ type: 'help' });
      expect(processCommand('  clear  ')).toEqual({ type: 'clear' });
    });
  });
});
