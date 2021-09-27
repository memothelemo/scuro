import * as luau from "../bundle";

function primitive<T extends luau.SyntaxKind>(...kinds: T[]) {
	return (node: luau.Node): node is luau.NodeByKind[T] =>
		kinds.some(v => v === node.kind);
}

// CORE TYPE GUARDS //
export function isExpression(node: luau.Node): node is luau.Expression {
	// look out for symbols
	return typeof (node as luau.Expression).expressionSymbol === "symbol";
}

export function isStatement(node: luau.Node): node is luau.Statement {
	// look out for symbols
	return typeof (node as luau.Statement).statementSymbol === "symbol";
}

export function isToken(node: luau.Node): node is luau.Token {
	// look out for symbols
	return typeof (node as luau.Token).tokenSymbol === "symbol";
}

export const isSourceFile = primitive(luau.SyntaxKind.SourceFile);

// EXPRESSIONS //
export const isIdentifier = primitive(luau.SyntaxKind.Identifier);
export const isNumericLiteral = primitive(luau.SyntaxKind.NumericLiteral);
export const isStringLiteral = primitive(luau.SyntaxKind.StringLiteral);
export const isVarArgsKeyword = primitive(luau.SyntaxKind.VarArgsKeyword);
export const isFalseKeyword = primitive(luau.SyntaxKind.FalseKeyword);
export const isNilKeyword = primitive(luau.SyntaxKind.NilKeyword);
export const isTrueKeyword = primitive(luau.SyntaxKind.TrueKeyword);
export const isPlusEqualsToken = primitive(luau.SyntaxKind.PlusEqualsToken);
export const isDashEqualsToken = primitive(luau.SyntaxKind.DashEqualsToken);
export const isAsteriskEqualsToken = primitive(
	luau.SyntaxKind.AsteriskEqualsToken,
);
export const isSlashEqualsToken = primitive(luau.SyntaxKind.SlashEqualsToken);
export const isCaretEqualsToken = primitive(luau.SyntaxKind.CaretEqualsToken);
export const isConcatEqualsToken = primitive(luau.SyntaxKind.ConcatEqualsToken);
export const isPercentEqualsToken = primitive(
	luau.SyntaxKind.PercentEqualsToken,
);
export const isEqualsEqualsToken = primitive(luau.SyntaxKind.EqualsEqualsToken);
export const isTildeEqualsToken = primitive(luau.SyntaxKind.TildeEqualsToken);
export const isGreaterEqualThanToken = primitive(
	luau.SyntaxKind.GreaterEqualThanToken,
);
export const isGreaterThanToken = primitive(luau.SyntaxKind.GreaterThanToken);
export const isLessEqualThanToken = primitive(
	luau.SyntaxKind.LessEqualThanToken,
);
export const isLessThanToken = primitive(luau.SyntaxKind.LessThanToken);
export const isPlusToken = primitive(luau.SyntaxKind.PlusToken);
export const isDashToken = primitive(luau.SyntaxKind.DashToken);
export const isAsteriskToken = primitive(luau.SyntaxKind.AsteriskToken);
export const isSlashToken = primitive(luau.SyntaxKind.SlashToken);
export const isCaretToken = primitive(luau.SyntaxKind.CaretToken);
export const isPercentToken = primitive(luau.SyntaxKind.PercentToken);
export const isAndToken = primitive(luau.SyntaxKind.AndToken);
export const isOrToken = primitive(luau.SyntaxKind.OrToken);
export const isNotToken = primitive(luau.SyntaxKind.NotToken);
export const isConcatToken = primitive(luau.SyntaxKind.ConcatToken);
export const isEqualsToken = primitive(luau.SyntaxKind.EqualsToken);
export const isHashToken = primitive(luau.SyntaxKind.HashToken);
export const isBinaryExpression = primitive(luau.SyntaxKind.BinaryExpression);
export const isUnaryExpression = primitive(luau.SyntaxKind.UnaryExpression);
export const isPropertyAccessExpression = primitive(
	luau.SyntaxKind.PropertyAccessExpression,
);
export const isElementAccessExpression = primitive(
	luau.SyntaxKind.ElementAccessExpression,
);
export const isCallExpression = primitive(luau.SyntaxKind.CallExpression);
export const isMethodCallExpression = primitive(
	luau.SyntaxKind.MethodCallExpression,
);
export const isFunctionExpression = primitive(
	luau.SyntaxKind.FunctionExpression,
);
export const isTable = primitive(luau.SyntaxKind.Table);
export const isPropertyAssignment = primitive(
	luau.SyntaxKind.PropertyAssignment,
);
export const isParenthesizedExpression = primitive(
	luau.SyntaxKind.ParenthesizedExpression,
);

// STATEMENTS
export const isComment = primitive(luau.SyntaxKind.Comment);
export const isAssignment = primitive(luau.SyntaxKind.Assignment);
export const isExpressionStatement = primitive(
	luau.SyntaxKind.ExpressionStatement,
);
export const isVariableDeclaration = primitive(
	luau.SyntaxKind.VariableDeclaration,
);
export const isIfStatement = primitive(luau.SyntaxKind.IfStatement);
export const isDoStatement = primitive(luau.SyntaxKind.DoStatement);
export const isWhileStatement = primitive(luau.SyntaxKind.WhileStatement);
export const isRepeatStatement = primitive(luau.SyntaxKind.RepeatStatement);
export const isReturnStatement = primitive(luau.SyntaxKind.ReturnStatement);
export const isBreakStatement = primitive(luau.SyntaxKind.BreakStatement);
export const isContinueStatement = primitive(luau.SyntaxKind.ContinueStatement);
export const isForStatement = primitive(luau.SyntaxKind.ForStatement);
export const isNumericForStatement = primitive(
	luau.SyntaxKind.NumericForStatement,
);
export const isFunctionDeclaration = primitive(
	luau.SyntaxKind.FunctionDeclaration,
);
export const isEndOfFile = primitive(luau.SyntaxKind.EndOfFile);
