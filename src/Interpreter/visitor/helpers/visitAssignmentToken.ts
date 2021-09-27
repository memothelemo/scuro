import ast from "../../../Ast";
import {
	ArithmeticKind,
	ComparisonKind,
	LogicKind,
	LogicKindResult,
} from "../../../Interpreter/types";

export function visitAssignmentToken(
	node: ast.AssignmentToken,
): LogicKindResult {
	switch (node.kind) {
		case ast.SyntaxKind.EqualsToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.Equal,
			};
		case ast.SyntaxKind.PlusEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Add,
			};
		case ast.SyntaxKind.DashEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Subtract,
			};
		case ast.SyntaxKind.AsteriskEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Multiply,
			};
		case ast.SyntaxKind.SlashEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Divide,
			};
		case ast.SyntaxKind.CaretEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Exponent,
			};
		case ast.SyntaxKind.PercentEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Percent,
			};
		case ast.SyntaxKind.ConcatEqualsToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Concat,
			};
	}
}
