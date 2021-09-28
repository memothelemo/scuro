import {
	BinaryExpression,
	UnaryExpression,
	StringLiteral,
	NumericLiteral,
	Identifier,
	BooleanLiteral,
	NilKeyword,
	DotsKeyword,
	TableExpression,
	TableFieldExpression,
	TableIndexExpression,
	FunctionExpression,
	CallExpression,
	MethodCallExpression,
	Expression,
	TextRange,
	Node,
	Block,
	ParenthesizedExpression,
} from "LuaAST/nodes";
import { BinaryOperator, UnaryOperator } from "LuaAST/types";

import { SyntaxKind } from "LuaAST/enums";
import { createNode } from "LuaAST/factory/main";

// logical expressions
export function createBinaryExpression(
	left: Expression,
	right: Expression,
	operator: BinaryOperator,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.BinaryExpression,
		position,
	) as BinaryExpression;
	node.left = left;
	node.right = right;
	node.operator = operator;
	return node;
}

export function isUnaryExpression(node: Node): node is UnaryExpression {
	return node.kind === SyntaxKind.UnaryExpression;
}

export function createUnaryExpression(
	operand: Expression,
	operator: UnaryOperator,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.UnaryExpression,
		position,
	) as UnaryExpression;
	node.operand = operand;
	node.operator = operator;
	return node;
}

// simple expressions
export function createStringLiteral(value: string, position?: TextRange) {
	const node = createNode(
		SyntaxKind.StringLiteral,
		position,
	) as StringLiteral;
	node.value = value;
	return node;
}

export function isNumericLiteral(node: Node): node is NumericLiteral {
	return node.kind === SyntaxKind.NumericLiteral;
}

export function createNumericLiteral(value: number, position?: TextRange) {
	const node = createNode(
		SyntaxKind.NumericLiteral,
		position,
	) as NumericLiteral;
	node.value = value;
	return node;
}

export function isIdentifier(node: Node): node is Identifier {
	return node.kind === SyntaxKind.Identifier;
}

export function createIdentifier(id: string, position?: TextRange) {
	const node = createNode(SyntaxKind.Identifier, position) as Identifier;
	node.id = id;
	return node;
}

export function isNilKeyword(node: Node): node is NilKeyword {
	return node.kind === SyntaxKind.NilKeyword;
}

export function createNilKeyword(position?: TextRange) {
	const node = createNode(SyntaxKind.NilKeyword, position) as NilKeyword;
	return node;
}

export function isParenthesizedExpression(
	node: Node,
): node is ParenthesizedExpression {
	return node.kind === SyntaxKind.ParenthesizedExpression;
}

export function createParenthesizedExpression(
	expression: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.ParenthesizedExpression,
		position,
	) as ParenthesizedExpression;
	node.expression = expression;
	return node;
}

export function isBooleanLiteral(node: Node): node is BooleanLiteral {
	return (
		node.kind === SyntaxKind.TrueKeyword ||
		node.kind === SyntaxKind.FalseKeyword
	);
}

export function createBooleanLiteral(value: boolean, position?: TextRange) {
	const node = createNode(
		value ? SyntaxKind.TrueKeyword : SyntaxKind.FalseKeyword,
		position,
	) as BooleanLiteral;
	return node;
}

// Dots keyword (TSTL)
export function isDotsKeyword(node: Node): node is DotsKeyword {
	return node.kind === SyntaxKind.DotsKeyword;
}

export function createDotsKeyword(position?: TextRange) {
	const node = createNode(SyntaxKind.DotsKeyword, position) as DotsKeyword;
	return node;
}

// table stuff
export function isTableFieldExpression(
	node: Node,
): node is TableFieldExpression {
	return node.kind === SyntaxKind.TableFieldExpression;
}

export function createTableFieldExpression(
	value: Expression,
	key?: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.TableFieldExpression,
		position,
	) as TableFieldExpression;
	node.value = value;
	node.key = key;
	return node;
}

export function isTableExpression(node: Node): node is TableExpression {
	return node.kind === SyntaxKind.TableExpression;
}

export function createTableExpression(
	fields: TableFieldExpression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.TableExpression,
		position,
	) as TableExpression;
	node.fields = fields;
	return node;
}

// <exp>.<index>
export function isTableIndexExpression(
	node: Node,
): node is TableIndexExpression {
	return node.kind === SyntaxKind.TableIndexExpression;
}

export function createTableIndexExpression(
	table: Expression,
	index: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.TableIndexExpression,
		position,
	) as TableIndexExpression;
	node.table = table;
	node.index = index;
	return node;
}

// function <exp>(<params>, <dots>?) <block> end
export function isFunctionExpression(node: Node): node is FunctionExpression {
	return node.kind === SyntaxKind.FunctionExpression;
}

export function createFunctionExpression(
	block: Block,
	params?: Identifier[],
	dots?: DotsKeyword,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.FunctionExpression,
		position,
	) as FunctionExpression;
	node.params = params;
	node.dots = dots;
	node.block = block;
	return node;
}

// <exp>(<params>)
export function isCallExpression(node: Node): node is CallExpression {
	return node.kind === SyntaxKind.CallExpression;
}

export function createCallExpression(
	expression: Expression,
	params: Expression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.CallExpression,
		position,
	) as CallExpression;
	node.params = params;
	node.expression = expression;
	return node;
}

// I don't know how method call expression looks like
// but I'll try to guess it...
// <exp>:<exp>(<params>)
export function isMethodCallExpression(
	node: Node,
): node is MethodCallExpression {
	return node.kind === SyntaxKind.MethodCallExpression;
}

export function createMethodCallExpression(
	expression: Expression,
	index: Identifier,
	params: Expression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.MethodCallExpression,
		position,
	) as MethodCallExpression;
	node.expression = expression;
	node.index = index;
	node.params = params;
	return node;
}
