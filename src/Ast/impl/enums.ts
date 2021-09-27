export enum SyntaxKind {
	/// EXPRESSIONS ///
	Identifier,

	StringLiteral,
	NumericLiteral,

	VarArgsKeyword,
	TrueKeyword,
	FalseKeyword,
	NilKeyword,

	// short math tokens
	PlusEqualsToken,
	DashEqualsToken,
	AsteriskEqualsToken,
	SlashEqualsToken,
	CaretEqualsToken,
	ConcatEqualsToken,
	PercentEqualsToken,

	// conditional tokens
	EqualsEqualsToken,
	TildeEqualsToken,
	GreaterThanToken,
	LessThanToken,
	GreaterEqualThanToken,
	LessEqualThanToken,

	// math
	PlusToken,
	DashToken,
	AsteriskToken,
	SlashToken,
	CaretToken,
	PercentToken,

	EqualsToken,
	ConcatToken,
	HashToken,

	// conditional
	OrToken,
	AndToken,

	// unary tokens
	NotToken,

	BinaryExpression,
	UnaryExpression,

	// lua table
	Table,
	PropertyAssignment,

	// accesses
	PropertyAccessExpression,
	ElementAccessExpression,

	// calling
	FunctionExpression,
	CallExpression,
	MethodCallExpression,

	// among stuff
	ParenthesizedExpression,

	/// STATEMENTS ///
	Comment,

	Assignment,

	ExpressionStatement,
	EndOfFile,

	VariableDeclaration,
	FunctionDeclaration,

	IfStatement,
	DoStatement,
	WhileStatement,
	RepeatStatement,

	ReturnStatement,
	BreakStatement,
	ContinueStatement,

	ForStatement,
	NumericForStatement,

	/// CORE ///
	SourceFile,
}
