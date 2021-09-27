import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitStatementList } from "../helpers/visitStatementList";

export function visitDoStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.DoStatement,
) {
	return visitStatementList(script, scope, node.statements);
}
