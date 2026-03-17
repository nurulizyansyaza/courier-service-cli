describe('detectColorScheme', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env['COURIER_THEME'];
    delete process.env['COLORFGBG'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function loadDetect(): () => 'light' | 'dark' {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../src/ui/theme').detectColorScheme;
  }

  it('defaults to dark when no env vars set', () => {
    expect(loadDetect()()).toBe('dark');
  });

  it('returns light when COURIER_THEME=light', () => {
    process.env['COURIER_THEME'] = 'light';
    expect(loadDetect()()).toBe('light');
  });

  it('returns dark when COURIER_THEME=dark', () => {
    process.env['COURIER_THEME'] = 'dark';
    expect(loadDetect()()).toBe('dark');
  });

  it('is case-insensitive for COURIER_THEME', () => {
    process.env['COURIER_THEME'] = 'Light';
    expect(loadDetect()()).toBe('light');
  });

  it('returns light when COLORFGBG background is 15 (white)', () => {
    process.env['COLORFGBG'] = '0;15';
    expect(loadDetect()()).toBe('light');
  });

  it('returns dark when COLORFGBG background is 0 (black)', () => {
    process.env['COLORFGBG'] = '15;0';
    expect(loadDetect()()).toBe('dark');
  });

  it('COURIER_THEME takes precedence over COLORFGBG', () => {
    process.env['COURIER_THEME'] = 'dark';
    process.env['COLORFGBG'] = '0;15';
    expect(loadDetect()()).toBe('dark');
  });
});

describe('colors', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env['COURIER_THEME'];
    delete process.env['COLORFGBG'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses dark palette by default', () => {
    const { colors } = require('../src/ui/theme');
    expect(colors.muted).toBe('#9ca3af');
    expect(colors.white).toBe('#fafafa');
  });

  it('uses light palette when COURIER_THEME=light', () => {
    process.env['COURIER_THEME'] = 'light';
    const { colors } = require('../src/ui/theme');
    expect(colors.muted).toBe('#1f2937');
    expect(colors.white).toBe('#030712');
  });
});

describe('setColorScheme', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('switches colors from dark to light at runtime', () => {
    const { colors, setColorScheme, getColorScheme } = require('../src/ui/theme');
    expect(getColorScheme()).toBe('dark');
    expect(colors.muted).toBe('#9ca3af');

    setColorScheme('light');
    expect(getColorScheme()).toBe('light');
    expect(colors.muted).toBe('#1f2937');
    expect(colors.white).toBe('#030712');
  });

  it('switches colors from light back to dark at runtime', () => {
    const { colors, setColorScheme } = require('../src/ui/theme');
    setColorScheme('light');
    expect(colors.muted).toBe('#1f2937');

    setColorScheme('dark');
    expect(colors.muted).toBe('#9ca3af');
    expect(colors.white).toBe('#fafafa');
  });

  it('is a no-op when setting same scheme', () => {
    const { colors, setColorScheme, getColorScheme } = require('../src/ui/theme');
    const mutedBefore = colors.muted;
    setColorScheme('dark');
    expect(colors.muted).toBe(mutedBefore);
    expect(getColorScheme()).toBe('dark');
  });
});
