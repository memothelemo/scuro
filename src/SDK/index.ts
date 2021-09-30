import fs from "fs";
import path from "path";
import LuaParser from "LuaParser";
import LuaInterpreter from "LuaInterpreter";

const pathToSource = path.join(__dirname, "..", "..", "source.lua");
const stream = new LuaParser.TextStream(
	fs.readFileSync(pathToSource).toString(),
);

const lexer = new LuaParser.Lexer(stream, {
	keepComments: true,
});

const parser = new LuaParser.Parser({
	version: "5.1",
});

const ast = parser.parse(lexer.tokenize());
const runtime = new LuaInterpreter.LuaRuntime();
runtime.visitSourceFile(ast);
