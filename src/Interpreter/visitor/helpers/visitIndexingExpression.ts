import ast from "../../../Ast";
import { Scope } from "../../scope";
import { LuaScript } from "../../script";
import { visitExpressionValue } from "./visitExpressionValue";
import { visitIndexableExpression } from "./visitIndexableExpression";
import { LuaValue } from "Interpreter/types";

export function visitIndexingExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.PropertyAccessExpression | ast.ElementAccessExpression,
) {
	script.captureNode(node);

	// visit the expression and the index
	const root = visitIndexableExpression(script, scope, node.expression)[0];
	let index: LuaValue;

	if (ast.isElementAccessExpression(node)) {
		index = visitExpressionValue(script, scope, node.index)[0];
	} else {
		index = script.state.create_string(node.index);
	}

	// table can only be accessed, atm
	if (!script.state.is_table(root)) {
		script.state.throwError(
			`attempt to index ${script.state.utils.type([
				root,
			])} with ${index.toString()}`,
			script,
		);
	}

	return [root.get(index)];
}
