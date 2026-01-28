import { useState, useEffect, useRef } from "react";
import { Pomodoro } from "../core/Pomodoro.js";

export function usePomodoro(options) {
  const [state, setState] = useState({
    timeLeft: 0,
    status: "IDLE",
    cycles: 0,
  });

  // We use useRef to keep the same 'pomo' instance between renders
  const pomoRef = useRef(null);

  useEffect(() => {
    // 1. Initialize the Brain
    pomoRef.current = new Pomodoro(options);
    const pomo = pomoRef.current;

    // 2. Listen to the Brain
    const handleTick = ({ timeLeft, state, totalDuration }) => {
      setState((prev) => ({ ...prev, timeLeft, status: state, totalDuration }));
    };

    const handleCompleted = ({ state, cycles }) => {
      setState((prev) => ({
        ...prev,
        status: "COMPLETED",
        cycles,
        completedPhase: state,
      }));
    };

    pomo.on("tick", handleTick);
    pomo.on("completed", handleCompleted);

    // 3. Cleanup when component unmounts
    return () => {
      pomo.pause();
      pomo.off("tick", handleTick);
      pomo.off("completed", handleCompleted);
    };
  }, []); // Only run once on mount

  // Update options when they change, without recreating the instance
  useEffect(() => {
    if (pomoRef.current) {
      pomoRef.current.updateOptions(options);
    }
  }, [options.workDuration, options.breakDuration, options.longBreakDuration]);

  return {
    state,
    startWork: (duration) => pomoRef.current?.startWork(duration),
    startBreak: (duration, isLongBreak) =>
      pomoRef.current?.startBreak(duration, isLongBreak),
    pause: () => pomoRef.current?.pause(),
    toggle: () => pomoRef.current?.toggle(),
    stop: () => pomoRef.current?.stop(),
  };
}
