import { LuaScript } from "../../../Interpreter/script";
import { LuaString } from "../../../Interpreter/values/string";
import {
	ComparisonKind,
	LogicKind,
	LogicKindResult,
	LuaValue,
} from "../../types";
import { isFalsy } from "./isFalsy";

function getMetamethodNameFromKind(kind: ComparisonKind) {
	switch (kind) {
		case ComparisonKind.Equal:
			return "__eq";
		case ComparisonKind.GreaterThan:
		case ComparisonKind.LessThan:
			return "__lt";
		case ComparisonKind.GreaterEqual:
		case ComparisonKind.LessEqual:
			return "__le";
		default:
			return undefined;
	}
}

export function doComparisonBinaryOperation(
	script: LuaScript,
	left: LuaValue,
	logicResult: LogicKindResult,
	right: LuaValue,
) {
	const result = logicResult as {
		kind: LogicKind;
		value: ComparisonKind;
	};

	// who cares?
	const metamethodName = getMetamethodNameFromKind(result.value);
	const typelib = script.state.utils.type;
	const leftType = typelib([left]);
	const rightType = typelib([right]);
	const errorMsg = `attempt to compare ${leftType} with ${rightType}`;

	// table check
	if (script.state.is_table(left) && left.metatable && metamethodName) {
		const metamethod = left.metatable.get(new LuaString(metamethodName));
		if (!script.state.is_function(metamethod)) {
			if (!script.state.is_nil(metamethod)) {
				script.state.throwError(
					`Expected function in \`${metamethod}\` metamethod`,
					script,
				);
			}
		} else {
			return metamethod.executor([left, right]);
		}
	}

	// let's do the values will handle this
	// lua doesn't usually return boolean in binary expressions
	switch (result.value) {
		case ComparisonKind.Or:
			if (isFalsy(left)) {
				// then it's the right's turn to do it
				return [script.state.create_boolean(!isFalsy(right))];
			}
			return [script.state.create_boolean(!isFalsy(left))];
		case ComparisonKind.And:
			// make sure both left and right are not falsy
			return [
				script.state.create_boolean(!isFalsy(left) && !isFalsy(right)),
			];
		case ComparisonKind.Equal:
			// address trick so that we can't waste any performance
			// and of course lua doesn't return true when comparing tables in a
			// different memory address

			// one issue i found when using the address, booleans...
			let isDefinitelyTruthy = left.address === right.address;
			if (script.state.is_boolean(left)) {
				if (script.state.is_boolean(right)) {
					isDefinitelyTruthy = left.value === right.value;
				}
			} else if (script.state.is_boolean(right)) {
				if (script.state.is_boolean(left)) {
					isDefinitelyTruthy = left.value === right.value;
				}
			}
			return [script.state.create_boolean(isDefinitelyTruthy)];
		case ComparisonKind.NotEqual:
			// simple enough
			return [
				script.state.create_boolean(left.address !== right.address),
			];
		case ComparisonKind.GreaterEqual:
			// this only applies to numbers atm
			if (
				!script.state.is_number(left) ||
				!script.state.is_number(right)
			) {
				script.state.throwError(errorMsg, script);
			}
			return [script.state.create_boolean(left.value >= right.value)];
		case ComparisonKind.GreaterThan:
			// this only applies to numbers atm
			if (
				!script.state.is_number(left) ||
				!script.state.is_number(right)
			) {
				script.state.throwError(errorMsg, script);
			}
			return [script.state.create_boolean(left.value > right.value)];
		case ComparisonKind.LessEqual:
			// this only applies to numbers atm
			if (
				!script.state.is_number(left) ||
				!script.state.is_number(right)
			) {
				script.state.throwError(errorMsg, script);
			}
			return [script.state.create_boolean(left.value <= right.value)];
		case ComparisonKind.LessThan:
			// this only applies to numbers atm
			if (
				!script.state.is_number(left) ||
				!script.state.is_number(right)
			) {
				script.state.throwError(errorMsg, script);
			}
			return [script.state.create_boolean(left.value < right.value)];
		default:
			script.state.throwError("Unknown binary operator?", script);
	}
}
