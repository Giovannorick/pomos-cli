import React, { useState, useEffect } from "react";
import { Text, Box } from "ink";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  // timeString is like "21:58:10 GMT+8" or "21:58:10 PST"
  // User wants "HH:MM:SS (TIMEZONE)"
  // Let's parse it slightly to add parens if needed, or just display as is?
  // "21:58:10 GMT+8" is pretty standard.
  // User asked for "HH:MM:SS (TIMEZONE)".
  // Let's try to format it to match the request exactly: "21:58:10 (GMT+8)"

  const parts = timeString.split(" ");
  // parts could be ["21:58:10", "GMT+8"] or ["21:58:10", "PM", "PST"] depending on locale/options
  // forcing hour12 false usually gives ["21:58:10", "GMT+8"]

  // Let's stick to a robust simple formatting:
  const finalString = timeString.replace(/ ([A-Z0-9+\-]+)$/, " ($1)");

  return (
    <Box marginBottom={1}>
      <Text dimColor>{finalString}</Text>
    </Box>
  );
}
