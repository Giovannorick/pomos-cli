# Pomos CLI 🍅

A beautiful, interactive Pomodoro timer for your terminal. Designed for focus, built for developers.

## 🚀 Features

- **Interactive UI**: Clean, responsive layout using [Ink](https://github.com/vadimdemedes/ink).
- **Multiple Modes**:
  - **Quick Timer**: Start focusing immediately with a duration command.
  - **Main Menu**: Choose from classic 25/5 or 50/10 splits, or set a custom session.
- **Smart Tracking**: Tracks your session progress and reminds you when it's break time.
- **Interactive Notifications**: Control your session directly from the notification (Start Break/Focus, Dismiss).
- **Enhanced Live Clock**: Displays your current time, timezone, and city context (e.g., `12:00 PM GMT+8 | Singapore`).
- **Global Commands**: Accessible anywhere on your machine once installed.

## 🛠 Usage

### Start Interactive Mode

Launch the main menu to select presets or custom sessions. The interactive mode provides a continuous flow with prompts between sessions.

```bash
pomos start
```

### Start Quick Timer

Skip the menu and jump straight into work. **Note**: The application will automatically exit 3 seconds after the timer finishes.

```bash
# General usage
pomos timer <duration>

# Examples:
pomos timer 10s       # Start for 10 seconds
pomos timer 25m       # Start for 25 minutes
pomos timer 1h        # Start for 1 hour
pomos timer 1h30m     # Start for 1 hour and 30 minutes
pomos timer 10m30s    # Start for 10 minutes and 30 seconds
pomos timer 1h30m10s  # Start for 1 hour 30 minutes 10 seconds
```

## ⌨️ Controls

- **`UP/DOWN`**: Navigate menus.
- **`ENTER`**: Select an option.
- **`PAUSE/RESUME`**: Toggle the current timer.
- **`QUIT`**:
  - In **Quick Timer**: Exits the application immediately.
  - In **Interactive Mode**: Returns to the main menu (or exits from the menu).
- **`Ctrl+C`**: Force exit the application at any time.

## 📄 License

MIT
