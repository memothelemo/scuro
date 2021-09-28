export enum SyntaxKind {
	SourceFile,
	Block,

	// ---- Statements ---- //
	DoStatement,
	VariableDeclarationStatement,
	AssignmentStatement,
	IfStatement,
	WhileStatement,
	RepeatStatement,
	GenericForStatement,
	NumericForStatement,
	ReturnStatement,
	BreakStatement,
	ExpressionStatement,

	// Lua 5.2
	GotoStatement,
	LabelStatement,

	// ---- Expression ---- //
	StringLiteral,
	NumericLiteral,
	NilKeyword,
	DotsKeyword,
	TrueKeyword,
	FalseKeyword,
	FunctionExpression,
	TableFieldExpression,
	TableExpression,
	UnaryExpression,
	BinaryExpression,
	CallExpression,
	MethodCallExpression,
	Identifier,
	ParenthesizedExpression,
	TableIndexExpression,

	// ---- Operators ---- //

	// Arithmetic
	AdditionOperator,
	SubtractionOperator,
	MultiplicationOperator,
	DivisionOperator,
	FloorDivisionOperator,
	ModuloOperator,
	PowerOperator,
	NegationOperator, // Unary minus

	// Concat
	ConcatOperator,

	// Length
	LengthOperator, // Unary

	// Relational Ops
	EqualityOperator,
	InequalityOperator,
	LessThanOperator,
	LessEqualOperator,
	GreaterThanOperator,
	GreaterEqualOperator,

	// Logical
	AndOperator,
	OrOperator,
	NotOperator, // Unary

	// Bitwise (Lua 5.3)
	BitwiseAndOperator,
	BitwiseOrOperator,
	BitwiseExclusiveOrOperator,
	BitwiseRightShiftOperator,
	BitwiseLeftShiftOperator,
	BitwiseNotOperator, // Unary
}
