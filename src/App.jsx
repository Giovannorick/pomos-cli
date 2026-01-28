import React, { useState, useMemo, useEffect } from "react";
import { Text, Box } from "ink";
import { usePomodoro } from "./hooks/usePomodoro.js";
import { ProgressBar } from "./components/ProgressBar.jsx";
import { Menu } from "./components/Menu.jsx";
import { Controls } from "./components/Controls.jsx";
import { Completion } from "./components/Completion.jsx";
import { CustomInput } from "./components/CustomInput.jsx";
import { CustomResume } from "./components/CustomResume.jsx";
import { SessionTracker } from "./components/SessionTracker.jsx";
import { LiveClock } from "./components/LiveClock.jsx";
import { notifyUser, getOrdinal, parseDuration } from "./utils.js";

export default function App({ command, durationInput }) {
  const [selectedMode, setSelectedMode] = useState(() => {
    if (command === "timer" && durationInput) return "q";
    return null;
  });
  const [isOneOff, setIsOneOff] = useState(() => {
    return command === "timer" && !!durationInput;
  });
  const [customOptions, setCustomOptions] = useState(() => {
    if (command === "timer" && durationInput) {
      const minutes = parseDuration(durationInput);
      if (minutes > 0) {
        return { workDuration: minutes, breakDuration: 5 };
      }
    }
    return null;
  });
  const [skipResumePrompt, setSkipResumePrompt] = useState(false);

  // Stats: Tracks COMPLETED WORK cycles for each mode.
  // Resets to 0 only when the loop finishes (after 4 cycles).
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0, q: 0 });
  const [exitCountdown, setExitCountdown] = useState(3);

  // Define configs based on selection
  const options = useMemo(() => {
    if (selectedMode === "a") return { workDuration: 25, breakDuration: 5 };
    if (selectedMode === "b") return { workDuration: 50, breakDuration: 10 };
    if (selectedMode === "c") return customOptions || {};
    if (selectedMode === "q")
      return customOptions || { workDuration: 25, breakDuration: 5 };
    return { workDuration: 25, breakDuration: 5 };
  }, [selectedMode, customOptions]);

  const { state, startWork, startBreak, toggle, startTimer, stop } =
    usePomodoro(options);

  // Notifications
  useEffect(() => {
    if (state.status === "COMPLETED") {
      if (state.completedPhase === "WORK") {
        // const cycle = (stats[selectedMode] || 0) + 1;
        notifyUser("Session Complete", "Time to take a break!");
      } else {
        notifyUser("Break Finished", "Ready to get back to work?");
      }
    }
  }, [state.status, state.completedPhase]);

  // Auto-Start Logic
  useEffect(() => {
    // Only auto-start if we are NOT in a "Resume" scenario.
    // Resume scenario: Custom mode, options exist, session in progress, and NOT explicitly skipped (via "New Time")
    const isResumeScenario =
      selectedMode === "c" && customOptions && stats.c > 0 && !skipResumePrompt;

    // Auto-start for Quick Mode ("q") ensuring options are set
    if (selectedMode === "q" && customOptions && state.status === "IDLE") {
      startWork();
      return;
    }

    if (
      selectedMode === "c" &&
      customOptions &&
      state.status === "IDLE" &&
      !isResumeScenario
    ) {
      startWork();
    }
  }, [customOptions, selectedMode, state.status, stats.c, skipResumePrompt]);

  const handleSelect = (value) => {
    if (value === "quit") process.exit(0);
    setSelectedMode(value);
    setSkipResumePrompt(false); // Reset resume prompt state on new selection
    // Don't auto-start C until options are set
    if (value !== "c") {
      setTimeout(() => startWork(), 10);
    }
  };

  // Sync cycles completed from 'state' to 'stats'
  // Problem: 'state.cycles' in hook increments on every work completion.
  // We need to manage our own 'stats' based on 'completed' event if possible.
  // Since we don't have the event listener here directly (encapsulated in hook),
  // we can watch 'state.status' changes.

  useEffect(() => {
    if (
      state.completedPhase === "WORK" &&
      state.status === "COMPLETED" &&
      selectedMode
    ) {
      setStats((prev) => ({
        ...prev,
        [selectedMode]: prev[selectedMode] + 1,
      }));
    }
  }, [state.status, state.completedPhase, selectedMode]);

  // Auto-reset to menu after LONG_BREAK finishes
  useEffect(() => {
    if (state.completedPhase === "LONG_BREAK" && state.status === "COMPLETED") {
      // Reset the session tracker for this mode
      setStats((prev) => ({ ...prev, [selectedMode]: 0 }));
      setSelectedMode(null);
      setCustomOptions(null);
      setSkipResumePrompt(false);

      // Delay stop() to allow selectedMode=null to propagate/render first.
      // This prevents a flash of CustomInput (which steals focus) before Menu appears.
      setTimeout(() => stop(), 0);
    }
  }, [state.status, state.completedPhase, selectedMode]);

  // Auto-exit for Quick Mode with Countdown
  useEffect(() => {
    if (state.status === "COMPLETED" && selectedMode === "q") {
      const timer = setInterval(() => {
        setExitCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            process.exit(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.status, selectedMode]);

  // 1. Show Menu
  if (state.status === "IDLE") {
    // Custom mode: Check if resuming a previous session
    if (selectedMode === "c") {
      // Has existing session progress but needs to show resume prompt (for new time or reset)
      // Only show if we haven't explicitly skipped it (via New Time)
      if (stats.c > 0 && !skipResumePrompt) {
        return (
          <CustomResume
            currentSession={stats.c % 4}
            onNewTime={() => {
              // Proceed to input new time, but KEEP session progress
              setCustomOptions(null); // Clear options to prompt for new input
              setSkipResumePrompt(true); // Allow auto-start after new input
            }}
            onReset={() => {
              // Start fresh - clear options and stats
              setCustomOptions(null);
              setStats((prev) => ({ ...prev, c: 0 }));
              setSkipResumePrompt(false); // Reset prompt state
            }}
          />
        );
      }
      // No existing options (or resumed) - show input form
      if (!customOptions) {
        return (
          <CustomInput
            onSubmit={(val) => {
              setCustomOptions(val);
              // If we came from "New Time", we want auto-start.
              // The useEffect handles auto-start because skipResumePrompt is true (if from resume)
              // OR stats.c is 0 (if fresh).
            }}
            onBack={() => {
              setSelectedMode(null);
            }}
          />
        );
      }
    }
    return <Menu onSelect={handleSelect} />;
  }

  // 2. Show Completion Screen
  if (state.status === "COMPLETED") {
    // QUICK TIMER MODE: Simple finish screen
    if (selectedMode === "q") {
      // Auto-exit after a brief pause or just show message?
      // User said "just finish" and "no feedback again".
      // Let's show the message and wait for user to quit or just exit.
      // But Controls handles 'quit'.
      // Let's just show text.
      // Actually, if we just return Text, the user handles exit via Ctrl+C or we provide a simple "Press any key to exit"?
      // Let's use the Completion component but with a special simplified view?
      // Or just a raw Box here.
      return (
        <Box flexDirection="column">
          <Text color="green" bold>
            Timer Finished!
          </Text>
          <Text dimColor>Exiting in {exitCountdown} seconds...</Text>
        </Box>
      );
    }

    // Determine if it's the 4th cycle
    const currentCycle = stats[selectedMode] || 0;
    const isLongBreakTime = currentCycle > 0 && currentCycle % 4 === 0;

    return (
      <Completion
        mode={selectedMode}
        completedPhase={state.completedPhase}
        isLongBreakTime={isLongBreakTime}
        cycleCount={currentCycle} // Renamed from stats to avoid confusion
        customOptions={customOptions}
        onUpdateOptions={setCustomOptions}
        onNext={(decision, value) => {
          // Logic Bridge
          if (state.completedPhase === "WORK") {
            if (isLongBreakTime) {
              // It's Long Break time!
              if (decision === "yes") {
                // User accepted long break.
                let duration = 0;
                if (selectedMode === "a") duration = 10 * 60;
                else if (selectedMode === "b") duration = 20 * 60;
                else if (selectedMode === "c") duration = (value || 15) * 60;

                // Explicitly mark as LONG_BREAK
                startBreak(duration, true);
              } else {
                // No long break. Just Menu.
                stop();
                setSelectedMode(null);
                setCustomOptions(null);
              }
            } else {
              // Normal Break
              if (decision === "yes") {
                // If value is provided (from "Change Break Time"), use it.
                // Otherwise use default break logic (which uses options.breakDuration).
                // Actually, startBreak() without args uses the defined options.
                // If we updated options via setCustomOptions, the re-render should handle it?
                // No, options are memoized. references might check out or we pass explicit duration.
                // Safest to pass explicit duration if we have it, or let the engine pick up the new options.
                // Since onUpdateOptions updates the state, the 'options' memo updates.
                // But startBreak uses 'this.breakDuration' from constructor?
                // Wait, usePomodoro recreates Pomodoro instance when options change?
                // Yes: useEffect(..., [options.workDuration]).
                // But this might behave weirdly if we recreate it mid-flow.
                // Actually startBreak(duration) is safe.
                //

                if (selectedMode === "c" && value) {
                  // Explicitly mark as normal BREAK
                  // Update PERSISTENCE so next time it uses this new value
                  setCustomOptions((prev) => ({
                    ...prev,
                    breakDuration: value,
                  }));
                  startBreak(value * 60, false);
                } else {
                  // Pass explicit duration from options to handle stale instance cases
                  const duration =
                    selectedMode === "c" && customOptions
                      ? customOptions.breakDuration * 60
                      : undefined;
                  startBreak(duration);
                }
              } else {
                // User said "No" (Back to Menu)
                stop();
                setSelectedMode(null);
                setCustomOptions(null);
              }
            }
          } else {
            // Finished a BREAK
            // If it was a Long Break
            if (currentCycle > 0 && currentCycle % 4 === 0) {
              stop(); // Reset to IDLE
              // Long break finished -> Reset stats (handled by useEffect now, but safe to keep consistent state here just in case)
              setSelectedMode(null);
              setCustomOptions(null);
            } else {
              // Normal break finished -> Back to Work
              if (selectedMode === "c" && value) {
                // Update PERSISTENCE
                setCustomOptions((prev) => ({
                  ...prev,
                  workDuration: value,
                }));
                // Pass the new duration directly to startWork, bypassing the instance recreation race.
                startWork(value * 60);
              } else {
                const duration =
                  selectedMode === "c" && customOptions
                    ? customOptions.workDuration * 60
                    : undefined;
                startWork(duration);
              }
            }
          }
        }}
        onQuit={() => {
          // Manual quit to menu
          stop(); // Reset to IDLE
          setSelectedMode(null);
          setCustomOptions(null);
        }}
      />
    );
  }

  // Helper Logic
  const isPaused = state.status === "PAUSED";

  // Use the totalDuration directly from the engine, falling back to 1 to avoid divide-by-zero
  const totalSeconds = state.totalDuration || options.workDuration * 60;

  const percent = Math.max(
    0,
    ((totalSeconds - state.timeLeft) / totalSeconds) * 100,
  );

  const eta = new Date(Date.now() + state.timeLeft * 1000);
  const hours = eta.getHours();
  const minutes = eta.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  const etaString = `${hours12}:${minutes.toString().padStart(2, "0")}${ampm}`;

  return (
    <Box flexDirection="column" padding={0} width={50}>
      <LiveClock />
      <Box marginTop={0} flexDirection="column">
        {selectedMode !== "q" && (
          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginBottom={0}>
            <Text
              bold
              color={
                state.status.includes("BREAK") ? "greenBright" : "redBright"
              }>
              [{state.status}]
            </Text>
            {/* Session Tracker */}
            <SessionTracker
              current={(stats[selectedMode] || 0) % 4}
              total={4}
            />
          </Box>
        )}

        <Box justifyContent="space-between">
          <Text bold color={isPaused ? "gray" : "white"} dimColor={isPaused}>
            {isPaused ? "PAUSED" : etaString} -{" "}
            {state.timeLeft >= 3600 && `${Math.floor(state.timeLeft / 3600)}h `}
            {Math.floor((state.timeLeft % 3600) / 60)}m
            {(state.timeLeft % 60).toString().padStart(2, "0")}s
          </Text>
        </Box>
      </Box>

      <Box marginTop={0}>
        <ProgressBar percent={percent} />
      </Box>

      <Controls
        status={state.status}
        onToggle={toggle}
        onQuit={() => {
          // Quit to menu, not process.exit
          if (isOneOff) process.exit(0);
          stop(); // Reset to IDLE
          setSelectedMode(null);
          setCustomOptions(null);
        }}
      />
    </Box>
  );
}
