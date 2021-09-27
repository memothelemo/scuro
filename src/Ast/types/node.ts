import * as luau from "../bundle";

/*********		EXPRESSION 		*********/ /***/

export interface Expression extends luau.Node {
	expressionSymbol: symbol;
}

export interface Identifier extends Expression {
	kind: luau.SyntaxKind.Identifier;
	id: string;
}

export interface StringLiteral extends Expression {
	kind: luau.SyntaxKind.StringLiteral;
	value: string;
}

export interface NumericLiteral extends Expression {
	kind: luau.SyntaxKind.NumericLiteral;
	value: string;
}

export interface BinaryExpression extends Expression {
	kind: luau.SyntaxKind.BinaryExpression;
	left: luau.ExpressionValue;
	operator: luau.BinaryToken;
	right: luau.ExpressionValue;
}

export interface UnaryExpression extends Expression {
	kind: luau.SyntaxKind.UnaryExpression;
	operator: luau.UnaryToken;
	value: luau.ExpressionValue;
}

/** a.b */
export interface PropertyAccessExpression extends Expression {
	kind: luau.SyntaxKind.PropertyAccessExpression;
	expression: luau.IndexableExpression;
	index: string;
	isMethod: boolean;
}

/** a["b"] */
export interface ElementAccessExpression extends Expression {
	kind: luau.SyntaxKind.ElementAccessExpression;
	expression: luau.IndexableExpression;
	index: luau.ExpressionValue;
}

/** that("Hello world!") */
export interface CallExpression extends Expression {
	kind: luau.SyntaxKind.CallExpression;
	id: luau.IdentifierExpression;
	parameters: luau.NodeArray<luau.ExpressionValue>;
}

/** that:thing("Hello world") */
export interface MethodCallExpression extends Expression {
	kind: luau.SyntaxKind.MethodCallExpression;

	/** **{HERE}**:{ID}({PARAMS}) */
	base: luau.IdentifierExpression;

	/** {BASE}:**{HERE}**({PARAMS}) */
	id: luau.IdentifierExpression;

	/** {BASE}:{ID}(**{HERE}**) */
	parameters: luau.NodeArray<luau.ExpressionValue>;
}

export interface ParenthesizedExpression extends Expression {
	kind: luau.SyntaxKind.ParenthesizedExpression;
	expression: luau.ExpressionValue;
}

export interface PropertyAssignment extends Expression {
	kind: luau.SyntaxKind.PropertyAssignment;
	id: luau.PropertyIndexExpression;
	value: luau.ExpressionValue;
	isWrappedWithValue: boolean;
}

export interface FunctionExpression extends Expression {
	kind: luau.SyntaxKind.FunctionExpression;
	parameters?: luau.NodeArray<luau.IdentifierExpression>;
	dots?: luau.VarArgsKeyword;
	statements: luau.NodeArray<luau.Statement>;
}

export interface Table extends Expression {
	kind: luau.SyntaxKind.Table;
	contents: luau.NodeArray<luau.ExpressionValue | PropertyAssignment>;
}

/*********		KEYWORD 	*********/ /***/

export interface Keyword extends luau.Expression {
	symbol: symbol;
	keyword: string;
}

export interface VarArgsKeyword extends luau.Keyword {
	kind: luau.SyntaxKind.VarArgsKeyword;
	keyword: "...";
}

export interface TrueKeyword extends luau.Keyword {
	kind: luau.SyntaxKind.TrueKeyword;
	keyword: "true";
}

export interface FalseKeyword extends luau.Keyword {
	kind: luau.SyntaxKind.FalseKeyword;
	keyword: "false";
}

export interface NilKeyword extends luau.Keyword {
	kind: luau.SyntaxKind.NilKeyword;
	keyword: "nil";
}

/*********	TOKENS 	*********/ /***/

export interface Token extends luau.Node {
	tokenSymbol: symbol;
	text: string;
}

export interface PlusEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.PlusEqualsToken;
	text: "+=";
}

export interface DashEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.DashEqualsToken;
	text: "-=";
}

export interface AsteriskEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.AsteriskEqualsToken;
	text: "*=";
}

export interface SlashEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.SlashEqualsToken;
	text: "/=";
}

export interface CaretEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.CaretEqualsToken;
	text: "^=";
}

export interface ConcatEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.ConcatEqualsToken;
	text: "..=";
}

export interface EqualsEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.EqualsEqualsToken;
	text: "==";
}

export interface TildeEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.TildeEqualsToken;
	text: "~=";
}

export interface PlusToken extends luau.Token {
	kind: luau.SyntaxKind.PlusToken;
	text: "+";
}

export interface DashToken extends luau.Token {
	kind: luau.SyntaxKind.DashToken;
	text: "-";
}

export interface AsteriskToken extends luau.Token {
	kind: luau.SyntaxKind.AsteriskToken;
	text: "*";
}

export interface AndToken extends luau.Token {
	kind: luau.SyntaxKind.AndToken;
	text: "and";
}

export interface OrToken extends luau.Token {
	kind: luau.SyntaxKind.OrToken;
	text: "or";
}

export interface SlashToken extends luau.Token {
	kind: luau.SyntaxKind.SlashToken;
	text: "/";
}

export interface CaretToken extends luau.Token {
	kind: luau.SyntaxKind.CaretToken;
	text: "^";
}

export interface EqualsToken extends luau.Token {
	kind: luau.SyntaxKind.EqualsToken;
	text: "=";
}

export interface ConcatToken extends luau.Token {
	kind: luau.SyntaxKind.ConcatToken;
	text: "..";
}

export interface NotToken extends luau.Token {
	kind: luau.SyntaxKind.NotToken;
	text: "not";
}

export interface GreaterThanToken extends luau.Token {
	kind: luau.SyntaxKind.GreaterThanToken;
	text: ">";
}

export interface LessThanToken extends luau.Token {
	kind: luau.SyntaxKind.LessThanToken;
	text: "<";
}

export interface GreaterEqualThanToken extends luau.Token {
	kind: luau.SyntaxKind.GreaterEqualThanToken;
	text: ">=";
}

export interface LessEqualThanToken extends luau.Token {
	kind: luau.SyntaxKind.LessEqualThanToken;
	text: "<=";
}

export interface HashToken extends luau.Token {
	kind: luau.SyntaxKind.HashToken;
	text: "#";
}

export interface PercentToken extends luau.Token {
	kind: luau.SyntaxKind.PercentToken;
	text: "%";
}

export interface PercentEqualsToken extends luau.Token {
	kind: luau.SyntaxKind.PercentEqualsToken;
	text: "%=";
}

// eslint-disable-next-line prettier/prettier
/*********	STATEMENTS 	*********/ /***/

export interface Statement extends luau.Node {
	statementSymbol: symbol;
}

export interface Comment extends Statement {
	kind: luau.SyntaxKind.Comment;
	lines: string[];
}

export interface Assignment extends Statement {
	kind: luau.SyntaxKind.Assignment;
	ids: luau.NodeArray<luau.IdentifierExpression>;
	initializers?: luau.NodeArray<luau.ExpressionValue>;
	assignmentToken: luau.AssignmentToken;
}

export interface EndOfFile extends Statement {}

export interface ExpressionStatement extends Statement {
	kind: luau.SyntaxKind.ExpressionStatement;
	expression: luau.Expression;
}

export interface VariableDeclaration extends Statement {
	kind: luau.SyntaxKind.VariableDeclaration;
	ids: luau.NodeArray<luau.Identifier>;
	initializers?: luau.NodeArray<luau.ExpressionValue>;
}

export interface ConditionalStatement extends Statement {
	expression: luau.Expression;
	statements: luau.NodeArray<luau.Statement>;
}

export interface IfStatement extends ConditionalStatement {
	kind: luau.SyntaxKind.IfStatement;
	elseBody?: IfStatement | luau.NodeArray<luau.Statement>;
}

export interface WhileStatement extends ConditionalStatement {
	kind: luau.SyntaxKind.WhileStatement;
}

export interface RepeatStatement extends ConditionalStatement {
	kind: luau.SyntaxKind.RepeatStatement;
}

export interface DoStatement extends Statement {
	kind: luau.SyntaxKind.DoStatement;
	statements: luau.NodeArray<luau.Statement>;
}

export interface ReturnStatement extends Statement {
	kind: luau.SyntaxKind.ReturnStatement;
	expression?: luau.NodeArray<luau.ExpressionValue>;
}

export interface BreakStatement extends Statement {
	kind: luau.SyntaxKind.BreakStatement;
}

export interface ContinueStatement extends Statement {
	kind: luau.SyntaxKind.ContinueStatement;
}

export interface ForStatement extends Statement {
	kind: luau.SyntaxKind.ForStatement;
	ids: luau.NodeArray<luau.Identifier>;
	iterators: luau.NodeArray<luau.ExpressionValue>;
	statements: luau.NodeArray<luau.Statement>;
}

export interface NumericForStatement extends Statement {
	kind: luau.SyntaxKind.NumericForStatement;
	id: luau.Identifier;
	start: luau.ExpressionValue;
	end: luau.ExpressionValue;
	step?: luau.ExpressionValue;
	statements: luau.NodeArray<luau.Statement>;
}

export interface FunctionDeclaration extends Statement {
	kind: luau.SyntaxKind.FunctionDeclaration;
	requiresLocal: boolean;
	id: luau.IdentifierExpression;
	expression: luau.FunctionExpression;
}

export interface SourceFile extends luau.Node {
	kind: luau.SyntaxKind.SourceFile;
	fileName: string;
	statements: luau.NodeArray<luau.Statement>;
}
