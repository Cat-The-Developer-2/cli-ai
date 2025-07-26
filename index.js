#!/usr/bin/env node

import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";

figlet("GEMINI-CLI", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(chalk.blue(data)); // Apply red and bold color using chalk
});

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
await sleep();

let gemini_api_key;

async function askKey() {
  await inquirer
    .prompt([
      /* Pass your questions in here */
      {
        name: "gemini_api_key",
        type: "input",
        message: "Enter your gemini api key",
      },
    ])
    .then((answers) => {
      gemini_api_key = answers.gemini_api_key;
      // Use user feedback for... whatever!!
      console.log(gemini_api_key);
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

await askKey();
