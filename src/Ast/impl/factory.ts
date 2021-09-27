import exp = require("constants");
import * as luau from "../bundle";

// this will caught me up if i add something to the syntax kind
type AllNodes = luau.NodeByKind[luau.SyntaxKind];

export function createIdentifier(id: string, parent?: luau.Node) {
	return luau.createExpression<luau.Identifier>(
		luau.SyntaxKind.Identifier,
		{
			id: id,
		},
		parent,
	);
}

export function createStringLiteral(value: string, parent?: luau.Node) {
	return luau.createExpression<luau.StringLiteral>(
		luau.SyntaxKind.StringLiteral,
		{
			value: value,
		},
		parent,
	);
}

export function createNumericLiteral(value: string, parent?: luau.Node) {
	return luau.createExpression<luau.NumericLiteral>(
		luau.SyntaxKind.NumericLiteral,
		{
			value: value,
		},
		parent,
	);
}

export function createTrueKeyword(parent?: luau.Node) {
	return luau.createKeyword<luau.TrueKeyword>(
		luau.SyntaxKind.TrueKeyword,
		"true",
		parent,
	);
}

export function createFalseKeyword(parent?: luau.Node) {
	return luau.createKeyword<luau.FalseKeyword>(
		luau.SyntaxKind.FalseKeyword,
		"false",
		parent,
	);
}

export function createNilKeyword(parent?: luau.Node) {
	return luau.createKeyword<luau.NilKeyword>(
		luau.SyntaxKind.NilKeyword,
		"nil",
		parent,
	);
}

export function createVarArgsKeyword(parent?: luau.Node) {
	return luau.createKeyword<luau.VarArgsKeyword>(
		luau.SyntaxKind.VarArgsKeyword,
		"...",
		parent,
	);
}

export function createPlusEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.PlusEqualsToken>(
		luau.SyntaxKind.PlusEqualsToken,
		"+=",
		parent,
	);
}

export function createDashEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.DashEqualsToken>(
		luau.SyntaxKind.DashEqualsToken,
		"-=",
		parent,
	);
}

export function createAsteriskEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.AsteriskEqualsToken>(
		luau.SyntaxKind.AsteriskEqualsToken,
		"*=",
		parent,
	);
}

export function createSlashEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.SlashEqualsToken>(
		luau.SyntaxKind.SlashEqualsToken,
		"/=",
		parent,
	);
}

export function createCaretEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.CaretEqualsToken>(
		luau.SyntaxKind.CaretEqualsToken,
		"^=",
		parent,
	);
}

export function createConcatEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.ConcatEqualsToken>(
		luau.SyntaxKind.ConcatEqualsToken,
		"..=",
		parent,
	);
}

export function createEqualsEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.EqualsEqualsToken>(
		luau.SyntaxKind.EqualsEqualsToken,
		"==",
		parent,
	);
}

export function createTildeEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.TildeEqualsToken>(
		luau.SyntaxKind.TildeEqualsToken,
		"~=",
		parent,
	);
}

export function createPlusToken(parent?: luau.Node) {
	return luau.createToken<luau.PlusToken>(
		luau.SyntaxKind.PlusToken,
		"+",
		parent,
	);
}

export function createDashToken(parent?: luau.Node) {
	return luau.createToken<luau.DashToken>(
		luau.SyntaxKind.DashToken,
		"-",
		parent,
	);
}

export function createAsteriskToken(parent?: luau.Node) {
	return luau.createToken<luau.AsteriskToken>(
		luau.SyntaxKind.AsteriskToken,
		"*",
		parent,
	);
}

export function createSlashToken(parent?: luau.Node) {
	return luau.createToken<luau.SlashToken>(
		luau.SyntaxKind.SlashToken,
		"/",
		parent,
	);
}

export function createCaretToken(parent?: luau.Node) {
	return luau.createToken<luau.CaretToken>(
		luau.SyntaxKind.CaretToken,
		"^",
		parent,
	);
}

export function createEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.EqualsToken>(
		luau.SyntaxKind.EqualsToken,
		"=",
		parent,
	);
}

export function createConcatToken(parent?: luau.Node) {
	return luau.createToken<luau.ConcatToken>(
		luau.SyntaxKind.ConcatToken,
		"..",
		parent,
	);
}

export function createOrToken(parent?: luau.Node) {
	return luau.createToken<luau.OrToken>(
		luau.SyntaxKind.OrToken,
		"or",
		parent,
	);
}

export function createAndToken(parent?: luau.Node) {
	return luau.createToken<luau.AndToken>(
		luau.SyntaxKind.AndToken,
		"and",
		parent,
	);
}

export function createNotToken(parent?: luau.Node) {
	return luau.createToken<luau.NotToken>(
		luau.SyntaxKind.NotToken,
		"not",
		parent,
	);
}

export function createGreaterThanToken(parent?: luau.Node) {
	return luau.createToken<luau.GreaterThanToken>(
		luau.SyntaxKind.GreaterThanToken,
		">",
		parent,
	);
}

export function createLessThanToken(parent?: luau.Node) {
	return luau.createToken<luau.LessThanToken>(
		luau.SyntaxKind.LessThanToken,
		"<",
		parent,
	);
}

export function createGreaterEqualThanToken(parent?: luau.Node) {
	return luau.createToken<luau.GreaterEqualThanToken>(
		luau.SyntaxKind.GreaterEqualThanToken,
		">=",
		parent,
	);
}

export function createLessEqualThanToken(parent?: luau.Node) {
	return luau.createToken<luau.LessEqualThanToken>(
		luau.SyntaxKind.LessEqualThanToken,
		"<=",
		parent,
	);
}

export function createHashToken(parent?: luau.Node) {
	return luau.createToken<luau.HashToken>(
		luau.SyntaxKind.HashToken,
		"#",
		parent,
	);
}

export function createPercentToken(parent?: luau.Node) {
	return luau.createToken<luau.PercentToken>(
		luau.SyntaxKind.PercentToken,
		"%",
		parent,
	);
}

export function createPercentEqualsToken(parent?: luau.Node) {
	return luau.createToken<luau.PercentEqualsToken>(
		luau.SyntaxKind.PercentEqualsToken,
		"%=",
		parent,
	);
}

export function createBinaryExpression(
	left: luau.ExpressionValue,
	operator: luau.BinaryToken,
	right: luau.ExpressionValue,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.BinaryExpression>(
		luau.SyntaxKind.BinaryExpression,
		{
			left: left,
			operator: operator,
			right: right,
		},
		parent,
	);
}

export function createUnaryExpression(
	operator: luau.UnaryToken,
	value: luau.ExpressionValue,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.UnaryExpression>(
		luau.SyntaxKind.UnaryExpression,
		{
			operator: operator,
			value: value,
		},
		parent,
	);
}

export function createPropertyAccessExpression(
	expression: luau.IndexableExpression,
	index: string,
	isMethod = false,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.PropertyAccessExpression>(
		luau.SyntaxKind.PropertyAccessExpression,
		{
			expression: expression,
			index: index,
			isMethod: isMethod,
		},
		parent,
	);
}

export function createElementAccessExpression(
	expression: luau.IndexableExpression,
	index: luau.ExpressionValue,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.ElementAccessExpression>(
		luau.SyntaxKind.ElementAccessExpression,
		{
			expression: expression,
			index: index,
		},
		parent,
	);
}

export function createCallExpression(
	id: luau.IdentifierExpression,
	parameters: luau.NodeArray<luau.ExpressionValue>,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.CallExpression>(
		luau.SyntaxKind.CallExpression,
		{
			id: id,
			parameters: parameters,
		},
		parent,
	);
}

export function createMethodCallExpression(
	base: luau.IdentifierExpression,
	id: luau.IdentifierExpression,
	parameters: luau.NodeArray<luau.ExpressionValue>,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.MethodCallExpression>(
		luau.SyntaxKind.MethodCallExpression,
		{
			base: base,
			id: id,
			parameters: parameters,
		},
		parent,
	);
}

export function createParenthesizedExpression(
	expression: luau.ExpressionValue,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.ParenthesizedExpression>(
		luau.SyntaxKind.ParenthesizedExpression,
		{
			expression: expression,
		},
		parent,
	);
}

export function createFunctionExpression(
	statements: luau.NodeArray<luau.Statement>,
	parameters: luau.NodeArray<luau.IdentifierExpression>,
	dots?: luau.VarArgsKeyword,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.FunctionExpression>(
		luau.SyntaxKind.FunctionExpression,
		{
			statements: statements,
			dots: dots,
			parameters: parameters,
		},
		parent,
	);
}

export function createPropertyAssignment(
	id: luau.PropertyIndexExpression,
	value: luau.ExpressionValue,
	isWrappedWithValue: boolean,
	parent?: luau.Node,
) {
	return luau.createExpression<luau.PropertyAssignment>(
		luau.SyntaxKind.PropertyAssignment,
		{
			id: id,
			value: value,
			isWrappedWithValue: isWrappedWithValue,
		},
		parent,
	);
}

export function createTable(
	contents: luau.Table["contents"],
	parent?: luau.Node,
) {
	return luau.createExpression<luau.Table>(
		luau.SyntaxKind.Table,
		{
			contents: contents,
		},
		parent,
	);
}

export function createComment(lines: string[], parent?: luau.Node) {
	return luau.createStatement<luau.Comment>(
		luau.SyntaxKind.Comment,
		{
			lines: lines,
		},
		parent,
	);
}

export function createAssignment(
	ids: luau.NodeArray<luau.Identifier>,
	initializers?: luau.NodeArray<luau.ExpressionValue>,
	assignmentToken?: luau.AssignmentToken,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.Assignment>(
		luau.SyntaxKind.Assignment,
		{
			ids: ids,
			initializers: initializers,
			assignmentToken: assignmentToken ?? luau.createEqualsToken(),
		},
		parent,
	);
}

export function createExpressionStatement(
	expression: luau.Expression,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.ExpressionStatement>(
		luau.SyntaxKind.ExpressionStatement,
		{
			expression: expression,
		},
		parent,
	);
}

export function createVariableDeclaration(
	ids: luau.NodeArray<luau.Identifier>,
	initializers?: luau.NodeArray<luau.ExpressionValue>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.VariableDeclaration>(
		luau.SyntaxKind.VariableDeclaration,
		{
			ids: ids,
			initializers: initializers,
		},
		parent,
	);
}

export function createIfStatement(
	expression: luau.Expression,
	statements: luau.NodeArray<luau.Statement>,
	elseBody?: luau.IfStatement | luau.NodeArray<luau.Statement>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.IfStatement>(
		luau.SyntaxKind.IfStatement,
		{
			expression: expression,
			statements: statements,
			elseBody: elseBody,
		},
		parent,
	);
}

export function createWhileStatement(
	expression: luau.Expression,
	statements: luau.NodeArray<luau.Statement>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.WhileStatement>(
		luau.SyntaxKind.WhileStatement,
		{
			expression: expression,
			statements: statements,
		},
		parent,
	);
}

export function createRepeatStatement(
	expression: luau.Expression,
	statements: luau.NodeArray<luau.Statement>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.RepeatStatement>(
		luau.SyntaxKind.RepeatStatement,
		{
			expression: expression,
			statements: statements,
		},
		parent,
	);
}

export function createDoStatement(
	statements: luau.NodeArray<luau.Statement>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.DoStatement>(
		luau.SyntaxKind.DoStatement,
		{
			statements: statements,
		},
		parent,
	);
}

export function createReturnStatement(
	expression?: luau.NodeArray<luau.ExpressionValue>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.ReturnStatement>(
		luau.SyntaxKind.ReturnStatement,
		{ expression: expression },
		parent,
	);
}

export function createBreakStatement(parent?: luau.Node) {
	return luau.createStatement<luau.BreakStatement>(
		luau.SyntaxKind.BreakStatement,
		{},
		parent,
	);
}

export function createContinueStatement(parent?: luau.Node) {
	return luau.createStatement<luau.ContinueStatement>(
		luau.SyntaxKind.ContinueStatement,
		{},
		parent,
	);
}

export function createForStatement(
	ids: luau.NodeArray<luau.Identifier>,
	iterators: luau.NodeArray<luau.ExpressionValue>,
	statements: luau.NodeArray<luau.Statement>,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.ForStatement>(
		luau.SyntaxKind.ForStatement,
		{
			ids: ids,
			iterators: iterators,
			statements: statements,
		},
		parent,
	);
}

export function createNumericForStatement(
	id: luau.Identifier,
	start: luau.ExpressionValue,
	end: luau.ExpressionValue,
	statements: luau.NodeArray<luau.Statement>,
	step?: luau.ExpressionValue,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.NumericForStatement>(
		luau.SyntaxKind.NumericForStatement,
		{
			id: id,
			start: start,
			end: end,
			step: step,
			statements: statements,
		},
		parent,
	);
}

export function createFunctionDeclaration(
	id: luau.IdentifierExpression,
	expression: luau.FunctionExpression,
	requiresLocal = false,
	parent?: luau.Node,
) {
	return luau.createStatement<luau.FunctionDeclaration>(
		luau.SyntaxKind.FunctionDeclaration,
		{
			requiresLocal: requiresLocal,
			id: id,
			expression: expression,
		},
		parent,
	);
}

export function createEndOfFile(parent?: luau.Node) {
	return luau.createStatement<luau.EndOfFile>(
		luau.SyntaxKind.EndOfFile,
		{},
		parent,
	);
}

export function createSourceFile(
	statements: luau.NodeArray<luau.Statement>,
	fileName = "<stdin>",
	parent?: luau.Node,
) {
	return luau.createNode<luau.SourceFile>(
		luau.SyntaxKind.SourceFile,
		{
			statements: statements,
			fileName: fileName,
		},
		parent,
	);
}
