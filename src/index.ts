import fs from "fs";
import path from "path";
import { Parser } from "./Parser";
import { LuaState } from "./Interpreter/state";
import { LogError } from "./Shared/error";

const source = fs
	.readFileSync(path.join(__dirname, "..", "source.lua"))
	.toString();

function compile(source: string) {
	const parser = Parser.fromSource(source);
	const state = new LuaState();
	const result = state.loadSourceFile(parser.parse());
	if (result instanceof LogError) {
		result.log();
	}
}

compile(source);
