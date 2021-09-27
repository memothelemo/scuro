import ast from "Ast";
import chalk from "chalk";
import { LuaScript } from "Interpreter/script";

export abstract class LogError {
	constructor() {}

	abstract toString(): string;

	log() {
		process.stdout.write(this.toString());
	}
}

export class LuaError extends LogError {
	constructor(
		public message: string,
		public readonly node: ast.Node,
		public readonly script?: LuaScript,
	) {
		super();
	}

	log() {
		process.stdout.write(this.toString());
	}

	toString(): string {
		// typescript vibe
		if (this.script) {
			return `${chalk.cyanBright(
				this.script.sourceFile.fileName,
			)}:${chalk.yellow(this.node.textRange!.row)}:${chalk.yellow(
				this.node.textRange!.column,
			)}: ${this.message}\n`;
		}
		return `${chalk.cyanBright("stdin")}:${chalk.yellow(
			this.node.textRange!.row,
		)}:${chalk.yellow(this.node.textRange!.column)}: ${this.message}\n`;
	}
}
