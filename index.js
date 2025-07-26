#!/usr/bin/env node

import ora from "ora";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { StopWatch } from "stopwatch-node";
import { pipeline } from "@huggingface/transformers";

console.clear();

console.log(
  chalk.blue(figlet.textSync("AI CLI", { horizontalLayout: "default" }))
);

const spinner = ora("🔄 Loading model (downloads on first run)...").start();

let generator;
try {
  generator = await pipeline(
    "text-generation",
    "HuggingFaceTB/SmolLM2-135M-Instruct",
    {
      dtype: "fp32",
    }
  );
  spinner.succeed("✅ Model loaded and ready!");
} catch (err) {
  spinner.fail("❌ Failed to load model");
  console.error(err);
  process.exit(1);
}

const TOKEN_LIMIT = 100;

console.log(`
${chalk.green("1. 👋 Welcome to")} ${chalk.bold.cyan("CLI AI!")}
${chalk.gray("2.")} ${chalk.white(
  "A lightweight, blazing fast, private AI chatbot powered by"
)} ${chalk.magenta("SmolLM2-135M-Instruct")}.
${chalk.gray("3.")} ${chalk.yellow(
  "Please don't have any typo error and use proper grammar."
)}
${chalk.gray("4.")} ${chalk.white(
  "Download of model only happens once and"
)} ${chalk.green("downloading only takes few minutes")} ${chalk.white(
  "based on your internet speed."
)}
${chalk.gray("5.")} ${chalk.white(
  "Model is very lightweight and can run on your lightweight desktop."
)}
${chalk.gray("6.")} ${chalk.white(
  "Unlimited Requests, Token Limit:"
)} ${chalk.bold.blue(`${TOKEN_LIMIT}`)}
${chalk.gray("7.")} ${chalk.white("Temperature:")} ${chalk.bold(
  "0.7"
)}, ${chalk.white("Top_p:")} ${chalk.bold("0.9")}
${chalk.gray("8.")} ${chalk.white("Type")} ${chalk.cyan(
  "'exit'"
)} ${chalk.white("to exit.")}
`);

// Start interaction loop
async function chat() {
  while (true) {
    const { prompt } = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: chalk.green("You:"),
      },
    ]);

    if (prompt.trim().toLowerCase() === "exit") {
      console.log(chalk.cyan("👋 Exiting..."));
      break;
    }

    const formattedPrompt = `### Instruction:\n${prompt}\n\n### Response:\n`;

    const sw = new StopWatch("sw");
    sw.start("generating response");
    const spinnerRes = ora("Generating response....").start();

    const response = await generator(formattedPrompt, {
      max_new_tokens: TOKEN_LIMIT,
      temperature: 0.7,
      top_p: 0.9,
    });

    spinnerRes.stop();

    sw.stop();

    console.log(
      chalk.yellowBright("AI:"),
      response[0].generated_text.replace(formattedPrompt, "").trim()
    );

    console.log("\n");

    const responseTime =
      Math.round(sw.getTask("generating response").timeMills * 0.1) / 100;

    console.log(
      chalk.gray("Response generated in ") +
        chalk.bold.green(`${responseTime} seconds`)
    );

    console.log("\n");
  }
}

chat();
