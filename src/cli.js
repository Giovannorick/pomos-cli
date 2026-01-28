import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./App.jsx";

const cli = meow(
  `
	Usage
	  $ pomos start
	  $ pomos timer <duration>

	Commands
	  start              		  #Open interactive menu
	  timer <duration>   		  #Start custom timer immediately

	Examples
	  $ pomos start      		  # Start interactive menu
	  $ pomos timer 25m  		  # Start 25 minute timer
	  $ pomos timer 1h   		  # Start 1 hour timer
	  $ pomos timer 10m30s 	  # Start 10m 30s timer
`,
  {
    importMeta: import.meta,
    version: "Pomos V1.0.0",
    flags: {
      version: {
        type: "boolean",
        shortFlag: "v",
      },
      help: {
        type: "boolean",
        shortFlag: "h",
      },
    },
  },
);

const command = cli.input[0];
const durationInput = cli.input[1];

// Validate inputs
const validCommands = ["start", "timer"];

if (!command) {
  cli.showHelp(0);
}

if (!validCommands.includes(command)) {
  console.error(`\nUnknown command: "${command}"\n`);
  cli.showHelp(1);
}

render(React.createElement(App, { ...cli.flags, command, durationInput }));
