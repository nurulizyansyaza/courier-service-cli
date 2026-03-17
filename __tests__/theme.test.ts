describe('colors', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('always uses dark palette', () => {
    const { colors } = require('../src/ui/theme');
    expect(colors.muted).toBe('#9ca3af');
    expect(colors.white).toBe('#fafafa');
    expect(colors.pink).toBe('#f472b6');
  });
});

describe('getColorScheme', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('always returns dark', () => {
    const { getColorScheme } = require('../src/ui/theme');
    expect(getColorScheme()).toBe('dark');
  });
});

describe('theme', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('provides chalk-based formatters', () => {
    const { theme } = require('../src/ui/theme');
    expect(theme.prompt).toBeDefined();
    expect(theme.command).toBeDefined();
    expect(theme.error).toBeDefined();
    expect(theme.info).toBeDefined();
  });
});
