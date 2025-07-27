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

const TOKEN_LIMIT = 1024;

console.log(
  "\n" +
    chalk.bgBlue.white.bold("   👋 Welcome to CLI AI!   ") +
    "\n" +
    chalk.gray("────────────────────────────────────────────") +
    "\n" +
    chalk.white(" A lightweight, blazing-fast, private AI chatbot") +
    "\n" +
    chalk.white("   powered by ") +
    chalk.bgMagenta.white.bold(" SmolLM2-135M-Instruct ") +
    "\n\n" +
    chalk.yellow("  Please use correct grammar and avoid typos.") +
    "\n\n" +
    chalk.white("  Model downloads only once, usually within") +
    "\n" +
    chalk.green("   a few minutes") +
    chalk.white(" based on your internet speed.") +
    "\n\n" +
    chalk.white(" Runs on low-end devices. No GPU needed.") +
    "\n" +
    chalk.cyan("  Fully private. No API or internet needed after setup.") +
    "\n\n" +
    chalk.white(" Unlimited requests") +
    chalk.white(" | ") +
    chalk.white("Token Limit: ") +
    chalk.bgBlue.white.bold(` ${TOKEN_LIMIT} `) +
    "\n" +
    chalk.white(" Temp: ") +
    chalk.bold("0.1") +
    chalk.white(" | Top_p: ") +
    chalk.bold("0.95") +
    "\n" +
    chalk.white(" Type ") +
    chalk.bgCyan.black.bold(" exit ") +
    chalk.white(" to quit.") +
    "\n" +
    chalk.gray("────────────────────────────────────────────\n") +
    "\n"
);

console.log(
  chalk.bgYellow.black(" ⚠️  DISCLAIMER ") +
    chalk.yellow(
      " This is a lightweight local AI model (135M). It may give incorrect answers for complex or vague questions. Please ask clear, specific prompts for best results."
    )
);

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
      temperature: 0.1,
      top_p: 0.95,
      repetition_penalty: 1.2,
      top_k: 50,
    });

    spinnerRes.stop();
    sw.stop();

    const answer = response[0].generated_text
      .replace(formattedPrompt, "")
      .trim();

    console.log(chalk.yellowBright("AI:"), answer);

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
