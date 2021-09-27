import { LuaValue } from "Interpreter/types";
import { LuaTable } from "Interpreter/values/table";
import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpressionValue } from "./visitExpressionValue";
import { visitIndexableExpression } from "./visitIndexableExpression";

function visitToDeepestAccessExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.PropertyAccessExpression | ast.ElementAccessExpression,
): {
	value: LuaTable;
	expression: ast.PropertyAccessExpression | ast.ElementAccessExpression;
} {
	const rootValue = visitIndexableExpression(
		script,
		scope,
		node.expression,
	)[0];
	if (!script.state.is_table(rootValue)) {
		// one tostring call in a string, sounds a bad idea
		script.state.throwError(
			`attempt to index ${script.state.utils.type([
				rootValue,
			])} with '${node.index.toString()}'`,
			script,
		);
	}
	// going down the drain until we reached the limit there
	if (
		ast.isPropertyAccessExpression(node.expression) ||
		ast.isElementAccessExpression(node.expression)
	) {
		return visitToDeepestAccessExpression(script, scope, node.expression);
	}
	return {
		value: rootValue,
		expression: node,
	};
}

export function modifyIdentifierExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.IdentifierExpression,
	value: LuaValue,
) {
	switch (node.kind) {
		case ast.SyntaxKind.Identifier:
			scope.set((node as ast.Identifier).id, value);
			return;
		default:
			// go to the deepest table whenever possible
			const result = visitToDeepestAccessExpression(script, scope, node);

			// get the index, we checked if it is a table in this function here
			const rawIndex = result.expression.index;
			const index =
				typeof rawIndex === "string"
					? script.state.create_string(rawIndex)
					: visitExpressionValue(script, scope, rawIndex)[0];

			// attempting to modify it
			result.value.set(index, value);
			return;
	}
}
