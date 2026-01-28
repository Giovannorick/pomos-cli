import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";

export function CustomInput({ onSubmit, onBack }) {
  const [step, setStep] = useState(0); // 0: Work, 1: Break
  const [focus, setFocus] = useState(0); // 0: Min, 1: Sec (Relative to current step)

  const [workMin, setWorkMin] = useState("");
  const [workSec, setWorkSec] = useState("");
  const [breakMin, setBreakMin] = useState("");
  const [breakSec, setBreakSec] = useState("");
  const [error, setError] = useState("");

  const validateAndProceed = () => {
    // Current step values
    const minStr = step === 0 ? workMin : breakMin;
    const secStr = step === 0 ? workSec : breakSec;

    // Check if explicitly 0 (user typed "0" or "00")
    // If empty strings, we treat as "default", so that's valid.
    const isExplicitZero =
      (minStr !== "" || secStr !== "") &&
      parseInt(minStr || "0") === 0 &&
      parseInt(secStr || "0") === 0;

    if (isExplicitZero) {
      setError("Duration must be > 0s");
      return;
    }

    setError(""); // Clear error if valid

    if (step === 0) {
      setStep(1);
      setFocus(0);
    } else {
      handleSubmit();
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (step === 1) {
        setStep(0);
        setFocus(0); // Reset focus
        setError("");
      } else {
        if (onBack) onBack();
      }
    }
    if (key.tab) {
      setFocus((prev) => (prev + 1) % 2);
    }
    if (key.return) {
      if (focus === 0) {
        setFocus(1);
      } else {
        // Validation required before proceeding
        validateAndProceed();
      }
    }
  });

  const handleSubmit = () => {
    // Default to 25/5 if completely empty, otherwise parse what is there
    const wMin = workMin === "" ? 25 : parseInt(workMin) || 0;
    const wSec = parseInt(workSec) || 0;
    const bMin = breakMin === "" ? 5 : parseInt(breakMin) || 0;
    const bSec = parseInt(breakSec) || 0;

    const workTotal = wMin + wSec / 60;
    const breakTotal = bMin + bSec / 60;

    onSubmit({
      workDuration: workTotal,
      breakDuration: breakTotal,
    });
  };

  const Field = ({ label, value, onChange, index, placeholder }) => (
    <Box marginRight={2}>
      <Text color={focus === index ? "green" : "gray"}>{label}: </Text>
      <TextInput
        focus={focus === index}
        value={value}
        onChange={(val) => {
          onChange(val);
          if (error) setError(""); // Clear error on type
        }}
        placeholder={placeholder}
        onSubmit={() => {}}
      />
    </Box>
  );

  return (
    <Box flexDirection="column">
      <Text bold>Custom Settings (Step {step + 1}/2)</Text>

      {step === 0 && (
        <>
          <Box marginTop={1}>
            <Text bold color="green">
              Work Duration:
            </Text>
          </Box>
          <Box flexDirection="row">
            <Field
              label="Min"
              value={workMin}
              onChange={setWorkMin}
              index={0}
              placeholder="25"
            />
            <Field
              label="Sec"
              value={workSec}
              onChange={setWorkSec}
              index={1}
              placeholder="00"
            />
          </Box>
        </>
      )}

      {step === 1 && (
        <>
          <Box marginTop={1}>
            <Text bold color="green">
              Break Duration:
            </Text>
          </Box>
          <Box flexDirection="row">
            <Field
              label="Min"
              value={breakMin}
              onChange={setBreakMin}
              index={0}
              placeholder="5"
            />
            <Field
              label="Sec"
              value={breakSec}
              onChange={setBreakSec}
              index={1}
              placeholder="00"
            />
          </Box>
        </>
      )}

      <Box marginTop={1}>
        <Text dimColor> (Tab to switch, Enter to continue, Esc to back)</Text>
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
