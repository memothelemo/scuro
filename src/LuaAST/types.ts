import { SyntaxKind } from "LuaAST/enums";

export type UnaryBitwiseOperator = SyntaxKind.BitwiseNotOperator;

export type Operator = UnaryOperator | BinaryOperator;

export type UnaryOperator =
	| SyntaxKind.NegationOperator
	| SyntaxKind.LengthOperator
	| SyntaxKind.NotOperator
	| UnaryBitwiseOperator;

export type BinaryBitwiseOperator =
	| SyntaxKind.BitwiseAndOperator
	| SyntaxKind.BitwiseOrOperator
	| SyntaxKind.BitwiseExclusiveOrOperator
	| SyntaxKind.BitwiseRightShiftOperator
	| SyntaxKind.BitwiseLeftShiftOperator;

export type BinaryOperator =
	| SyntaxKind.AdditionOperator
	| SyntaxKind.SubtractionOperator
	| SyntaxKind.MultiplicationOperator
	| SyntaxKind.DivisionOperator
	| SyntaxKind.FloorDivisionOperator
	| SyntaxKind.ModuloOperator
	| SyntaxKind.PowerOperator
	| SyntaxKind.ConcatOperator
	| SyntaxKind.EqualityOperator
	| SyntaxKind.InequalityOperator
	| SyntaxKind.LessThanOperator
	| SyntaxKind.LessEqualOperator
	| SyntaxKind.GreaterThanOperator
	| SyntaxKind.GreaterEqualOperator
	| SyntaxKind.AndOperator
	| SyntaxKind.OrOperator;
