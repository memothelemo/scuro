import { Scope } from "Interpreter/scope";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { compressMultiReturnValues } from "../helpers/compressMultiReturnValues";
import { visitExpressionValue } from "../helpers/visitExpressionValue";

export function visitVariableDeclaration(
	script: LuaScript,
	scope: Scope,
	node: ast.VariableDeclaration,
) {
	const ids = ast.NodeArray.map(node.ids, id => id.id);
	if (!node.initializers) {
		ids.forEach(id => scope.setLocal(id, script.state.create_nil()));
		return;
	}
	const initializers = compressMultiReturnValues(node.initializers, val =>
		visitExpressionValue(script, scope, val),
	);
	ids.forEach((id, index) => {
		const value = initializers[index] ?? script.state.create_nil();
		scope.setLocal(id, value);
	});
	return;
}
