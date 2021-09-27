import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { compressMultiReturnValues } from "../helpers/compressMultiReturnValues";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { visitStatementListOnLoop } from "../helpers/visitStatementList";

export function visitForStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.ForStatement,
) {
	// get the identifiers, they are important
	const ids = ast.NodeArray.map(node.ids, id => id.id);

	// knowing how ipairs work, i can simply implement them
	const iterators = compressMultiReturnValues(node.iterators, node =>
		visitExpressionValue(script, scope, node),
	);

	const iterator = iterators[0];
	if (!script.state.is_function(iterator)) {
		script.state.throwError(
			`bad argument #1 to '?' (function expected, ${script.state.utils.type(
				[iterator],
			)})`,
			script,
		);
	}

	const table = iterators[1];
	if (!script.state.is_table(table)) {
		script.state.throwError(
			`bad argument #1 to '?' (table expected, ${script.state.utils.type([
				table,
			])})`,
			script,
		);
	}

	// time to execute the thing here
	const newScope = scope.extend();
	const condition = () => {
		// nastiest trick i've ever made
		const copyIterators = iterators.filter((_, i) => i !== 0);
		const result = iterator.executor(copyIterators);
		if (result[0] === undefined) return false;
		if (script.state.is_nil(result[0])) return false;
		// unexpectedly inject variables
		ids.forEach((id, i) => {
			let value = result[i];
			if (value === undefined) {
				value = script.state.create_nil();
			}
			newScope.setLocal(id, value);
		});
		return true;
	};

	visitStatementListOnLoop(
		script,
		newScope,
		node.statements,
		false,
		condition,
		false,
	);
}
