import React from "react";
import { Text, Box } from "ink";
import Gradient from "ink-gradient";

export function ProgressBar({ percent = 0, width = 30 }) {
  const safePercent = Math.min(Math.max(0, percent || 0), 100);
  const completed = Math.floor(width * (safePercent / 100));
  const remaining = Math.max(0, width - completed);

  const bar = "█".repeat(completed) + "░".repeat(remaining);

  return (
    <Box flexDirection="row">
      <Gradient colors={["#2d5443", "#0e3814", "#01241d"]}>
        <Text>{bar.slice(0, completed)}</Text>
      </Gradient>
      <Text color="gray">{bar.slice(completed)}</Text>
      <Text bold color="white">
        {" "}
        {Math.round(safePercent)}%
      </Text>
    </Box>
  );
}
