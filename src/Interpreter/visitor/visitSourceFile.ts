import ast from "../../Ast";
import { LuaScript } from "../../Interpreter/script";
import { visitStatementList } from "./helpers/visitStatementList";

export function visitSourceFile(script: LuaScript, node: ast.SourceFile) {
	// load all of the statements
	return visitStatementList(script, script.scope, node.statements);
}
