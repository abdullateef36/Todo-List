# To-Do List App

A clean, feature-rich To-Do List app built with **React Native** and **Expo**. It supports core task management, voice input via a Floating Action Button (FAB), and a set of bonus features (due dates, search/filter, themes, animations, unit tests) — all built with TypeScript.

This project was developed against the AAIR Labs Developer Exercise requirements and implements every core feature plus several bonus features.

---

## Core Features (per the exercise requirements)

1. **Task Management**
   - Add new tasks with a **title** and an optional **description**
   - Mark tasks as **completed / incomplete**
   - **Delete** tasks (with a confirmation prompt)
2. **Task Display**
   - View a list of **all tasks**
   - Completed and incomplete tasks are visually distinct (checked box, strikethrough, muted color, overdue label)
3. **Data Persistence**
   - Tasks persist between app launches using **AsyncStorage**
4. **Navigation**
   - React Navigation (native-stack) switching between two screens:
     - **Task List Screen**
     - **Add Task Screen** (also supports editing an existing task)
5. **Basic UI/UX**
   - Simple, clean layout with a light/dark theme
   - Edge cases handled: empty task title is blocked, empty list shows a friendly empty state
6. **Voice Input via FAB**
   - A Floating Action Button activates **voice input mode**
   - Speech is recorded and transcribed to text using a speech-to-text API
   - Transcribed text is automatically added as tasks
   - Multiple dictated tasks in natural language are intelligently split into separate tasks
     - e.g. "Buy provisions and call mom" → `["Buy provisions", "Call mom"]`

## Bonus Features

- **Due Dates & Sorting** — Set a due date per task; tasks are sorted by due date (earliest first), with overdue tasks flagged
- **Search & Filter** — Search by title/description; filter by All / Active / Completed
- **Light / Dark Theme** — Toggle between themes (preference persists)
- **Animations** — Transitions, checkbox bounce, voice-input pulse, theme-toggle rotation
- **Unit Tests** — Jest tests for the pure utility functions (see [Testing](#testing))
- **TypeScript** — Full type safety throughout the codebase

---

## Screenshots

> These are captures of the actual app build running on a device/emulator.

### Task List Screen — Empty State
![Empty State](screenshots/task-list-empty.jpg)

### Task List Screen — With a Mix of Completed and Incomplete Tasks
![Task List](screenshots/task-list-with-tasks.jpg)

### Add Task Screen
![Add Task](screenshots/add-task-screen.jpg)

### Voice Input Mode (FAB Active / Listening)
![Voice Input](screenshots/voice-input.jpg)

### Dark Theme
![Dark Theme](screenshots/dark-theme.jpg)

---

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- npm
- The **Expo Go** app (to run on a physical device) or an Android/iOS emulator

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Todo-List

# Install dependencies
npm install

# Start the development server
npm start
```

Scan the QR code with the Expo Go app to run on your physical device.

### Running on Platform

```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Run the Unit Tests

```bash
npm test
```

---

## Voice Input

Voice input uses **Groq's free API** for speech-to-text (Whisper) and task splitting (Llama). The API key is built into the app (`constants/config.ts`), so **voice input works out of the box with no setup** — just tap the microphone FAB and speak.

> To use your own key instead, replace the value of `DEFAULT_GROQ_API_KEY` in `constants/config.ts` with a key from [console.groq.com](https://console.groq.com) (free, no credit card required).

The voice input intelligently splits natural language into separate tasks:

- "Buy groceries and call mom" → `["Buy groceries", "Call mom"]`
- "Finish the report, then email the team" → `["Finish the report", "Email the team"]`

---

## Project Structure

```
├── App.tsx                    # Root component, splash screen, theme + navigation
├── index.ts                   # Entry point
├── app.json                   # Expo configuration (incl. microphone permissions)
├── components/                # Reusable UI components
│   ├── FAB.tsx                # Floating Action Button (voice input)
│   ├── TaskItem.tsx           # Individual task row
│   ├── SearchBar.tsx          # Search input
│   ├── ThemeToggle.tsx        # Light/dark theme toggle
│   └── VoiceInputModal.tsx    # Voice recording modal
├── constants/
│   ├── config.ts               # Default Groq API key
│   └── theme.ts                # Theme definitions (light/dark)
├── context/
│   └── ThemeContext.tsx       # Theme context provider
├── hooks/
│   ├── useTasks.ts            # Task CRUD operations
│   ├── useTheme.ts            # Theme management
│   └── useVoiceInput.ts       # Voice recording & transcription
├── screens/
│   ├── TaskListScreen.tsx     # Main task list screen
│   └── AddTaskScreen.tsx      # Add/edit task screen
├── types/
│   └── task.ts                # Task type definition
├── utils/
│   ├── storage.ts             # AsyncStorage utilities
│   ├── groq.ts                # Groq API (Whisper + Llama)
│   └── voiceUtils.ts          # Voice processing utilities
├── __tests__/
│   └── voiceUtils.test.ts     # Unit tests for utility functions
├── tsconfig.json              # App TypeScript config
└── tsconfig.test.json         # TypeScript config for tests
```

---

## Technologies Used

- **React Native** 0.86 — Cross-platform mobile framework
- **Expo** 57 — Development platform and tooling
- **React Navigation** 7 — Navigation library
- **AsyncStorage** — Local data persistence
- **Expo Audio** — Audio recording for voice input
- **Groq API** — Free Whisper (speech-to-text) and Llama (task splitting) models
- **Jest / ts-jest** — Unit testing
- **TypeScript** — Type safety

---

## License

MIT