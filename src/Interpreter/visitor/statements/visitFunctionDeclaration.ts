import { Scope } from "Interpreter/scope";
import { LuaValue } from "Interpreter/types";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { visitFunctionExpression } from "../expressions/visitFunctionExpression";
import { isIdentifierExpressionAMethod } from "../helpers/isIdentifierExpressionAMethod";
import { visitIdentifierExpression } from "../helpers/visitIdentifierExpression";
import { visitIndexableExpression } from "../helpers/visitIndexableExpression";

export function visitFunctionDeclaration(
	script: LuaScript,
	scope: Scope,
	node: ast.FunctionDeclaration,
) {
	// time to declare a function, as of now!
	if (ast.isIdentifier(node.id)) {
		const nonMethodExecutor = visitFunctionExpression(
			script,
			scope,
			node.expression,
			false,
		);
		// and register it to the scope
		if (node.requiresLocal) {
			return scope.setLocal(node.id.id, nonMethodExecutor);
		}
		return scope.set(node.id.id, nonMethodExecutor);
	} else {
		const reference = visitIdentifierExpression(script, scope, node.id)[0];
		const root = visitIndexableExpression(
			script,
			scope,
			node.id.expression,
		)[0];

		// expect that thing is a table
		if (!script.state.is_table(root)) {
			script.state.throwError(
				`attempt to index ${script.state.utils.type([
					root,
				])} with ${reference.toString()}`,
				script,
			);
		}

		const executor = visitFunctionExpression(
			script,
			scope,
			node.expression,
			isIdentifierExpressionAMethod(node.id),
		);

		// element access wouldn't be possibly here because of syntax error
		return root.set(
			script.state.create_string(node.id.index as string),
			executor,
		);
	}
}
