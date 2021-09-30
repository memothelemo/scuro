import { inspect } from "util";
import LuaAST from "LuaAST";
import { StringToken, Token, TokenKind } from "LuaParser/lexer/token";
import { matchResult } from "Shared/utils/rustlang/result";
import { DEFAULT_UNARY_OP_PRIORTY, OPERATOR_PRIORITY } from "./constants";
import { getBinaryOperatorFromText } from "./constructors/getBinaryOperatorFromText";
import { getUnaryOperatorFromText } from "./constructors/getUnaryOperatorFromText";
import { isUnaryOperatorText } from "./functions/isUnaryOperatorText";
import { ParserConfig } from "./types";

export class Parser {
	private ptr = 0;
	private tokensLength = 0;
	private tokens: Token[] = [];

	public constructor(private config: ParserConfig) {}

	private isVersionGreaterThan(targetVersion: ParserConfig["version"]) {
		// one trick heheheh
		return Number(targetVersion) >= Number(this.config.version);
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

	private throwError(message: string): never {
		throw message;
	}

	//// parameters and arguments ////
	private parseFunctionParameters() {
		const args = new Array<LuaAST.Identifier>();
		let varArgs: LuaAST.DotsKeyword | undefined;
		while (!this.consumeSymbol(")")) {
			if (this.is(TokenKind.Identifier)) {
				args.push(this.parseIdentifier());
				if (!this.consumeSymbol(",")) {
					if (this.consumeSymbol(")")) {
						break;
					}
					this.throwError("`)` expected");
				} else {
					if (this.consumeSymbol(")")) {
						this.throwError(`<identifier> expected`);
					}
				}
			} else if (this.consumeSymbol("...")) {
				varArgs = LuaAST.factory.createDotsKeyword(this.peek(-1));
				if (!this.consumeSymbol(")")) {
					this.throwError(
						"`...` must be the last argument of a function",
					);
				}
				break;
			} else {
				this.throwError("Argument <identifier> or `...` expected");
			}
		}
		return [args, varArgs] as const;
	}

	private parseWrappedArguments() {
		const args = new Array<LuaAST.Expression>();
		while (!this.consumeSymbol(")")) {
			args.push(this.parseExpression());
			if (!this.consumeSymbol(",")) {
				if (this.consumeSymbol(")")) break;
				this.throwError("`)` expected");
			} else {
				if (this.consumeSymbol(")")) {
					this.throwError(`<exp> expected`);
				}
			}
		}
		return args;
	}

	//// primary expressions ////
	private parsePrimaryExpression(): LuaAST.Expression {
		if (this.consumeSymbol("(")) {
			return this.parseParenthesizedExpression();
		} else if (this.is(TokenKind.Identifier)) {
			return this.parseIdentifier();
		}
		this.throwError("Unknown <exp>");
	}

	// identifier
	private parseIdentifier() {
		if (this.is(TokenKind.Identifier)) {
			const token = this.next();
			return LuaAST.factory.createIdentifier(token.value, {
				line: token.row,
				column: token.column,
			});
		}
		this.throwError("<identifier> expected");
	}

	// parenthesized expression
	private parseParenthesizedExpression() {
		const expression = this.parseExpression();
		if (!this.consumeSymbol(")")) {
			this.throwError("`)` expected.");
		}
		return LuaAST.factory.createParenthesizedExpression(expression, {
			line: expression.line,
			column: expression.column,
		});
	}

	//// suffixed expressions ////
	private parseSuffixedExpression(
		onlyDotColon = false,
		makeCallIfMethod = false,
	) {
		const primaryToken = this.peek();
		let primary = this.parsePrimaryExpression();
		while (true) {
			if (this.isSymbol(".") || this.isSymbol(":")) {
				// property access or method call
				const token = this.next();
				const isMethod = token.value === ":";
				const index = this.parseIdentifier();

				if (isMethod && makeCallIfMethod) {
					if (this.consumeSymbol("(")) {
						primary = this.parseMethodCallExpression(
							token,
							primary,
							index,
						);
					} else {
						primary = this.parseShortCallExpression(token, primary);
					}
				} else {
					primary = LuaAST.factory.createTableIndexExpression(
						primary as LuaAST.TableExpression,
						index,
						token,
					);
				}
			} else if (!onlyDotColon && this.consumeSymbol("[")) {
				// element access
				const index = this.parseExpression();
				if (!this.consumeSymbol("]")) {
					this.throwError("`]` expected.");
				}
				primary = LuaAST.factory.createTableIndexExpression(
					primary as LuaAST.TableExpression,
					index,
					{
						line: index.line,
						column: index.column,
					},
				);
			} else if (!onlyDotColon && this.is(TokenKind.String)) {
				primary = this.parseShortCallExpression(primaryToken, primary);
			} else if (!onlyDotColon && this.isSymbol("{")) {
				primary = this.parseShortCallExpression(primaryToken, primary);
			} else if (!onlyDotColon && this.consumeSymbol("(")) {
				primary = this.parseCallExpression(primaryToken, primary);
			} else {
				break;
			}
		}
		return primary;
	}

	private parseCallExpression(token: Token, primary: LuaAST.Expression) {
		return LuaAST.factory.createCallExpression(
			primary,
			this.parseWrappedArguments(),
			token,
		);
	}

	private parseMethodCallExpression(
		token: Token,
		primary: LuaAST.Expression,
		index: LuaAST.Identifier,
	) {
		return LuaAST.factory.createMethodCallExpression(
			primary,
			index,
			this.parseWrappedArguments(),
			token,
		);
	}

	private parseShortCallExpression(token: Token, primary: LuaAST.Expression) {
		const exp = this.parseExpression();
		return LuaAST.factory.createCallExpression(primary, [exp], token);
	}

	//// simple expressions ////
	private parseSimpleExpression(): LuaAST.Expression {
		const token = this.peek(1);
		if (this.is(TokenKind.String)) {
			return LuaAST.factory.createStringLiteral(
				(this.next() as StringToken).constant,
				token,
			);
		} else if (this.is(TokenKind.Number)) {
			return LuaAST.factory.createNumericLiteral(
				Number(this.next().value),
				token,
			);
		} else if (this.consumeKeyword("nil")) {
			return LuaAST.factory.createNilKeyword(token);
		} else if (this.isKeyword("false")) {
			return LuaAST.factory.createBooleanLiteral(false, this.next());
		} else if (this.isKeyword("true")) {
			return LuaAST.factory.createBooleanLiteral(true, this.next());
		} else if (this.consumeKeyword("...")) {
			return LuaAST.factory.createDotsKeyword(token);
		} else if (this.consumeSymbol("{")) {
			return this.parseTable();
		} else if (this.consumeKeyword("function")) {
			return this.parseFunctionExpression();
		}
		return this.parseSuffixedExpression(false, true);
	}

	private parseFunctionExpression() {
		const token = this.peek(-1);

		if (!this.consumeSymbol("(")) {
			this.throwError("`(` expected");
		}

		const [args, dotdotdot] = this.parseFunctionParameters();

		// body
		const block = this.parseBlock();

		// end
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected after the function body");
		}

		return LuaAST.factory.createFunctionExpression(
			block,
			args,
			dotdotdot,
			token,
		);
	}

	private parseTable() {
		const token = this.peek(-1);
		const contents = new Array<LuaAST.TableFieldExpression>();

		while (true) {
			if (this.consumeSymbol("[")) {
				// map table field
				const token = this.peek();
				const result = this.parseMapTableField();

				result.line = token.row;
				result.column = token.column;

				contents.push(result);
			} else if (this.is(TokenKind.Identifier)) {
				// array or assignment?
				const token = this.peek();
				const lookAhead = this.peek(1);
				if (
					lookAhead.value === "=" &&
					lookAhead.kind === TokenKind.Symbol
				) {
					const result = this.parseIdentifierTableField();
					result.line = token.row;
					result.column = token.column;

					contents.push(result);
				} else {
					const token = this.peek();
					contents.push(
						LuaAST.factory.createTableFieldExpression(
							this.parseExpression(),
							undefined,
							token,
						),
					);
				}
			} else if (this.consumeSymbol("}")) {
				break;
			} else {
				// array stuff
				contents.push(
					LuaAST.factory.createTableFieldExpression(
						this.parseExpression(),
						undefined,
						token,
					),
				);
			}
			if (this.consumeSymbol(";") || this.consumeSymbol(",")) {
				// stop marker
			} else if (this.consumeSymbol("}")) {
				break;
			} else {
				this.throwError("`}` or table entry expected");
			}
		}

		return LuaAST.factory.createTableExpression(contents, token);
	}

	private parseMapTableField() {
		const key = this.parseExpression();
		if (!this.consumeSymbol("]")) {
			this.throwError("`]` expected");
		}
		if (!this.consumeSymbol("=")) {
			this.throwError("`=` expected");
		}

		const value = this.parseExpression();
		return LuaAST.factory.createTableFieldExpression(value, key);
	}

	private parseIdentifierTableField() {
		const key = this.parseExpression();
		if (!this.consumeSymbol("=")) {
			this.throwError("`=` expected");
		}
		const value = this.parseExpression();
		return LuaAST.factory.createTableFieldExpression(value, key);
	}

	//// complex expressions ////
	private parseComplexExpression(level: number) {
		// unary expression
		let headToken = this.peek();
		let exp: LuaAST.Expression;
		if (isUnaryOperatorText(headToken.value)) {
			exp = this.parseUnaryExpression(this.next());
		} else {
			exp = this.parseSimpleExpression();
		}

		// binary expression
		while (true) {
			const priority = OPERATOR_PRIORITY[this.peek().value];
			if (priority && priority[0] > level) {
				exp = this.parseBinaryExpression(headToken, priority[1], exp);
				headToken = this.peek();
			} else {
				break;
			}
		}

		return exp;
	}

	private parseBinaryExpression(
		token: Token,
		priority: number,
		leftExp: LuaAST.Expression,
	) {
		const operatorRes = getBinaryOperatorFromText(this.next().value);
		const rightExp = this.parseComplexExpression(priority);
		return matchResult(
			operatorRes,
			operator =>
				LuaAST.factory.createBinaryExpression(
					leftExp,
					rightExp as unknown as LuaAST.Expression,
					operator,
					token,
				),
			err => this.throwError(err),
		);
	}

	private parseUnaryExpression(token: Token) {
		// parse that expression first
		const operand = this.parseComplexExpression(DEFAULT_UNARY_OP_PRIORTY);
		return matchResult(
			getUnaryOperatorFromText(token.value),
			operator =>
				LuaAST.factory.createUnaryExpression(
					operand as unknown as LuaAST.Expression,
					operator,
					token,
				),
			err => this.throwError(err),
		);
	}

	//// main expression parser ////
	private parseExpression() {
		return this.parseComplexExpression(0);
	}

	//// statements ////
	private parseStatement() {
		let statement: LuaAST.Statement;
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
		} else if (this.consumeKeyword("goto")) {
			statement = this.parseGotoStatement();
		} else if (this.consumeSymbol("::")) {
			statement = this.parseLabelStatement();
		} else {
			statement = this.parseAssignmentOrCall();
		}
		this.consumeSymbol(";");
		return statement;
	}

	// goto statement
	private parseGotoStatement() {
		// check for lua version, 5.2 has it
		if (!this.isVersionGreaterThan("5.2")) {
			this.throwError(
				"Goto statements are not compatitble below Lua 5.2!",
			);
		}

		const token = this.peek(-1);
		const label = this.peek().value;

		return LuaAST.factory.createGotoStatement(label, token);
	}

	// label statement
	private parseLabelStatement() {
		// check for lua version, 5.2 has it
		if (!this.isVersionGreaterThan("5.2")) {
			this.throwError(
				"Label statements are not compatitble below Lua 5.2!",
			);
		}

		if (!this.is(TokenKind.Identifier)) {
			this.throwError("<identifier> expected");
		}

		const token = this.peek(-1);
		const label = this.peek().value;

		if (!this.consumeSymbol("::")) {
			this.throwError("`::` expected");
		}

		return LuaAST.factory.createLabelStatement(label, token);
	}

	// return statement
	private parseReturnStatement() {
		const startToken = this.peek(-1);
		let expList = new Array<LuaAST.Expression>();
		if (!this.isInEnd() && !this.consumeSymbol(";")) {
			const firstExpr = this.parseExpression();
			expList.push(firstExpr);
			while (this.consumeSymbol(",")) {
				const exp = this.parseExpression();
				expList.push(exp);
			}
		}
		return LuaAST.factory.createReturnStatement(expList, startToken);
	}

	// if statement
	private parseSubIfStatement() {
		const startToken = this.peek(-1);
		const condition = this.parseExpression();
		if (!this.consumeKeyword("then")) {
			this.throwError("`then` expected.");
		}
		const block = this.parseBlock();
		return LuaAST.factory.createIfStatement(
			condition,
			block,
			undefined,
			startToken,
		);
	}

	private parseIfStatement() {
		const clauses = new Array<LuaAST.IfStatement>();

		// clauses
		while (true) {
			const clauseStatement = this.parseSubIfStatement();
			clauses.push(clauseStatement);
			if (!this.consumeKeyword("elseif")) break;
		}

		// else clause
		let elseBlock: LuaAST.Block | undefined;
		if (this.consumeKeyword("else")) {
			elseBlock = this.parseBlock();
		}

		// end
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		// compress all clauses into one single
		// chunk of if statements
		let currentStatement: LuaAST.IfStatement | undefined;
		for (let i = clauses.length - 1; i >= 0; i--) {
			const clause = clauses[i];
			currentStatement = LuaAST.factory.createIfStatement(
				clause.condition,
				clause.ifBlock,
				currentStatement ?? elseBlock,
			);
			currentStatement.line = clause.line;
			currentStatement.column = clause.column;
		}

		// is it a good idea to do that?
		return currentStatement!;
	}

	// assignment or call
	private isProbablyAnAssignment(
		expression: LuaAST.Expression,
	): expression is LuaAST.AssignmentLeftSideExpression {
		return (
			LuaAST.factory.isAssignmentLeftSideExpression(expression) &&
			(this.isSymbol(",") || this.isSymbol("="))
		);
	}

	private parseAssignmentOrCall(): LuaAST.Statement {
		// TODO: Fix issue about this ()()
		const expression = this.parseSuffixedExpression(false, true);
		if (this.isProbablyAnAssignment(expression)) {
			// assignment identifiers doesn't allow parenthesized expressions
			if (LuaAST.factory.isParenthesizedExpression(expression)) {
				this.throwError("Cannot assign to parenthesized expression");
			}

			// more processing identifiers
			const ids = new Array<LuaAST.AssignmentLeftSideExpression>();
			while (this.consumeSymbol(",")) {
				const exp = this.parseSuffixedExpression(false, true);
				if (!LuaAST.factory.isAssignmentLeftSideExpression(exp)) {
					this.throwError(
						"Cannot assign to parenthesized expression",
					);
				}
			}

			// arithmetic operator check
			if (!this.consumeSymbol("=")) {
				this.throwError("`=` expected");
			}

			// right side
			const values = new Array<LuaAST.Expression>(this.parseExpression());
			while (this.consumeSymbol(",")) {
				const exp = this.parseExpression();
				values.push(exp);
			}

			return LuaAST.factory.createAssignmentStatement(
				ids,
				values,
				expression,
			);
		} else if (LuaAST.factory.isCallExpression(expression)) {
			const statement = LuaAST.factory.createExpressionStatement(
				expression,
				expression,
			);
			return statement;
		} else {
			this.throwError(`Unknown token: ${inspect(this.peek(), true, 10)}`);
		}
	}

	// dowe do do
	private parseDoStatement() {
		const startToken = this.peek(-1);
		const block = this.parseBlock();
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected.");
		}
		return LuaAST.factory.createDoStatement(block, startToken);
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
		const block = this.parseBlock();

		// end
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		return LuaAST.factory.createWhileStatement(
			block,
			expression,
			startToken,
		);
	}

	// numeric for statement
	private parseNumericForStatement(token: Token, id: LuaAST.Identifier) {
		const startExpr = this.parseExpression();
		if (!this.consumeSymbol(",")) {
			this.throwError("`,` expected");
		}

		const limitExpr = this.parseExpression();

		// step is optional
		let stepExpr: LuaAST.Expression | undefined;
		if (this.consumeSymbol(",")) {
			stepExpr = this.parseExpression();
		}

		if (!this.consumeKeyword("do")) {
			this.throwError("`do` expected");
		}

		const block = this.parseBlock();
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		return LuaAST.factory.createNumericForStatement(
			block,
			id,
			startExpr,
			limitExpr,
			stepExpr,
			token,
		);
	}

	// generic for statement
	private parseGenericForStatement(token: Token, id: LuaAST.Identifier) {
		const varList = new Array<LuaAST.Identifier>(id);

		while (this.consumeSymbol(",")) {
			if (!this.is(TokenKind.Identifier)) {
				this.throwError(`Expected <identifier>`);
			}
			varList.push(this.parseIdentifier());
		}

		if (!this.consumeKeyword("in")) {
			this.throwError("Expected `in` when parsing for loop");
		}

		const firstExpression = this.parseExpression();
		const expressions = new Array<LuaAST.Expression>(firstExpression);

		while (this.consumeSymbol(",")) {
			const iterator = this.parseExpression();
			expressions.push(iterator);
		}

		if (!this.consumeKeyword("do")) {
			this.throwError("`do` expected");
		}

		const body = this.parseBlock();
		if (!this.consumeKeyword("end")) {
			this.throwError("`end` expected");
		}

		return LuaAST.factory.createGenericForStatement(
			body,
			varList,
			expressions,
			token,
		);
	}

	private parseForStatement() {
		const startToken = this.peek(-1);
		const identifier = this.parseIdentifier();

		if (this.consumeSymbol("=")) {
			return this.parseNumericForStatement(startToken, identifier);
		}

		return this.parseGenericForStatement(startToken, identifier);
	}

	// repeat statement
	private parseRepeatStatement() {
		const startToken = this.peek(-1);
		const block = this.parseBlock();

		if (!this.consumeKeyword("until")) {
			this.throwError("`until` expected");
		}

		const condition = this.parseExpression();
		return LuaAST.factory.createRepeatStatement(
			block,
			condition,
			startToken,
		);
	}

	// base declaration statement
	private parseVariableDeclaration() {
		const startToken = this.peek(-1);
		const varList = new Array<LuaAST.Identifier>(this.parseIdentifier());

		while (this.consumeSymbol(",")) {
			if (!this.is(TokenKind.Identifier)) {
				this.throwError("local <identifier> expected");
			}
			varList.push(this.parseIdentifier());
		}

		let initList: Array<LuaAST.Expression> | undefined;

		if (this.consumeSymbol("=")) {
			initList = [];
			while (true) {
				const exp = this.parseExpression();
				initList.push(exp);
				if (!this.consumeSymbol(",")) break;
			}
		}

		return LuaAST.factory.createVariableDeclarationStatement(
			varList,
			initList,
		);
	}

	private parseFunctionDeclaration(isWithLocal = false) {
		if (!this.is(TokenKind.Identifier)) {
			this.throwError(`function <name> expected`);
		}

		if (isWithLocal) {
			const name = this.parseIdentifier();
			const expression = this.parseFunctionExpression();
			return LuaAST.factory.createVariableDeclarationStatement(
				[name],
				[expression],
				this.peek(-3),
			);
		}

		const startToken = this.peek(-2);
		const name = this.parseSuffixedExpression(true, false);

		if (!LuaAST.factory.isAssignmentLeftSideExpression(name)) {
			// unexpected error
			this.throwError("Unexpected error!");
		}

		const expression = this.parseFunctionExpression();
		return LuaAST.factory.createAssignmentStatement(
			[name],
			[expression],
			startToken,
		);
	}

	private parseBaseDeclaration() {
		if (this.is(TokenKind.Identifier)) {
			return this.parseVariableDeclaration();
		} else if (this.consumeKeyword("keyword")) {
			return this.parseFunctionDeclaration(true);
		}
		this.throwError(`local <identifier> or <function> expected`);
	}

	// break statement
	private parseBreakStatement() {
		return LuaAST.factory.createBreakStatement(this.peek(-1));
	}

	//// statement list ////
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

	private isInEnd() {
		return this.isStatementListCloseKeyword() || this.isEof();
	}

	private parseStatementList() {
		const statementList = new Array<LuaAST.Statement>();
		while (!this.isInEnd()) {
			const st = this.parseStatement();
			statementList.push(st);
		}
		return statementList;
	}

	// block
	private parseBlock() {
		const startToken = this.peek();
		const list = this.parseStatementList();
		return LuaAST.factory.createBlock(list, startToken);
	}

	//// source file ////
	public reset() {
		// go go away
		this.tokensLength = 0;
		this.tokens.splice(0, this.tokens.length);
	}

	public parse(tokens: Token[]) {
		if (this.tokens.length > 0) {
			this.throwError(
				`This parser is dirty, please reset them before parsing another one`,
			);
		}

		this.tokens = tokens;
		this.tokensLength = tokens.length;

		const list = this.parseStatementList();
		if (!this.isEof()) {
			this.throwError(`Expected <eof>, got ${this.peek()?.value}`);
		}

		return LuaAST.factory.createSourceFile(list);
	}
}
