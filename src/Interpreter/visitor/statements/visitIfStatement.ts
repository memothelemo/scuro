import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitConditionalStatement } from "../helpers/visitConditionalStatement";
import { visitStatementList } from "../helpers/visitStatementList";

export function visitIfStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.IfStatement,
): void {
	// visit the conditional statement (base of if statement)
	const isTruthy = visitConditionalStatement(script, scope, node);

	if (isTruthy) {
		visitStatementList(script, scope, node.statements);
		return;
	}

	// use the else body if it is in falsy condition
	if (node.elseBody) {
		// if it is in node array then probably it is the else body
		if (ast.NodeArray.isArray(node.elseBody)) {
			visitStatementList(script, scope, node.elseBody);
			return;
		}

		// otherwise, visit again with recursion and a new scope
		return visitIfStatement(script, scope.extend(), node.elseBody);
	}
}
