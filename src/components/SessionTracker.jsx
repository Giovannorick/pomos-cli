import React from "react";
import { Text, Box } from "ink";

export function SessionTracker({ current, total = 4 }) {
  // Create an array of circles
  // Example: current=1, total=4 -> [●, ○, ○, ○]
  const circles = Array.from({ length: total }, (_, i) => {
    return i < current ? "●" : "○";
  });

  return (
    <Box marginX={0}>
      <Text color="greenBright">Session: </Text>
      <Text color="greenBright">{circles.join(" ")}</Text>
    </Box>
  );
}

