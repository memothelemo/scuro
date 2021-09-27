import ast from "../../../Ast";
import {
	ArithmeticKind,
	ComparisonKind,
	LogicKind,
	LogicKindResult,
} from "../../../Interpreter/types";

export function visitBinaryToken(node: ast.BinaryToken): LogicKindResult {
	switch (node.kind) {
		case ast.SyntaxKind.PlusToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Add,
			};
		case ast.SyntaxKind.DashToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Subtract,
			};
		case ast.SyntaxKind.AsteriskToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Multiply,
			};
		case ast.SyntaxKind.SlashToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Divide,
			};
		case ast.SyntaxKind.CaretToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Exponent,
			};
		case ast.SyntaxKind.PercentToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Percent,
			};
		case ast.SyntaxKind.EqualsEqualsToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.Equal,
			};
		case ast.SyntaxKind.TildeEqualsToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.NotEqual,
			};
		case ast.SyntaxKind.GreaterEqualThanToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.GreaterEqual,
			};
		case ast.SyntaxKind.GreaterThanToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.GreaterThan,
			};
		case ast.SyntaxKind.LessEqualThanToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.LessEqual,
			};
		case ast.SyntaxKind.LessThanToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.LessThan,
			};
		case ast.SyntaxKind.AndToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.And,
			};
		case ast.SyntaxKind.OrToken:
			return {
				kind: LogicKind.Comparison,
				value: ComparisonKind.Or,
			};
		case ast.SyntaxKind.ConcatToken:
			return {
				kind: LogicKind.Arithmetic,
				value: ArithmeticKind.Add,
			};
	}
}
