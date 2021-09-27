import { LuaScript } from "../../../Interpreter/script";
import { LuaString } from "../../../Interpreter/values/string";
import { LogicKind, LogicKindResult, LuaValue, UnaryKind } from "../../types";
import { isFalsy } from "./isFalsy";

function getMetamethodNameFromKind(kind: UnaryKind) {
	switch (kind) {
		case UnaryKind.Dash:
			return "__unm";
		case UnaryKind.Length:
			return "__len";
		default:
			return undefined;
	}
}

export function doUnaryOperation(
	script: LuaScript,
	expression: LuaValue,
	logicResult: LogicKindResult,
) {
	const { value } = logicResult as {
		kind: LogicKind;
		value: UnaryKind;
	};

	const metamethodName = getMetamethodNameFromKind(value);
	const typelib = script.state.utils.type;
	const leftType = typelib([expression]);
	const errorMsg = `attempt to ${
		value === UnaryKind.Dash ? "perform arithmetic" : "get length"
	} on a ${leftType} value`;

	// table check
	if (
		script.state.is_table(expression) &&
		expression.metatable &&
		metamethodName
	) {
		const metamethod = expression.metatable.get(
			new LuaString(metamethodName),
		);
		if (!script.state.is_function(metamethod)) {
			if (!script.state.is_nil(metamethod)) {
				script.state.throwError(
					`Expected function in \`${metamethod}\` metamethod`,
					script,
				);
			}
		} else {
			return metamethod.executor([expression]);
		}
	}

	// unary stuff
	switch (value) {
		case UnaryKind.Dash:
			// numbers only
			if (!script.state.is_number(expression)) {
				script.state.throwError(errorMsg, script);
			}
			return [script.state.create_number(-expression.value)];
		case UnaryKind.Length:
			// tables, and strings may apply
			if (script.state.is_table(expression)) {
				// array can be calculated only
				return [script.state.create_number(expression.array.length)];
			} else if (script.state.is_string(expression)) {
				return [script.state.create_number(expression.value.length)];
			}
			script.state.throwError(errorMsg, script);
		case UnaryKind.Opposite:
			// check if the value is falsy
			if (isFalsy(expression)) {
				// return it to true!
				return [script.state.create_boolean(true)];
			}
			// do the opposite
			return [script.state.create_boolean(true)];
		default:
			script.state.throwError(`Unknown unary operator`, script);
	}
}
