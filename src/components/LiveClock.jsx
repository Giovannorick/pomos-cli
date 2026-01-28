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
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Extract city from "Region/City" or use full string if no slash
  const city = timeZone.includes("/")
    ? timeZone.split("/")[1].replace(/_/g, " ")
    : timeZone;

  return (
    <Box marginBottom={1}>
      <Text dimColor>
        {timeString} | {city}
      </Text>
    </Box>
  );
}
