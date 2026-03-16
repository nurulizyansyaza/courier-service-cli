import { processCommand, isCommand } from '../src/cliCommands';

describe('processCommand', () => {
  test('exit command', () => {
    expect(processCommand('exit')).toEqual({ type: 'exit' });
    expect(processCommand('EXIT')).toEqual({ type: 'exit' });
    expect(processCommand('quit')).toEqual({ type: 'exit' });
  });

  test('clear command', () => {
    expect(processCommand('clear')).toEqual({ type: 'clear' });
    expect(processCommand('CLEAR')).toEqual({ type: 'clear' });
  });

  test('help command', () => {
    expect(processCommand('help')).toEqual({ type: 'help' });
    expect(processCommand('HELP')).toEqual({ type: 'help' });
  });

  test('/restart command', () => {
    expect(processCommand('/restart')).toEqual({ type: 'restart' });
    expect(processCommand('/RESTART')).toEqual({ type: 'restart' });
  });

  test('/disconnect command', () => {
    expect(processCommand('/disconnect')).toEqual({ type: 'disconnect' });
  });

  test('/connect without URL', () => {
    expect(processCommand('/connect')).toEqual({ type: 'connect', url: undefined });
  });

  test('/connect with URL', () => {
    expect(processCommand('/connect http://localhost:4000')).toEqual({
      type: 'connect',
      url: 'http://localhost:4000',
    });
  });

  test('/change mode cost', () => {
    expect(processCommand('/change mode cost')).toEqual({ type: 'change_mode', mode: 'cost' });
  });

  test('/change mode time', () => {
    expect(processCommand('/change mode time')).toEqual({ type: 'change_mode', mode: 'time' });
  });

  test('/change mode invalid returns null', () => {
    expect(processCommand('/change mode invalid')).toBeNull();
  });

  test('non-command input returns null', () => {
    expect(processCommand('100 3')).toBeNull();
    expect(processCommand('PKG1 5 5 OFR001')).toBeNull();
  });

  test('trims whitespace', () => {
    expect(processCommand('  exit  ')).toEqual({ type: 'exit' });
    expect(processCommand('  help  ')).toEqual({ type: 'help' });
  });
});

describe('isCommand', () => {
  test('returns true for commands', () => {
    expect(isCommand('exit')).toBe(true);
    expect(isCommand('help')).toBe(true);
    expect(isCommand('/change mode cost')).toBe(true);
  });

  test('returns false for non-commands', () => {
    expect(isCommand('100 3')).toBe(false);
    expect(isCommand('PKG1 5 5 OFR001')).toBe(false);
  });
});
