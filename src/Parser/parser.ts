import chalk from "chalk";
import { inspect } from "util";
import luau from "../Ast";
import { Lexer } from "../Lexer";
import { LogError } from "../Shared/error";
import { StringToken, Token, TokenKind } from "../Lexer/token";

export class ParserError extends LogError {
	constructor(
		public readonly message: string,
		public readonly fileName: string,
		public readonly token: Token,
	) {
		super();
	}

	toString() {
		return `${chalk.cyanBright(this.fileName)}:${chalk.yellow(
			this.token.row,
		)}:${chalk.yellow(this.token.column)}: ${this.message}\n`;
	}
}

interface Scope {
	id: number;
	isInLoop: boolean;
}

class Context {
	private scopes = new Array<Scope>();

	isInLoop() {
		let i = this.scopes.length;
		while (i-- > 0) {
			if (this.scopes[i].isInLoop) {
				return true;
			}
		}
		return false;
	}

	pushScope(isLoop: boolean) {
		this.scopes.push({
			id: this.scopes.length + 1,
			isInLoop: isLoop,
		});
	}

	popScope() {
		this.scopes.pop();
	}

	getCurrentScopeId() {
		return this.scopes.length - 1;
	}

	getCurrentScope() {
		return this.scopes[this.scopes.length - 1];
	}
}

export class Parser {
	private ptr = 0;
	private tokensLength = 0;
	private defaultUnopPrio = 8;
	private priority: Record<string, [number, number] | undefined> = {
		"+": [6, 6],
		"-": [6, 6],
		"%": [7, 7],
		"/": [7, 7],
		"*": [7, 7],
		"^": [10, 9],
		"..": [5, 4],
		"==": [3, 3],
		"<": [3, 3],
		"<=": [3, 3],
		"~=": [3, 3],
		">": [3, 3],
		">=": [3, 3],
		and: [2, 2],
		or: [1, 1],
	};
	private context = new Context();

	public constructor(private tokens: Token[]) {
		this.tokensLength = tokens.length;
	}

	public static fromSource(source: string, fileName?: string) {
		const tokens = Lexer.fromSource(source, fileName).tokenize();
		return new Parser(tokens);
	}

	// utils
	private throwError(reason: string, token?: Token): never {
		token = token ?? this.peek();
		throw new ParserError(reason, "stdin", token);
	}

	private isStatementListCloseKeyword() {
		switch (this.peek().value) {
			case "end":
			case "else":
			case "elseif":
			case "until":
				return true;
			default:
				return false;
		}
	}

	private peek(offset = 0) {
		return this.tokens[this.ptr + offset];
	}

	private hasNext() {
		return this.tokensLength >= this.ptr;
	}

	private isEof() {
		return this.peek().kind === TokenKind.Eof;
	}

	private isSymbol(symbol: string) {
		if (this.is(TokenKind.Symbol)) {
			return this.peek().value === symbol;
		}
		return false;
	}

	private isKeyword(keyword: string) {
		if (this.is(TokenKind.Keyword)) {
			return this.peek().value === keyword;
		}
		return false;
	}

	private next() {
		const token = this.peek();
		this.ptr++;
		return token;
	}

	private is(kind: TokenKind) {
		if (this.peek() === undefined) {
			return false;
		}
		return this.peek().kind === kind;
	}

	private consumeKeyword(keyword: string) {
		if (this.isKeyword(keyword)) {
			return this.next();
		}
	}

	private consumeSymbol(symbol: string) {
		if (this.isSymbol(symbol)) {
			return this.next();
		}
	}

	// operator utility
	private makeUnaryOperatorFromText(operator: string) {
		switch (operator) {
			case "-":
				return luau.createDashToken();
			case "#":
				return luau.createHashToken();
			case "not":
				return luau.createNotToken();
			default:
				this.throwError(`Unknown unary operator: ${operator}`);
		}
	}

	private makeBinaryOperatorFromText(operator: string): luau.BinaryToken {
		switch (operator) {
			case "-":
				return luau.createDashToken();
			case "+":
				return luau.createPlusToken();
			case "*":
				return luau.createAsteriskToken();
			case "/":
				return luau.createSlashToken();
			case "^":
				return luau.createCaretToken();
			case "%":
				return luau.createPercentToken();
			case "==":
				return luau.createEqualsEqualsToken();
			case "~=":
				return luau.createTildeEqualsToken();
			case ">=":
				return luau.createGreaterEqualThanToken();
			case ">":
				return luau.createGreaterThanToken();
			case "<=":
				return luau.createLessEqualThanToken();
			case "<":
				return luau.createLessThanToken();
			case "and":
				return luau.createAndToken();
			case "or":
				return luau.createOrToken();
			case "..":
				return luau.createConcatToken();
			default:
				this.throwError(`Unknown binary operator: ${operator}`);
		}
	}

	// expressions
	private isUnaryOperator(data: string) {
		switch (data) {
			case "-":
			case "not":
			case "#":
				return true;
			default:
				break;
		}
	}

	private parseIdentifier() {
		if (this.is(TokenKind.Identifier) || this.isKeyword("type")) {
			// type function is the only expection in this rule because of luau
			const token = this.next();
			const id = luau.createIdentifier(token.value);
			this.injectTextRange(token, id);
			return id;
		}
		this.throwError("Identifier expected");
	}

	private parseTable() {
		const contents = luau.NodeArray.make<
			luau.PropertyAssignment | luau.Identifier
		>();

		while (true) {
			// table keys
			if (this.consumeSymbol("[")) {
				const key = this.parseExpression();
				if (!this.consumeSymbol("]")) {
					this.throwError("`]` expected.");
				}
				if (!this.consumeSymbol("=")) {
					this.throwError("`=` expected.");
				}
				const value = this.parseExpression();
				luau.NodeArray.push(
					contents,
					luau.createPropertyAssignment(
						key as luau.PropertyIndexExpression,
						value as luau.ExpressionValue,
						true,
					),
				);
			} else if (this.is(TokenKind.Identifier)) {
				// array or assignment?
				const lookAhead = this.peek(1);

				// who cares? lol
				if (lookAhead.value === "=") {
					// we're in assignment...
					const key = this.parseExpression();
					if (!this.consumeSymbol("=")) {
						this.throwError("`=` expected.");
					}
					const value = this.parseExpression();
					luau.NodeArray.push(
						contents,
						luau.createPropertyAssignment(
							key as luau.PropertyIndexExpression,
							value as luau.ExpressionValue,
							false,
						),
					);
				} else {
					// array value
					const value = this.parseExpression();
					luau.NodeArray.push(contents, value);
				}
			} else if (this.consumeSymbol("}")) {
				break;
			} else {
				// array value
				const value = this.parseExpression();
				luau.NodeArray.push(contents, value);
			}
			if (this.consumeSymbol(";") || this.consumeSymbol(",")) {
				// stop marker
			} else if (this.consumeSymbol("}")) {
				break;
			} else {
				this.throwError("`}` or table entry expected.");
			}
		}

		return luau.createTable(contents);
	}

	private injectTextRange<T extends luau.Node>(token: Token, node: T): T {
		node.textRange = {
			row: token.row,
			column: token.column,
		};
		return node;
	}

	private parseComplexExpression(level: number): luau.Expression {
		let headToken = this.peek();
		let exp: luau.Expression;
		if (this.isUnaryOperator(this.peek().value)) {
			const unarySymbol = this.next();
			const operator = this.makeUnaryOperatorFromText(unarySymbol.value);
			this.injectTextRange(unarySymbol, operator);

			exp = this.injectTextRange(
				unarySymbol,
				luau.createUnaryExpression(
					operator,
					this.parseComplexExpression(
						this.defaultUnopPrio,
					) as luau.ExpressionValue,
				),
			);
		} else {
			exp = this.parseSimpleExpression();
		}

		// next items in chain (binary)
		while (true) {
			const prio = this.priority[this.peek().value];
			if (prio && prio[0] > level) {
				const operator = this.makeBinaryOperatorFromText(
					this.next().value,
				);
				const rightExp = this.parseComplexExpression(prio[1]);
				exp = this.injectTextRange(
					headToken,
					luau.createBinaryExpression(
						exp as luau.ExpressionValue,
						operator,
						rightExp as luau.ExpressionValue,
					),
				);
				headToken = this.peek();
			} else {
				break;
			}
		}

		return exp;
	}

	private parsePrimaryExpression() {
		// parenthesized expression
		if (this.consumeSymbol("(")) {
			const expression = this.parseExpression() as luau.ExpressionValue;
			if (!this.consumeSymbol(")")) {
				this.throwError("`)` expected.");
			}
			return luau.createParenthesizedExpression(expression);
		} else if (this.is(TokenKind.Identifier) || this.isKeyword("type")) {
			// type function is the only expection in this rule because of luau
			return this.parseIdentifier();
		}
		this.throwError("<exp> expected");
	}

	private makeCallExpressionFromSuffixed(primary: luau.Expression) {
		// call expression
		const args = luau.NodeArray.make<luau.ExpressionValue>();
		while (!this.consumeSymbol(")")) {
			luau.NodeArray.push(args, this.parseExpression());
			if (!this.consumeSymbol(",")) {
				if (this.consumeSymbol(")")) break;
				this.throwError("`)` expected");
			} else {
				if (this.consumeSymbol(")")) {
					this.throwError(`<exp> expected`);
				}
			}
		}
		return luau.createCallExpression(
			primary as luau.IdentifierExpression,
			args,
		);
	}

	private makeShortCallExpressionFromSuffixed(primary: luau.Expression) {
		// call expression
		const exp = this.parseExpression();
		return luau.createCallExpression(
			primary as luau.IdentifierExpression,
			luau.NodeArray.make(false, exp as luau.ExpressionValue),
		);
	}

	private parseSuffixedExpression(
		onlyDotColon = false,
		makeCallIfMethod = false,
	) {
		const primaryToken = this.peek();
		let primary: luau.Expression = this.parsePrimaryExpression();
		while (true) {
			if (this.isSymbol(".") || this.isSymbol(":")) {
				// property access or method call
				const token = this.next();
				const isMethod = token.value === ":";
				const id = this.parseIdentifier();

				primary = this.injectTextRange(
					token,
					luau.createPropertyAccessExpression(
						primary as luau.IndexableExpression,
						id!.id,
						isMethod,
					),
				);

				if (isMethod && makeCallIfMethod) {
					if (this.consumeSymbol("(")) {
						primary = this.injectTextRange(
							token,
							this.makeCallExpressionFromSuffixed(primary),
						);
					} else {
						primary = this.injectTextRange(
							token,
							this.makeShortCallExpressionFromSuffixed(primary),
						);
					}
				}
			} else if (!onlyDotColon && this.consumeSymbol("[")) {
				// element access
				const index = this.parseExpression();
				if (!this.consumeSymbol("]")) {
					this.throwError("`]` expected.");
				}
				primary = this.injectTextRange(
					primaryToken,
					luau.createElementAccessExpression(
						primary as luau.IndexableExpression,
						index as luau.ExpressionValue,
					),
				);
			} else if (!onlyDotColon && this.is(TokenKind.String)) {
				primary = this.injectTextRange(
					primaryToken,
					this.makeShortCallExpressionFromSuffixed(primary),
				);
			} else if (!onlyDotColon && this.isSymbol("{")) {
				primary = this.injectTextRange(
					primaryToken,
					this.makeShortCallExpressionFromSuffixed(primary),
				);
			} else if (!onlyDotColon && this.consumeSymbol("(")) {
				primary = this.injectTextRange(
					primaryToken,
					this.makeCallExpressionFromSuffixed(primary),
				);
			} else {
				break;
			}
		}
		return primary;
	}

	private parseSimpleExpression(): luau.Expression {
		const token = this.peek(1);
		if (this.is(TokenKind.String)) {
			return this.injectTextRange(
				token,
				luau.createStringLiteral((this.next() as StringToken).constant),
			);
		} else if (this.is(TokenKind.Number)) {
			return this.injectTextRange(
				token,
				luau.createNumericLiteral(this.next().value),
			);
		} else if (this.consumeKeyword("nil")) {
			return this.injectTextRange(token, luau.createNilKeyword());
		} else if (this.isKeyword("false") || this.isKeyword("true")) {
			if (this.next().value === "true") {
				return this.injectTextRange(token, luau.createTrueKeyword());
			}
			return this.injectTextRange(token, luau.createFalseKeyword());
		} else if (this.consumeSymbol("...")) {
			return this.injectTextRange(token, luau.createVarArgsKeyword());
		} else if (this.consumeSymbol("{")) {
			return this.injectTextRange(token, this.parseTable());
		} else if (this.consumeKeyword("function")) {
			return this.injectTextRange(token, this.parseFunctionExpression());
		}
		return this.parseSuffixedExpression(false, true);
	}

	private parseExpression() {
		return this.parseComplexExpression(0);
	}

	private parseFunctionExpression() {
		if (!this.consumeSymbol("(")) {
			this.throwError("( expected");
		}

		// argument list
		const argList = luau.NodeArray.make<luau.Identifier>(false);
		let isVarArg = false;
		while (!this.consumeSymbol(")")) {
			if (this.is(TokenKind.Identifier)) {
				const argToken = this.peek();
				luau.NodeArray.push(
					argList,
					this.injectTextRange(argToken, this.parseIdentifier()),
				);
				if (!this.consumeSymbol(",")) {
					if (this.consumeSymbol(")")) {
						break;
					}
					this.throwError(`) expected`);
				} else {
					if (this.consumeSymbol(")")) {
						this.throwError(`<identifier> expected`);
					}
				}
			} else if (this.consumeSymbol("...")) {
				isVarArg = true;
				if (!this.consumeSymbol(")")) {
					this.throwError(
						"`...` must be the last argument of a function",
					);
				}
				break;
			} else {
				this.throwError("Argument identifier or `...` expected");
			}
		}

		// body
		const body = this.parseStatementList(false);

		// end
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected after the function body");
		}

		return luau.createFunctionExpression(
			body,
			argList,
			isVarArg ? luau.createVarArgsKeyword() : undefined,
		);
	}

	// if statement
	private parseSubIfStatement() {
		const startToken = this.peek(-1);
		const condition = this.parseExpression();
		if (!this.consumeKeyword("then")) {
			this.throwError("`then` expected.");
		}
		const list = this.parseStatementList(false);
		return this.injectTextRange(
			startToken,
			luau.createIfStatement(condition, list),
		);
	}

	private parseIfStatement() {
		const clauses = new Array<luau.IfStatement>();

		// clauses
		while (true) {
			const clauseStatement = this.parseSubIfStatement();
			clauses.push(clauseStatement);
			if (!this.consumeKeyword("elseif")) break;
		}

		// else clause
		let elseBody: luau.NodeArray<luau.Statement> | undefined;
		if (this.consumeKeyword("else")) {
			this.context.pushScope(false);
			elseBody = this.parseStatementList(false);
			this.context.popScope();
		}

		// end
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		// compress all clauses into one single
		// chunk of if statements
		let currentStatement: luau.IfStatement | undefined;
		for (let i = clauses.length - 1; i >= 0; i--) {
			const clause = clauses[i];
			const textRange = clauses[i].textRange!;
			currentStatement = luau.createIfStatement(
				clause.expression,
				clause.statements,
				currentStatement ?? elseBody,
			);
			currentStatement.textRange = textRange;
		}

		// is it a good idea to do that?
		return currentStatement!;
	}

	// function expressions
	private parseVariableDeclaration() {
		const startToken = this.peek(-1);
		const varList = luau.NodeArray.make<luau.Identifier>(
			false,
			this.parseIdentifier(),
		);

		while (this.consumeSymbol(",")) {
			if (!this.is(TokenKind.Identifier)) {
				this.throwError("local <identifier> expected");
			}
			luau.NodeArray.push(varList, this.parseIdentifier());
		}

		const initList = luau.NodeArray.make<luau.ExpressionValue>();

		if (this.consumeSymbol("=")) {
			while (true) {
				const exp = this.parseExpression();
				luau.NodeArray.push(initList, exp);
				if (!this.consumeSymbol(",")) break;
			}
		}

		return this.injectTextRange(
			startToken,
			luau.createVariableDeclaration(varList, initList),
		);
	}

	private parseFunctionDeclaration(isWithLocal = false) {
		if (!this.is(TokenKind.Identifier)) {
			this.throwError(`function <name> expected`);
		}
		const startToken = this.peek(-1);
		const name = this.parseSuffixedExpression(true);
		const expression = this.parseFunctionExpression();
		return this.injectTextRange(
			startToken,
			luau.createFunctionDeclaration(
				name as luau.Identifier,
				expression,
				isWithLocal,
			),
		);
	}

	private parseBaseDeclaration(): luau.Statement {
		if (this.is(TokenKind.Identifier)) {
			return this.parseVariableDeclaration();
		} else if (this.consumeKeyword("function")) {
			return this.parseFunctionDeclaration(true);
		}
		this.throwError(`local <identifier> or <function> expected`);
	}

	// return statement
	private parseReturnStatement() {
		const startToken = this.peek(-1);
		let expList = luau.NodeArray.make<luau.ExpressionValue>(false);
		if (!this.isInEnd() && !this.consumeSymbol(";")) {
			const firstExpr = this.parseExpression();
			luau.NodeArray.push(expList, firstExpr as luau.ExpressionValue);
			while (this.consumeSymbol(",")) {
				const exp = this.parseExpression();
				luau.NodeArray.push(expList, exp);
			}
		}
		return this.injectTextRange(
			startToken,
			luau.createReturnStatement(expList),
		);
	}

	private printAst(node: luau.Node, indent = 0) {
		let indentStr = "  ".repeat(indent);
		console.log(indentStr + luau.SyntaxKind[node.kind]);
		node.getChildren().forEach(node => {
			this.printAst(node, indent + 2);
		});
	}

	// assignment or call
	private isAssignmentOperator() {
		if (!this.is(TokenKind.Symbol)) return false;
		switch (this.peek().value) {
			case "=":
			case "-=":
			case "+=":
			case "*=":
			case "/=":
			case "^=":
			case "..=":
			case "%=":
				return true;
			default:
				return false;
		}
	}

	private consumeAssigmentOperators() {
		if (!this.is(TokenKind.Symbol)) return undefined;
		if (this.isAssignmentOperator()) {
			return this.next();
		}
		return undefined;
	}

	private makeAssignmentTokenFromText(
		operator: string,
	): luau.AssignmentToken | undefined {
		switch (operator) {
			case "=":
				return luau.createEqualsToken();
			case "-=":
				return luau.createSlashEqualsToken();
			case "+=":
				return luau.createPlusEqualsToken();
			case "*=":
				return luau.createAsteriskEqualsToken();
			case "/=":
				return luau.createSlashEqualsToken();
			case "^=":
				return luau.createCaretEqualsToken();
			case "..=":
				return luau.createConcatEqualsToken();
			case "%=":
				return luau.createPercentEqualsToken();
			default:
				return undefined;
		}
	}

	private parseAssignmentOrCall() {
		const expression = this.parseSuffixedExpression(false, true);
		if (this.isSymbol(",") || this.isAssignmentOperator()) {
			// check if it was not parenthesized
			if (luau.isParenthesizedExpression(expression)) {
				this.throwError(
					"Can not assign to parenthesized expression, is not a left value",
				);
			}

			// more processing needed
			const identifiers = luau.NodeArray.make<luau.Identifier>(
				false,
				expression as luau.Identifier,
			);

			while (this.consumeSymbol(",")) {
				const exp = this.parseSuffixedExpression() as luau.Identifier;
				luau.NodeArray.push(identifiers, exp);
			}

			// assignment operators
			const assignmentOpInSymbol = this.consumeAssigmentOperators();
			if (!assignmentOpInSymbol) {
				this.throwError("`=` expected");
			}

			const assignOperator = this.makeAssignmentTokenFromText(
				assignmentOpInSymbol.value,
			);

			// right side
			const values = luau.NodeArray.make<luau.ExpressionValue>(
				false,
				this.parseExpression() as luau.ExpressionValue,
			);

			while (this.consumeSymbol(",")) {
				const exp = this.parseExpression() as luau.Identifier;
				luau.NodeArray.push(values, exp);
			}

			const statement = luau.createAssignment(
				identifiers,
				values,
				assignOperator,
			);
			statement.textRange = expression.textRange;
			return statement;
		} else if (luau.isCallExpression(expression)) {
			const statement = luau.createExpressionStatement(expression);
			statement.textRange = expression.textRange;
			return statement;
		} else {
			this.throwError(`Unknown token: ${inspect(this.peek(), true, 10)}`);
		}
	}

	// do statement
	private parseDoStatement() {
		const startToken = this.peek(-1);
		const list = this.parseStatementList(false);
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected.");
		}
		return this.injectTextRange(startToken, luau.createDoStatement(list));
	}

	// while statement
	private parseWhileStatement() {
		const startToken = this.peek(-1);

		// condition
		const expression = this.parseExpression();

		// do
		if (!this.consumeKeyword("do")) {
			this.throwError("`do` expected");
		}

		// body
		const list = this.parseStatementList(true);

		// end
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		return this.injectTextRange(
			startToken,
			luau.createWhileStatement(expression, list),
		);
	}

	// for statements
	private parseNumericForStatement(identifier: luau.Identifier) {
		// for i = {exp}, {exp}, {exp}? do
		const minExpr = this.parseExpression() as luau.ExpressionValue;
		if (!this.consumeSymbol(",")) {
			this.throwError("`,` expected");
		}
		const maxExpr = this.parseExpression() as luau.ExpressionValue;

		// step is optional
		let stepEx: luau.ExpressionValue | undefined;
		if (this.consumeSymbol(",")) {
			stepEx = this.parseExpression() as luau.ExpressionValue;
		}

		if (!this.consumeKeyword("do")) {
			this.throwError("`do` expected");
		}
		const list = this.parseStatementList(true);
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		return luau.createNumericForStatement(
			identifier,
			minExpr,
			maxExpr,
			list,
			stepEx,
		);
	}

	private parseGenericForStatement(identifier: luau.Identifier) {
		const varList = luau.NodeArray.make<luau.Identifier>(false, identifier);
		while (this.consumeSymbol(",")) {
			if (!this.is(TokenKind.Identifier)) {
				this.throwError(`Expected <identifier>`);
			}
			luau.NodeArray.push(varList, this.parseIdentifier());
		}
		if (!this.consumeKeyword("in")) {
			this.throwError("Expected `in` when parsing for loop");
		}
		const firstIterator = this.parseExpression() as luau.ExpressionValue;
		const iterators = luau.NodeArray.make<luau.ExpressionValue>(
			false,
			firstIterator,
		);
		while (this.consumeSymbol(",")) {
			const iterator = this.parseExpression();
			luau.NodeArray.push(iterators, iterator as luau.ExpressionValue);
		}
		if (!this.consumeKeyword("do")) {
			this.throwError("`do` expected");
		}
		const body = this.parseStatementList(true);
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}
		return luau.createForStatement(varList, iterators, body);
	}

	private parseForStatement() {
		const startToken = this.peek(-1);
		const identifier = this.parseIdentifier();
		if (this.consumeSymbol("=")) {
			return this.injectTextRange(
				startToken,
				this.parseNumericForStatement(identifier),
			);
		}
		return this.injectTextRange(
			startToken,
			this.parseGenericForStatement(identifier),
		);
	}

	// repeat statement
	private parseRepeatStatement() {
		const startToken = this.peek(-1);
		const body = this.parseStatementList(true);

		if (!this.consumeKeyword("until")) {
			this.throwError("`until` expected");
		}
		const condition = this.parseExpression();
		return this.injectTextRange(
			startToken,
			luau.createRepeatStatement(condition, body),
		);
	}

	private parseBreakStatement() {
		if (!this.context.isInLoop()) {
			this.throwError("break statement must inside a loop.");
		}
		if (!this.isInEnd()) {
			this.throwError("Unable to execute code after `break`");
		}
		return this.injectTextRange(this.peek(-1), luau.createBreakStatement());
	}

	// statement
	private parseStatement(): luau.Statement {
		let statement: luau.Statement;
		if (this.consumeKeyword("if")) {
			statement = this.parseIfStatement();
		} else if (this.consumeKeyword("local")) {
			statement = this.parseBaseDeclaration();
		} else if (this.consumeKeyword("return")) {
			statement = this.parseReturnStatement();
		} else if (this.consumeKeyword("function")) {
			statement = this.parseFunctionDeclaration(false);
		} else if (this.consumeKeyword("do")) {
			statement = this.parseDoStatement();
		} else if (this.consumeKeyword("while")) {
			statement = this.parseWhileStatement();
		} else if (this.consumeKeyword("for")) {
			statement = this.parseForStatement();
		} else if (this.consumeKeyword("repeat")) {
			statement = this.parseRepeatStatement();
		} else if (this.consumeKeyword("break")) {
			statement = this.parseBreakStatement();
		} else {
			statement = this.parseAssignmentOrCall();
		}
		this.consumeSymbol(";");
		return statement;
	}

	private isInEnd() {
		return this.isStatementListCloseKeyword() || this.isEof();
	}

	private parseStatementListInner() {
		const statementList = luau.NodeArray.make<luau.Statement>();
		while (!this.isInEnd()) {
			luau.NodeArray.push(statementList, this.parseStatement());
		}
		if (this.isEof()) {
			luau.NodeArray.push(statementList, luau.createEndOfFile());
		}
		return statementList;
	}

	private parseStatementList(isLoop: boolean) {
		this.context.pushScope(isLoop);
		const list = this.parseStatementListInner();
		this.context.pushScope(false);
		return list;
	}

	public parse() {
		const list = this.parseStatementList(false);
		if (!this.isEof()) {
			this.throwError(`Expected <eof>, got ${this.peek()?.value}`);
		}
		return luau.createSourceFile(list, "stdin");
	}
}
