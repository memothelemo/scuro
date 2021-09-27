import {
	ArithmeticKind,
	ComparisonKind,
	LuaValue,
} from "../../../Interpreter/types";
import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitAssignmentToken } from "../helpers/visitAssignmentToken";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { getMetamethodNameFromArithmeticKind } from "../helpers/getMetamethodFromArithmeticKind";
import { modifyIdentifierExpression } from "../helpers/modifyIdentifierExpression";
import { visitIdentifierExpression } from "../helpers/visitIdentifierExpression";

export function visitAssignment(
	script: LuaScript,
	scope: Scope,
	node: ast.Assignment,
) {
	// modifying the identifiers
	const ids = ast.NodeArray.toArray(node.ids);

	if (!node.initializers) {
		ids.forEach(id =>
			modifyIdentifierExpression(
				script,
				scope,
				id,
				script.state.create_nil(),
			),
		);
		return;
	}

	const token = visitAssignmentToken(node.assignmentToken);
	const initializers = new Array<LuaValue>();
	ast.NodeArray.forEach(node.initializers, expression =>
		initializers.push(...visitExpressionValue(script, scope, expression)),
	);

	// assignment
	if (token.value === ComparisonKind.Equal) {
		// modifying initializers
		ids.forEach((value, index) => {
			const right = initializers[index] ?? script.state.create_nil();
			modifyIdentifierExpression(script, scope, value, right);
		});
		return;
	}

	// who cares?
	const metamethodName = getMetamethodNameFromArithmeticKind(
		token.value as ArithmeticKind,
	);

	// table check
	ids.forEach((id, i) => {
		const left = visitIdentifierExpression(script, scope, id)[0];
		const right = initializers[i] ?? script.state.create_nil();
		if (script.state.is_table(left) && left.metatable) {
			const metamethod = left.metatable.get(
				script.state.create_string(metamethodName),
			);
			if (!script.state.is_function(metamethod)) {
				if (!script.state.is_nil(metamethod)) {
					script.state.throwError(
						`Expected function in \`${metamethodName}\` metamethod`,
						script,
					);
				}
			} else {
				modifyIdentifierExpression(
					script,
					scope,
					id,
					metamethod.executor([left, right])[0],
				);
			}
		}
		// attempting to add together
		const typeLeft = script.state.utils.type([left])[0];
		const typeRight = script.state.utils.type([right])[0];
		if (token.value !== ArithmeticKind.Concat) {
			if (script.state.is_number(left) && script.state.is_number(right)) {
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
						script.state.throwError("Unexpected error?", script);
				}
				modifyIdentifierExpression(
					script,
					scope,
					id,
					script.state.create_number(num),
				);
			} else {
				script.state.throwError(
					`attempt to perform arithmetic on ${typeLeft} with ${typeRight}`,
					script,
				);
			}
		} else {
			const errorConcatMsg = `attempt to concatenate on ${typeLeft} with ${typeRight}`;

			// unless if it is a string
			if (
				!script.state.is_string(left) ||
				!script.state.is_string(right)
			) {
				script.state.throwError(errorConcatMsg, script);
			}

			modifyIdentifierExpression(
				script,
				scope,
				id,
				script.state.create_string(left.value + right.value),
			);
		}
	});
}
