import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export function Controls({ status, onToggle, onQuit }) {
  const [focusIndex, setFocusIndex] = useState(0); // 0 = Toggle, 1 = Quit

  useInput((input, key) => {
    if (key.leftArrow || key.rightArrow) {
      setFocusIndex((prev) => (prev === 0 ? 1 : 0));
    }
    if (key.return) {
      if (focusIndex === 0) onToggle();
      if (focusIndex === 1) onQuit();
    }
  });

  return (
    <Box marginTop={1} gap={2}>
      <Button
        label={status === "PAUSED" ? "START" : "PAUSE"}
        isFocused={focusIndex === 0}
      />
      <Button label="QUIT" isFocused={focusIndex === 1} />
    </Box>
  );
}

function Button({ label, isFocused }) {
  return (
    <Text color={isFocused ? "greenBright" : "white"} bold={isFocused}>
      {isFocused ? `▶ ${label}` : `  ${label}`}
    </Text>
  );
}
