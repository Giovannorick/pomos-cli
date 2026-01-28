import React, { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { formatDuration, getOrdinal } from "../utils.js";
import { DurationInput } from "./DurationInput.jsx";

export function Completion({
  mode,
  completedPhase,
  isLongBreakTime,
  onNext,
  onQuit,
  customOptions,
  onUpdateOptions,
  cycleCount = 0, // Renamed from stats
}) {
  const [askingDuration, setAskingDuration] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false); // New state for "Change Time"

  // --- LONG BREAK HANDLER (Legacy/Existing Logic) ---
  if (
    completedPhase === "WORK" &&
    isLongBreakTime &&
    mode === "c" &&
    askingDuration
  ) {
    return (
      <DurationInput
        label="How long for the break?"
        onSubmit={(val) => onNext("yes", val)}
        onBack={() => setAskingDuration(false)}
      />
    );
  }

  // --- EDITING TIME HANDLER ---
  if (editingDuration) {
    const isWork =
      completedPhase === "BREAK" || completedPhase === "LONG_BREAK";
    const label = isWork ? "Set New Work Duration:" : "Set New Break Duration:";

    return (
      <DurationInput
        label={label}
        onSubmit={(newVal) => {
          // Don't update options here - it triggers a re-creation of the timer instance.
          // Just pass the value; App.jsx will update options after starting the timer.
          if (isWork) {
            onNext("work", newVal);
          } else {
            onNext("yes", newVal);
          }
        }}
        onBack={() => setEditingDuration(false)}
      />
    );
  }

  // Handle Menu Selection
  const handleSelect = (item) => {
    if (item.value === "yes" || item.value === "next") {
      // Start Next Phase
      if (mode === "c" && isLongBreakTime && completedPhase === "WORK") {
        setAskingDuration(true);
      } else {
        onNext(item.value === "next" ? "work" : "yes");
      }
    } else if (item.value === "edit") {
      setEditingDuration(true);
    } else if (item.value === "quit") {
      onQuit();
    } else {
      onNext("no"); // Back to Menu
    }
  };

  // --- RENDER LOGIC ---

  let message = "Work Session Complete!";
  let items = [];

  // 1. BREAK FINISHED -> GO TO WORK
  if (completedPhase === "BREAK" || completedPhase === "LONG_BREAK") {
    message = "Break Finished! Ready to work?";
    if (mode === "c" && customOptions) {
      items = [
        {
          label: `Start Work (${formatDuration(customOptions.workDuration)})`,
          value: "next",
        },
        { label: "Change the Work Time?", value: "edit" },
        { label: "Main Menu", value: "quit" },
      ];
    } else {
      items = [
        { label: "Start Work", value: "next" },
        { label: "Main Menu", value: "quit" },
      ];
    }
  }

  // 2. WORK FINISHED -> GO TO BREAK
  else {
    if (isLongBreakTime) {
      message = "🎉 4th Cycle Complete! Long Break Available.";
      if (mode === "a")
        items = [{ label: "Take 10m Long Break", value: "yes" }];
      if (mode === "b")
        items = [{ label: "Take 20m Long Break", value: "yes" }];
      if (mode === "c") items = [{ label: "Yes, I need it", value: "yes" }];
      items.push({ label: "No (Back to Menu)", value: "no" });
    } else {
      // Normal Break - Custom mode shows session number
      if (mode === "c" && customOptions) {
        const sessionNum = cycleCount % 4 || 4; // 1, 2, 3, 4
        const ordinal = getOrdinal(sessionNum);
        message = `Work ${ordinal} Session Complete!`;
        items = [
          {
            label: `Start Break (${formatDuration(customOptions.breakDuration)})`,
            value: "yes",
          },
          { label: "Change the Break Time?", value: "edit" },
          { label: "Main Menu", value: "quit" },
        ];
      } else {
        message = "Work Session Complete!";
        items = [
          { label: "Start Break", value: "yes" },
          { label: "No (Back to Menu)", value: "no" },
        ];
      }
    }
  }

  const Indicator = ({ isSelected }) => (
    <Box marginRight={1}>
      <Text color={isSelected ? "green" : "gray"}>
        {isSelected ? ">" : " "}
      </Text>
    </Box>
  );

  const Item = ({ isSelected, label }) => (
    <Text color={isSelected ? "green" : "white"}>{label}</Text>
  );

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        {message}
      </Text>
      <SelectInput
        items={items}
        onSelect={handleSelect}
        indicatorComponent={Indicator}
        itemComponent={Item}
      />
    </Box>
  );
}
