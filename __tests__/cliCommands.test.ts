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

    it('returns null for invalid mode', () => {
      expect(processCommand('/change mode invalid')).toBeNull();
    });
  });

  describe('non-command input', () => {
    it('returns null for package input', () => {
      expect(processCommand('100 3')).toBeNull();
      expect(processCommand('PKG1 5 5 OFR001')).toBeNull();
    });

    it('returns null for unknown slash commands', () => {
      expect(processCommand('/connect')).toBeNull();
      expect(processCommand('/disconnect')).toBeNull();
    });
  });

  describe('whitespace handling', () => {
    it('trims leading/trailing whitespace', () => {
      expect(processCommand('  help  ')).toEqual({ type: 'help' });
      expect(processCommand('  clear  ')).toEqual({ type: 'clear' });
    });
  });
});
