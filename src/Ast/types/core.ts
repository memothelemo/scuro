import * as luau from "../bundle";

export type IndexableExpression =
	luau.IndexableExpressionByKind[keyof luau.IndexableExpressionByKind];

export type IdentifierExpression =
	luau.IdentifierExpressionByKind[keyof luau.IdentifierExpressionByKind];

export type AssignmentToken =
	luau.AssignmentTokensByKind[keyof luau.AssignmentTokensByKind];

export type BinaryToken =
	luau.BinaryTokensByKind[keyof luau.BinaryTokensByKind];

export type PropertyIndexExpression =
	luau.PropertyIndexExpressionByKind[keyof luau.PropertyIndexExpressionByKind];

export type MathToken = luau.MathTokensByKind[keyof luau.MathTokensByKind];
export type UnaryToken = luau.UnaryTokensByKind[keyof luau.UnaryTokensByKind];

export type ExpressionValue =
	| luau.BinaryExpression
	| luau.UnaryExpression
	| luau.StringLiteral
	| luau.NumericLiteral
	| luau.NilKeyword
	| luau.TrueKeyword
	| luau.FalseKeyword
	| luau.VarArgsKeyword
	| luau.Table
	| luau.FunctionExpression
	| IndexableExpression;
