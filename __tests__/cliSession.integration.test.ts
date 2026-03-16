import { loadSession, saveSession, clearSession, type SessionData } from '../src/cliSession';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const SESSION_FILE = path.join(os.homedir(), '.courier-cli-session.json');

describe('CLI Session Management', () => {
  let originalContent: string | null = null;

  beforeAll(() => {
    // Back up existing session file
    try {
      originalContent = fs.readFileSync(SESSION_FILE, 'utf-8');
    } catch {
      originalContent = null;
    }
  });

  afterAll(() => {
    // Restore original session file
    if (originalContent !== null) {
      fs.writeFileSync(SESSION_FILE, originalContent, 'utf-8');
    } else {
      try { fs.unlinkSync(SESSION_FILE); } catch { /* ok */ }
    }
  });

  beforeEach(() => {
    try { fs.unlinkSync(SESSION_FILE); } catch { /* ok */ }
  });

  afterEach(() => {
    try { fs.unlinkSync(SESSION_FILE); } catch { /* ok */ }
  });

  describe('when loading a session', () => {
    it('should return default session when no file exists', () => {
      const session = loadSession();
      expect(session.mode).toBe('cost');
      expect(session.apiUrl).toBe('http://localhost:3000');
      expect(session.transitPackages).toEqual([]);
      expect(session.commandHistory).toEqual([]);
    });

    it('should load saved session data', () => {
      const data: SessionData = {
        mode: 'time',
        apiUrl: 'http://custom:4000',
        transitPackages: [{ id: 'PKG1', weight: 100, distance: 50, offerCode: 'OFR001' }],
        commandHistory: ['100 1', 'help'],
      };
      fs.writeFileSync(SESSION_FILE, JSON.stringify(data), 'utf-8');

      const loaded = loadSession();
      expect(loaded.mode).toBe('time');
      expect(loaded.apiUrl).toBe('http://custom:4000');
      expect(loaded.transitPackages).toHaveLength(1);
      expect(loaded.commandHistory).toEqual(['100 1', 'help']);
    });

    it('should use defaults for corrupted session file', () => {
      fs.writeFileSync(SESSION_FILE, 'not valid json!!!', 'utf-8');
      const loaded = loadSession();
      expect(loaded.mode).toBe('cost');
      expect(loaded.transitPackages).toEqual([]);
    });

    it('should cap command history at 50 entries', () => {
      const longHistory = Array.from({ length: 100 }, (_, i) => `cmd${i}`);
      fs.writeFileSync(SESSION_FILE, JSON.stringify({
        mode: 'cost',
        apiUrl: null,
        transitPackages: [],
        commandHistory: longHistory,
      }), 'utf-8');

      const loaded = loadSession();
      expect(loaded.commandHistory).toHaveLength(50);
      expect(loaded.commandHistory[0]).toBe('cmd50');
    });
  });

  describe('when saving a session', () => {
    it('should persist session to disk', () => {
      const data: SessionData = {
        mode: 'time',
        apiUrl: null,
        transitPackages: [],
        commandHistory: ['test'],
      };
      saveSession(data);

      const raw = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      expect(raw.mode).toBe('time');
      expect(raw.commandHistory).toEqual(['test']);
    });

    it('should cap history to 50 when saving', () => {
      const longHistory = Array.from({ length: 100 }, (_, i) => `cmd${i}`);
      saveSession({
        mode: 'cost',
        apiUrl: null,
        transitPackages: [],
        commandHistory: longHistory,
      });

      const raw = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      expect(raw.commandHistory).toHaveLength(50);
    });
  });

  describe('when clearing a session', () => {
    it('should remove the session file', () => {
      saveSession({ mode: 'cost', apiUrl: null, transitPackages: [], commandHistory: [] });
      expect(fs.existsSync(SESSION_FILE)).toBe(true);

      clearSession();
      expect(fs.existsSync(SESSION_FILE)).toBe(false);
    });

    it('should not throw if session file does not exist', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });
});
