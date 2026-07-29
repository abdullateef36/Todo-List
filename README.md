# Todo-List

A clean, feature-rich To-Do List app built with React Native and Expo. Supports task management, voice input via speech-to-text, search, filtering, due dates, and light/dark themes.

## Features

### Core Features
- **Task Management** — Add, edit, delete, and mark tasks as complete/incomplete
- **Task Display** — Visual distinction between completed and incomplete tasks
- **Data Persistence** — Tasks saved locally using AsyncStorage
- **Navigation** — React Navigation with Task List and Add Task screens
- **Voice Input** — FAB activates voice recording; transcribes via OpenAI Whisper and intelligently splits into separate tasks

### Bonus Features
- **Due Dates** — Set due dates and sort tasks by date
- **Search & Filter** — Search by title/description; filter by All/Active/Completed
- **Light/Dark Theme** — Toggle between themes (persists across sessions)
- **Animations** — Smooth transitions, bounce effects, and pulse animations
- **TypeScript** — Full type safety throughout the codebase

## Screenshots

### Task List Screen — Empty State
![Empty State](screenshots/task-list-empty.png)

### Task List Screen — With Tasks
![Task List](screenshots/task-list-with-tasks.png)

### Add Task Screen
![Add Task](screenshots/add-task-screen.png)

### Voice Input Mode
![Voice Input](screenshots/voice-input.png)

### Dark Theme
![Dark Theme](screenshots/dark-theme.png)

### Settings Screen
![Settings](screenshots/settings-screen.png)

## Getting Started

### Prerequisites
- Node.js >= 20.19.4
- npm or yarn
- Expo Go app (for running on device) or Android/iOS emulator

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

### Running on Device

```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

Scan the QR code with the Expo Go app to run on your physical device.

## Voice Input Setup

The voice input feature uses the OpenAI Whisper API for speech-to-text transcription. To enable it:

1. Go to [platform.openai.com](https://platform.openai.com) and create an API key
2. Open the app and tap the ⚙️ (Settings) button in the top-right corner
3. Enter your OpenAI API key (starts with `sk-`)
4. Save and start using voice input by tapping the microphone FAB

The voice input intelligently splits natural language into separate tasks. For example:
- "Buy groceries and call mom" → ["Buy groceries", "Call mom"]
- "Finish the report, then email the team" → ["Finish the report", "Email the team"]

## Project Structure

```
├── App.tsx                    # Root component, splash screen, navigation
├── index.ts                   # Entry point
├── app.json                   # Expo configuration
├── assets/                    # App icons and splash screen
├── components/                # Reusable UI components
│   ├── FAB.tsx                # Floating Action Button (voice input)
│   ├── TaskItem.tsx           # Individual task row
│   ├── SearchBar.tsx          # Search input
│   ├── ThemeToggle.tsx        # Light/dark theme toggle
│   └── VoiceInputModal.tsx    # Voice recording modal
├── constants/
│   └── theme.ts               # Theme definitions (light/dark)
├── context/
│   └── ThemeContext.tsx       # Theme context provider
├── hooks/
│   ├── useTasks.ts            # Task CRUD operations
│   ├── useTheme.ts            # Theme management
│   └── useVoiceInput.ts       # Voice recording & transcription
├── screens/
│   ├── TaskListScreen.tsx     # Main task list screen
│   ├── AddTaskScreen.tsx      # Add/edit task screen
│   └── SettingsScreen.tsx     # API key settings
├── types/
│   └── task.ts                # Task type definition
└── utils/
    ├── storage.ts             # AsyncStorage utilities
    ├── openai.ts              # OpenAI API (Whisper + GPT)
    └── voiceUtils.ts          # Voice processing utilities
```

## Technologies Used

- **React Native** 0.86 — Cross-platform mobile framework
- **Expo** 57 — Development platform and tooling
- **React Navigation** 7 — Navigation library
- **AsyncStorage** — Local data persistence
- **Expo AV** — Audio recording for voice input
- **OpenAI API** — Whisper (speech-to-text) and GPT (task splitting)
- **TypeScript** — Type safety

## License

MIT
