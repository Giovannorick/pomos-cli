import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { LiveClock } from "./LiveClock.jsx";

export function Menu({ onSelect }) {
  const items = [
    { label: "25/5", value: "a" },
    { label: "50/10", value: "b" },
    { label: "Custom", value: "c" },
    { label: "Quit", value: "quit" },
  ];

  const handleSelect = (item) => {
    onSelect(item.value);
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
    <Box flexDirection="column" padding={1}>
      <Text color="#1c9c4c" bold>
        Choose a pomodoro split.
      </Text>
      <LiveClock />
      <SelectInput
        items={items}
        onSelect={handleSelect}
        indicatorComponent={Indicator}
        itemComponent={Item}
      />
    </Box>
  );
}
