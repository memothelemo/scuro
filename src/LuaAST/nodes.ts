import { SyntaxKind } from "LuaAST/enums";
import { BinaryOperator, UnaryOperator } from "LuaAST/types";

export interface TextRange {
	line?: number;
	column?: number;
}

export interface Node extends TextRange {
	kind: SyntaxKind;
}

export interface Block extends Node {
	kind: SyntaxKind.Block;
	statements: Statement[];
}

export interface Expression extends Node {
	_expressionBrand: any;
}

export interface Statement extends Node {
	_statementBrand: any;
}

export interface SourceFile extends Node {
	kind: SyntaxKind.SourceFile;
	statements: Statement[];
}

export interface BinaryExpression extends Expression {
	kind: SyntaxKind.BinaryExpression;
	operator: BinaryOperator;
	left: Expression;
	right: Expression;
}

export interface UnaryExpression extends Expression {
	kind: SyntaxKind.UnaryExpression;
	operand: Expression;
	operator: UnaryOperator;
}

export interface StringLiteral extends Expression {
	kind: SyntaxKind.StringLiteral;
	value: string;
}

export interface NumericLiteral extends Expression {
	kind: SyntaxKind.NumericLiteral;
	value: number;
}

export interface Identifier extends Expression {
	kind: SyntaxKind.Identifier;
	id: string;
}

export interface BooleanLiteral extends Expression {
	kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
}

export interface NilKeyword extends Expression {
	kind: SyntaxKind.NilKeyword;
}

export interface DotsKeyword extends Expression {
	kind: SyntaxKind.DotsKeyword;
}

export interface TableFieldExpression extends Expression {
	kind: SyntaxKind.TableFieldExpression;
	key?: Expression;
	value: Expression;
}

export interface ParenthesizedExpression extends Expression {
	kind: SyntaxKind.ParenthesizedExpression;
	expression: Expression;
}

export interface TableExpression extends Expression {
	kind: SyntaxKind.TableExpression;
	fields: TableFieldExpression[];
}

export interface TableIndexExpression extends Expression {
	kind: SyntaxKind.TableIndexExpression;
	table: Expression;
	index: Expression;
}

export interface FunctionExpression extends Expression {
	kind: SyntaxKind.FunctionExpression;
	block: Block;
	dots?: DotsKeyword;
	params?: Identifier[];
}

export interface CallExpression extends Expression {
	kind: SyntaxKind.CallExpression;
	params: Expression[];
	expression: Expression;
}

export interface MethodCallExpression extends Expression {
	kind: SyntaxKind.MethodCallExpression;
	expression: Expression;
	index: Identifier;
	params: Expression[];
}
