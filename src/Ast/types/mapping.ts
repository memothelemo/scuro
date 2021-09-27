import * as luau from "../bundle";

export interface PropertyIndexExpressionByKind
	extends IdentifierExpressionByKind {
	[luau.SyntaxKind.StringLiteral]: luau.StringLiteral;
	[luau.SyntaxKind.NumericLiteral]: luau.NumericLiteral;
	[luau.SyntaxKind.VarArgsKeyword]: luau.VarArgsKeyword;
	[luau.SyntaxKind.FunctionExpression]: luau.FunctionExpression;
}

export interface IdentifierExpressionByKind {
	[luau.SyntaxKind.Identifier]: luau.Identifier;
	[luau.SyntaxKind.PropertyAccessExpression]: luau.PropertyAccessExpression;
	[luau.SyntaxKind.ElementAccessExpression]: luau.ElementAccessExpression;
}

export interface IndexableExpressionByKind extends IdentifierExpressionByKind {
	[luau.SyntaxKind.MethodCallExpression]: luau.MethodCallExpression;
	[luau.SyntaxKind.CallExpression]: luau.CallExpression;
	[luau.SyntaxKind.ParenthesizedExpression]: luau.ParenthesizedExpression;
}

export interface AssignmentTokensByKind {
	[luau.SyntaxKind.PlusEqualsToken]: luau.PlusEqualsToken;
	[luau.SyntaxKind.DashEqualsToken]: luau.DashEqualsToken;
	[luau.SyntaxKind.AsteriskEqualsToken]: luau.AsteriskEqualsToken;
	[luau.SyntaxKind.SlashEqualsToken]: luau.SlashEqualsToken;
	[luau.SyntaxKind.CaretEqualsToken]: luau.CaretEqualsToken;
	[luau.SyntaxKind.ConcatEqualsToken]: luau.ConcatEqualsToken;
	[luau.SyntaxKind.EqualsToken]: luau.EqualsToken;
	[luau.SyntaxKind.PercentEqualsToken]: luau.PercentEqualsToken;
}

export interface BinaryTokensByKind extends MathTokensByKind {
	[luau.SyntaxKind.EqualsEqualsToken]: luau.EqualsEqualsToken;
	[luau.SyntaxKind.TildeEqualsToken]: luau.TildeEqualsToken;
	[luau.SyntaxKind.GreaterEqualThanToken]: luau.GreaterEqualThanToken;
	[luau.SyntaxKind.GreaterThanToken]: luau.GreaterThanToken;
	[luau.SyntaxKind.LessEqualThanToken]: luau.LessEqualThanToken;
	[luau.SyntaxKind.LessThanToken]: luau.LessThanToken;
	[luau.SyntaxKind.AndToken]: luau.AndToken;
	[luau.SyntaxKind.OrToken]: luau.OrToken;
	[luau.SyntaxKind.ConcatToken]: luau.ConcatToken;
}

export interface MathTokensByKind {
	[luau.SyntaxKind.PlusToken]: luau.PlusToken;
	[luau.SyntaxKind.DashToken]: luau.DashToken;
	[luau.SyntaxKind.AsteriskToken]: luau.AsteriskToken;
	[luau.SyntaxKind.SlashToken]: luau.SlashToken;
	[luau.SyntaxKind.CaretToken]: luau.CaretToken;
	[luau.SyntaxKind.PercentToken]: luau.PercentToken;
}

export interface UnaryTokensByKind {
	[luau.SyntaxKind.DashToken]: luau.DashToken;
	[luau.SyntaxKind.HashToken]: luau.HashToken;
	[luau.SyntaxKind.NotToken]: luau.NotToken;
}

export interface NodeByKind extends ExpressionByKind, StatementByKind {
	[luau.SyntaxKind.SourceFile]: luau.SourceFile;
}

export interface StatementByKind {
	[luau.SyntaxKind.Comment]: luau.Comment;
	[luau.SyntaxKind.Assignment]: luau.Assignment;
	[luau.SyntaxKind.ExpressionStatement]: luau.ExpressionStatement;
	[luau.SyntaxKind.VariableDeclaration]: luau.VariableDeclaration;
	[luau.SyntaxKind.IfStatement]: luau.IfStatement;
	[luau.SyntaxKind.DoStatement]: luau.DoStatement;
	[luau.SyntaxKind.WhileStatement]: luau.WhileStatement;
	[luau.SyntaxKind.RepeatStatement]: luau.RepeatStatement;
	[luau.SyntaxKind.ReturnStatement]: luau.ReturnStatement;
	[luau.SyntaxKind.BreakStatement]: luau.BreakStatement;
	[luau.SyntaxKind.ContinueStatement]: luau.ContinueStatement;
	[luau.SyntaxKind.ForStatement]: luau.ForStatement;
	[luau.SyntaxKind.NumericForStatement]: luau.NumericForStatement;
	[luau.SyntaxKind.FunctionDeclaration]: luau.FunctionDeclaration;
	[luau.SyntaxKind.EndOfFile]: luau.EndOfFile;
}

export interface ExpressionByKind {
	[luau.SyntaxKind.Identifier]: luau.Identifier;

	[luau.SyntaxKind.NumericLiteral]: luau.NumericLiteral;
	[luau.SyntaxKind.StringLiteral]: luau.StringLiteral;

	[luau.SyntaxKind.VarArgsKeyword]: luau.VarArgsKeyword;
	[luau.SyntaxKind.FalseKeyword]: luau.FalseKeyword;
	[luau.SyntaxKind.NilKeyword]: luau.NilKeyword;
	[luau.SyntaxKind.TrueKeyword]: luau.TrueKeyword;

	// short math tokens
	[luau.SyntaxKind.PlusEqualsToken]: luau.PlusEqualsToken;
	[luau.SyntaxKind.DashEqualsToken]: luau.DashEqualsToken;
	[luau.SyntaxKind.AsteriskEqualsToken]: luau.AsteriskEqualsToken;
	[luau.SyntaxKind.SlashEqualsToken]: luau.SlashEqualsToken;
	[luau.SyntaxKind.CaretEqualsToken]: luau.CaretEqualsToken;
	[luau.SyntaxKind.ConcatEqualsToken]: luau.ConcatEqualsToken;
	[luau.SyntaxKind.PercentEqualsToken]: luau.PercentEqualsToken;

	// conditional tokens
	[luau.SyntaxKind.EqualsEqualsToken]: luau.EqualsEqualsToken;
	[luau.SyntaxKind.TildeEqualsToken]: luau.TildeEqualsToken;
	[luau.SyntaxKind.GreaterEqualThanToken]: luau.GreaterEqualThanToken;
	[luau.SyntaxKind.GreaterThanToken]: luau.GreaterThanToken;
	[luau.SyntaxKind.LessEqualThanToken]: luau.LessEqualThanToken;
	[luau.SyntaxKind.LessThanToken]: luau.LessThanToken;

	// math tokens
	[luau.SyntaxKind.PlusToken]: luau.PlusToken;
	[luau.SyntaxKind.DashToken]: luau.DashToken;
	[luau.SyntaxKind.AsteriskToken]: luau.AsteriskToken;
	[luau.SyntaxKind.SlashToken]: luau.SlashToken;
	[luau.SyntaxKind.CaretToken]: luau.CaretToken;
	[luau.SyntaxKind.PercentToken]: luau.PercentToken;

	// conditional
	[luau.SyntaxKind.AndToken]: luau.AndToken;
	[luau.SyntaxKind.OrToken]: luau.OrToken;

	// unary
	[luau.SyntaxKind.NotToken]: luau.NotToken;

	// others
	[luau.SyntaxKind.ConcatToken]: luau.ConcatToken;
	[luau.SyntaxKind.EqualsToken]: luau.EqualsToken;
	[luau.SyntaxKind.HashToken]: luau.HashToken;

	// conditional stuff
	[luau.SyntaxKind.BinaryExpression]: luau.BinaryExpression;
	[luau.SyntaxKind.UnaryExpression]: luau.UnaryExpression;

	// accesses
	[luau.SyntaxKind.PropertyAccessExpression]: luau.PropertyAccessExpression;
	[luau.SyntaxKind.ElementAccessExpression]: luau.ElementAccessExpression;

	// calling
	[luau.SyntaxKind.CallExpression]: luau.CallExpression;
	[luau.SyntaxKind.MethodCallExpression]: luau.MethodCallExpression;
	[luau.SyntaxKind.FunctionExpression]: luau.FunctionExpression;

	// table
	[luau.SyntaxKind.Table]: luau.Table;
	[luau.SyntaxKind.PropertyAssignment]: luau.PropertyAssignment;

	// among stuff
	[luau.SyntaxKind.ParenthesizedExpression]: luau.ParenthesizedExpression;
}
