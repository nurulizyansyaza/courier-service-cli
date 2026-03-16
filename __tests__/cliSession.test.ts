import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadSession, saveSession, clearSession, type SessionData } from '../src/cliSession';

const SESSION_FILE = path.join(os.homedir(), '.courier-cli-session.json');

describe('cliSession', () => {
  const backupPath = SESSION_FILE + '.test-backup';

  beforeAll(() => {
    // Back up existing session file
    if (fs.existsSync(SESSION_FILE)) {
      fs.copyFileSync(SESSION_FILE, backupPath);
    }
  });

  afterAll(() => {
    // Restore original session file
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, SESSION_FILE);
      fs.unlinkSync(backupPath);
    } else {
      // Remove test session file
      if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
      }
    }
  });

  beforeEach(() => {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  });

  test('loadSession returns defaults when no file exists', () => {
    const session = loadSession();
    expect(session.mode).toBe('cost');
    expect(session.apiUrl).toBe('http://localhost:3000');
    expect(session.transitPackages).toEqual([]);
    expect(session.commandHistory).toEqual([]);
  });

  test('saveSession and loadSession roundtrip', () => {
    const data: SessionData = {
      mode: 'time',
      apiUrl: 'http://localhost:4000',
      transitPackages: [{ id: 'PKG1', weight: 10, distance: 20, offerCode: 'OFR001' }],
      commandHistory: ['100 3', 'help'],
    };
    saveSession(data);
    const loaded = loadSession();
    expect(loaded.mode).toBe('time');
    expect(loaded.apiUrl).toBe('http://localhost:4000');
    expect(loaded.transitPackages).toHaveLength(1);
    expect(loaded.commandHistory).toEqual(['100 3', 'help']);
  });

  test('clearSession removes file', () => {
    saveSession({
      mode: 'cost',
      apiUrl: null,
      transitPackages: [],
      commandHistory: [],
    });
    expect(fs.existsSync(SESSION_FILE)).toBe(true);
    clearSession();
    expect(fs.existsSync(SESSION_FILE)).toBe(false);
  });

  test('loadSession handles corrupted file gracefully', () => {
    fs.writeFileSync(SESSION_FILE, 'not json!!', 'utf-8');
    const session = loadSession();
    expect(session.mode).toBe('cost');
  });

  test('command history capped at 50', () => {
    const history = Array.from({ length: 60 }, (_, i) => `cmd${i}`);
    saveSession({
      mode: 'cost',
      apiUrl: null,
      transitPackages: [],
      commandHistory: history,
    });
    const loaded = loadSession();
    expect(loaded.commandHistory.length).toBeLessThanOrEqual(50);
  });
});
