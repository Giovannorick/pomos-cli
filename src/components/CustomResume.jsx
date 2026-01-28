import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { getOrdinal } from "../utils.js";

export function CustomResume({ currentSession, onNewTime, onReset }) {
  const items = [
    {
      label: `Continue to ${getOrdinal(currentSession + 1)} Session (Set New Time)`,
      value: "new_time",
    },
    { label: "Start Fresh Session (Reset)", value: "reset" },
  ];

  const handleSelect = (item) => {
    if (item.value === "new_time") {
      onNewTime();
    } else {
      onReset();
    }
  };

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
      <Text bold color="greenBright">
        Previous custom session found!
      </Text>
      <Text dimColor>Session progress: {currentSession}/4 completed</Text>
      <Box marginTop={1}>
        <SelectInput
          items={items}
          onSelect={handleSelect}
          indicatorComponent={Indicator}
          itemComponent={Item}
        />
      </Box>
    </Box>
  );
}
