import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { TransitPackage } from './types';

export interface SessionData {
  mode: 'cost' | 'time';
  apiUrl: string | null;
  transitPackages: TransitPackage[];
  commandHistory: string[];
}

const SESSION_FILE = path.join(os.homedir(), '.courier-cli-session.json');
const MAX_HISTORY = 50;

const DEFAULT_SESSION: SessionData = {
  mode: 'cost',
  apiUrl: 'http://localhost:3000',
  transitPackages: [],
  commandHistory: [],
};

export function loadSession(): SessionData {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const raw = fs.readFileSync(SESSION_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        mode: data.mode === 'time' ? 'time' : 'cost',
        apiUrl: typeof data.apiUrl === 'string' ? data.apiUrl : DEFAULT_SESSION.apiUrl,
        transitPackages: Array.isArray(data.transitPackages) ? data.transitPackages : [],
        commandHistory: Array.isArray(data.commandHistory) ? data.commandHistory.slice(-MAX_HISTORY) : [],
      };
    }
  } catch { /* corrupted file, use defaults */ }
  return { ...DEFAULT_SESSION };
}

export function saveSession(session: SessionData): void {
  try {
    const data = {
      ...session,
      commandHistory: session.commandHistory.slice(-MAX_HISTORY),
    };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch { /* ignore write failures */ }
}

export function clearSession(): void {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch { /* ignore */ }
}
