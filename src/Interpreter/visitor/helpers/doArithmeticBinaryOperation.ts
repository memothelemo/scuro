import { LuaScript } from "../../../Interpreter/script";
import { LuaString } from "../../../Interpreter/values/string";
import { LuaFunction } from "../../../Interpreter/values/function";
import { LuaNumber } from "../../../Interpreter/values/number";
import {
	ArithmeticKind,
	LogicKind,
	LogicKindResult,
	LuaValue,
} from "../../types";
import { getMetamethodNameFromArithmeticKind } from "./getMetamethodFromArithmeticKind";

function math_function(
	script: LuaScript,
	left: LuaNumber,
	right: LuaValue,
	metamethodName: string,
	rightErrorMsg: string,
) {
	if (!script.state.is_number(right)) {
		script.state.throwError(rightErrorMsg, script);
	}
	let num: number;
	switch (metamethodName) {
		case "__add":
			num = left.value + right.value;
			break;
		case "__sub":
			num = left.value - right.value;
			break;
		case "__mul":
			num = left.value * right.value;
			break;
		case "__div":
			num = left.value / right.value;
			break;
		case "__mod":
			num = left.value % right.value;
			break;
		case "__pow":
			num = left.value ^ right.value;
			break;
		default:
			script.state.throwError("Unexpected error?");
	}
	return [script.state.create_number(num)];
}

export function doArithmeticBinaryOperation(
	script: LuaScript,
	left: LuaValue,
	logicResult: LogicKindResult,
	right: LuaValue,
) {
	const typeFunction = script.globals.get(
		new LuaString("type"),
	) as LuaFunction;

	const result = logicResult as {
		kind: LogicKind;
		value: ArithmeticKind;
	};

	// who cares?
	const metamethodName = getMetamethodNameFromArithmeticKind(result.value);

	// table check
	if (script.state.is_table(left) && left.metatable) {
		const metamethod = left.metatable.get(new LuaString(metamethodName));
		if (!script.state.is_function(metamethod)) {
			if (!script.state.is_nil(metamethod)) {
				script.state.throwError(
					`Expected function in \`${metamethodName}\` metamethod`,
					script,
				);
			}
		} else {
			return metamethod.executor([left, right]);
		}
	}

	// error message if in case
	const leftErrorMsg = `attempt to perform arithmetic on a ${
		typeFunction.executor([left])[0]
	}`;
	const rightErrorMsg = `attempt to perform arithmetic on a ${
		typeFunction.executor([right])[0]
	}`;

	// attempting to add together
	if (logicResult.value !== ArithmeticKind.Concat) {
		if (script.state.is_number(left)) {
			return math_function(
				script,
				left,
				right,
				metamethodName,
				rightErrorMsg,
			);
		}
	} else {
		const typeLeft = typeFunction.executor([left])[0];
		const typeRight = typeFunction.executor([right])[0];
		const errorConcatMsg = `attempt to concatenate on ${typeLeft} with ${typeRight}`;

		// unless if it is a string
		if (!script.state.is_string(left) || !script.state.is_string(right)) {
			script.state.throwError(errorConcatMsg, script);
		}

		return [script.state.create_string(left.value + right.value)];
	}

	script.state.throwError(leftErrorMsg, script);
}
