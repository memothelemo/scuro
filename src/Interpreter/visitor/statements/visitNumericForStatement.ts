import { LuaNumber } from "Interpreter/values/number";
import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { visitStatementListOnLoop } from "../helpers/visitStatementList";

export function visitNumericForStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.NumericForStatement,
) {
	const otherValues = [
		...visitExpressionValue(script, scope, node.start),
		...visitExpressionValue(script, scope, node.end),
	];
	if (node.step) {
		otherValues.push(...visitExpressionValue(script, scope, node.step));
	}
	const id = node.id.id;
	const startNum = otherValues[0];
	const endNum = otherValues[1];
	let step = otherValues[2];

	// expecting these values are numbers
	if (!script.state.is_number(startNum)) {
		script.state.throwError(`Expected <start> to be a number`, script);
	}

	if (!script.state.is_number(endNum)) {
		script.state.throwError(`Expected <end> to be a number`, script);
	}

	if (step === undefined) {
		step = script.state.create_nil();
	} else if (!script.state.is_number(step)) {
		script.state.throwError(
			`Expected <step> will be a number or nil`,
			script,
		);
	}

	const newScope = scope.extend();
	let current = startNum.value;
	visitStatementListOnLoop(
		script,
		newScope,
		node.statements,
		false,
		() => {
			if (current > endNum.value) {
				return false;
			}
			newScope.setLocal(id, script.state.create_number(current));
			if (script.state.is_nil(step)) {
				current++;
			} else {
				current += (step as LuaNumber).value;
			}
			return true;
		},
		false,
	);
}
