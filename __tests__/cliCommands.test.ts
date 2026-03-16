import { processCommand, isCommand } from '../src/cliCommands';

describe('processCommand', () => {
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
    expect(processCommand('/connect')).toBeNull();
    expect(processCommand('/disconnect')).toBeNull();
  });

  test('exit command', () => {
    expect(processCommand('exit')).toEqual({ type: 'exit' });
    expect(processCommand('EXIT')).toEqual({ type: 'exit' });
    expect(processCommand('quit')).toEqual({ type: 'exit' });
  });

  test('trims whitespace', () => {
    expect(processCommand('  help  ')).toEqual({ type: 'help' });
    expect(processCommand('  clear  ')).toEqual({ type: 'clear' });
  });
});

describe('isCommand', () => {
  test('returns true for commands', () => {
    expect(isCommand('help')).toBe(true);
    expect(isCommand('clear')).toBe(true);
    expect(isCommand('/change mode cost')).toBe(true);
    expect(isCommand('/restart')).toBe(true);
    expect(isCommand('exit')).toBe(true);
  });

  test('returns false for non-commands', () => {
    expect(isCommand('100 3')).toBe(false);
    expect(isCommand('PKG1 5 5 OFR001')).toBe(false);
  });
});
