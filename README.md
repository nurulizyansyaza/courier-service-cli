# @nurulizyansyaza/courier-service-cli

Interactive terminal UI for the **Courier Service** delivery cost and time calculator. Built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal).

## Setup

### Prerequisites

- **Node.js** 18 or 20 — check with `node --version`
- **npm** — check with `npm --version`
- **courier-service-core** must be built first (see below)

### Step 1 — Build the core library first

The CLI depends on the core library. If you haven't built it yet:

```bash
cd courier-service-core
npm install
npm run build
cd ..
```

### Step 2 — Install dependencies

```bash
cd courier-service-cli
npm install
```

### Step 3 — Run the CLI

```bash
# Easiest way — local mode (no API needed)
npm start
```

This opens an interactive terminal UI. Type your input line by line, then press Enter to calculate.

### Other ways to run

```bash
# Local-only mode (no API dependency)
node bin/courier-service --local

# With API (start the API server first in another terminal)
node bin/courier-service

# Custom API URL
node bin/courier-service --api-url http://localhost:4000
```

### Running with the API server

If you want the CLI to connect to the API, you need **two terminals**:

**Terminal 1** — Start the API:

```bash
cd courier-service-api
npm run dev
```

**Terminal 2** — Start the CLI:

```bash
cd courier-service-cli
node bin/courier-service
```

The CLI will connect to the API automatically. If the API is unreachable, it falls back to local calculations.

### Step 4 — Run the tests

```bash
npm test
```

You should see all **124 tests** pass across **11 test suites**.

## Usage

The CLI launches a full terminal UI:

- Dark color theme — optimized for dark backgrounds for consistent rendering across all environments (local, Docker, SSH)
- ↑/↓ arrow keys to navigate command history
- Multi-line paste support with preview and confirmation
- API-first calculation with local fallback
- Transit package tracking across calculations
- Session persistence (mode, API URL, history saved to `~/.courier-cli-session.json`)

### Commands

| Command | Description |
|---------|-------------|
| `/change mode cost \| time` | Switch calculation mode |
| `clear` | Clear screen and show welcome |
| `help` | Show available commands |
| `exit` / `quit` | Exit the application |
| `↑` / `↓` | Navigate command history |
| `←` / `→` | Move cursor within input |
| `Ctrl+C` | Cancel current input |

### Input Format

**Cost Mode:**
```
baseCost packageCount
pkgId weight distance offerCode
...
```

**Time Mode (cost mode + fleet line):**
```
baseCost packageCount
pkgId weight distance offerCode
...
vehicleCount maxSpeed maxWeight
```

### Error Handling

Errors are validated **line by line** — the CLI shows errors for only the first problematic line, so you can fix one thing at a time:

1. **Header line** is checked first — if invalid, only header errors are shown
2. **Package lines** are checked in order — if a line has errors, all field errors on that line are shown but later lines are not checked yet
3. **Vehicle line** (time mode) is checked after all package lines pass
4. **Cross-package checks** (duplicate IDs, sequential ordering, count mismatch) run last

For example, if line 2 has an invalid offer code and line 3 has an invalid weight, you'll see only the line 2 error first. After fixing it and re-submitting, line 3's error will appear.

**Incomplete input** is also handled gracefully — entering a partial header (e.g., just `100` without a package count) shows a specific message explaining what's missing.

**Typo suggestions** — if you mistype a command (e.g., `hlp` instead of `help`, `clera` instead of `clear`), the CLI will suggest the closest matching command instead of treating the input as calculation data.

### Example

```
100 3
pkg1 50 70 ofr001
pkg2 75 70 ofr003
pkg3 100 200 ofr002
2 70 200
```

## Testing

```bash
npm test
```

You should see all **124 tests** pass across **11 test suites**:

| Suite | Tests | Description |
|-------|-------|-------------|
| `cliCommands.test.ts` | 13 | Command routing — `/change mode`, `clear`, `help`, `exit` |
| `cliCalculationRunner.test.ts` | 7 | Calculation runner — API + local fallback behavior |
| `localCalculation.test.ts` | 11 | Local calculation — cost, time, transit modes |
| `cliSession.test.ts` | 5 | Session persistence — load, save, clear session |
| `cliSession.integration.test.ts` | 8 | Integration — session file read/write/clear |
| `resultMapper.test.ts` | 6 | Result mapping — cost/time result → PackageResult |
| `inputHelpers.test.ts` | 14 | Input utilities — cursor position, paste splitting |
| `inputHandlers.test.ts` | 27 | Input handlers — keyboard navigation, paste, editing |
| `useInputCollector.test.ts` | 10 | Input collector — collecting, paste, edit line logic |
| `calculation.integration.test.ts` | 12 | Integration — end-to-end cost/time calculations |
| `theme.test.ts` | 4 | Color scheme — dark palette, theme formatters |

## Project Structure

```
src/
  cli.ts                    # Commander.js entry point
  index.ts                  # Barrel exports
  types.ts                  # Shared types (PackageResult, TransitPackage, etc.)
  cliCommands.ts            # Command routing (/change mode, clear, help, exit)
  cliCalculationRunner.ts   # API-first + local fallback orchestration
  localCalculation.ts       # Local cost/time/transit calculation logic
  cliSession.ts             # File-based session persistence (~/.courier-cli-session.json)
  resultMapper.ts           # PackageResult mapping (cost/time results)
  inputHelpers.ts           # Pure input utilities (cursor, paste, state reset)
  ui/
    App.tsx                 # Root component — history, session, input flow
    useInputCollector.ts    # Custom hook — multi-line collection and paste state
    useInputState.ts        # Custom hook — input value, cursor, history, editing state
    inputHandlers.ts        # Pure keyboard handler functions (arrows, backspace, paste)
    HistoryRenderer.tsx     # Renders history items (welcome, results, errors, info)
    InputPrompt.tsx         # Text input with mode indicator, cursor, history navigation
    ResultCard.tsx          # Per-package result display with cost breakdown
    WelcomeScreen.tsx       # ASCII art, offers table, input format guide
    HelpScreen.tsx          # Available commands display
    ErrorDisplay.tsx        # Error message display
    theme.ts                # Dark color palette — fixed dark theme for consistent rendering
bin/
  courier-service           # Executable entry point
__tests__/
  cliCommands.test.ts
  cliCalculationRunner.test.ts
  localCalculation.test.ts
  cliSession.test.ts
  cliSession.integration.test.ts
  resultMapper.test.ts
  inputHelpers.test.ts
  inputHandlers.test.ts
  useInputCollector.test.ts
  calculation.integration.test.ts
  theme.test.ts
```

## Architecture

```mermaid
graph TD
    CLI["cli.ts (Commander)"] --> App["App.tsx"]
    App --> History["HistoryRenderer.tsx"]
    App --> Prompt["InputPrompt.tsx"]
    App --> Commands["cliCommands.ts"]
    App --> Runner["cliCalculationRunner.ts"]
    App --> Collector["useInputCollector.ts"]
    Prompt --> InputState["useInputState.ts"]
    Prompt --> Handlers["inputHandlers.ts"]
    Runner -->|"API first"| API["API Server"]
    Runner -->|"local fallback"| Local["localCalculation.ts"]
    Local --> Core["courier-service-core"]
    Runner --> Mapper["resultMapper.ts"]
    Handlers --> Helpers["inputHelpers.ts"]
    History --> ResultCard["ResultCard.tsx"]
    History --> Welcome["WelcomeScreen.tsx"]
    History --> HelpScreen["HelpScreen.tsx"]
    App --> Session["cliSession.ts"]
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@nurulizyansyaza/courier-service-core` | Core calculation engine |
| `commander` | CLI argument parsing |
| `ink` | React-based terminal UI framework |
| `react` | Component model for Ink (v17) |
| `chalk` | Terminal string styling |
