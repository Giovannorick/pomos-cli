import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";

export function DurationInput({ onSubmit, onBack, label = "Enter duration:" }) {
  const [focus, setFocus] = useState(0); // 0: Min, 1: Sec
  const [min, setMin] = useState("");
  const [sec, setSec] = useState("");
  const [error, setError] = useState("");

  const validateAndSubmit = () => {
    // Check for explicit zero
    const isExplicitZero =
      (min !== "" || sec !== "") &&
      parseInt(min || "0") === 0 &&
      parseInt(sec || "0") === 0;

    if (isExplicitZero) {
      setError("Duration must be > 0s");
      return;
    }

    const m = min === "" ? 15 : parseInt(min) || 0;
    const s = parseInt(sec) || 0;
    const totalMinutes = m + s / 60;
    onSubmit(totalMinutes);
  };

  useInput((input, key) => {
    if (key.escape) {
      if (onBack) onBack();
    }
    if (key.tab) {
      setFocus((prev) => (prev + 1) % 2);
    }
    if (key.return) {
      if (focus < 1) {
        setFocus(1);
      } else {
        validateAndSubmit();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="greenBright">
        {label}
      </Text>
      <Box flexDirection="row" marginTop={1}>
        <Box marginRight={2}>
          <Text color={focus === 0 ? "green" : "gray"}>Min: </Text>
          <TextInput
            focus={focus === 0}
            value={min}
            onChange={(val) => {
              setMin(val);
              if (error) setError("");
            }}
            placeholder="15"
            onSubmit={() => {}}
          />
        </Box>
        <Box>
          <Text color={focus === 1 ? "green" : "gray"}>Sec: </Text>
          <TextInput
            focus={focus === 1}
            value={sec}
            onChange={(val) => {
              setSec(val);
              if (error) setError("");
            }}
            placeholder="00"
            onSubmit={() => {}}
          />
        </Box>
      </Box>
      <Box marginTop={1}>
        <Text dimColor> (Tab to switch, Enter to submit, Esc to back)</Text>
      </Box>
      {error && (
        <Box marginTop={1}>
          <Text color="red" bold>
            Error: {error}
          </Text>
        </Box>
      )}
    </Box>
  );
}
