import LuaAST from "LuaAST";
import { Token, TokenKind } from "LuaParser/lexer/token";
import { matchResult } from "Shared/utils/rustlang/result";
import { DEFAULT_UNARY_OP_PRIORTY, OPERATOR_PRIORITY } from "./constants";
import { getBinaryOperatorFromText } from "./constructors/getBinaryOperatorFromText";
import { getUnaryOperatorFromText } from "./constructors/getUnaryOperatorFromText";
import { Context } from "./context";
import { isUnaryOperatorText } from "./functions/isUnaryOperatorText";

export class Parser {
	private ptr = 0;
	private context = new Context();
	private tokensLength = 0;

	public constructor(private tokens: Token[]) {
		this.tokensLength = tokens.length;
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

	private toTextRange(token: Token): LuaAST.TextRange {
		return {
			line: token.row,
			column: token.column,
		};
	}

	//// parameters and arguments ////
	private parseArguments() {
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
			this.parseArguments(),
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
			this.parseArguments(),
			token,
		);
	}

	private parseShortCallExpression(token: Token, primary: LuaAST.Expression) {
		const exp = this.parseExpression();
		return LuaAST.factory.createCallExpression(
			primary,
			[exp],
			this.toTextRange(token),
		);
	}

	//// simple expressions ////
	private parseSimpleExpression(): LuaAST.Expression {
		const token = this.peek(1);
		if (this.is(TokenKind.String)) {
			return LuaAST.factory.createStringLiteral(
				this.next().value,
				this.toTextRange(token),
			);
		} else if (this.is(TokenKind.Number)) {
			return LuaAST.factory.createNumericLiteral(
				Number(this.next().value),
				this.toTextRange(token),
			);
		} else if (this.consumeKeyword("nil")) {
			return LuaAST.factory.createNilKeyword(this.toTextRange(token));
		} else if (this.isKeyword("false")) {
			return LuaAST.factory.createBooleanLiteral(
				false,
				this.toTextRange(this.next()),
			);
		} else if (this.isKeyword("true")) {
			return LuaAST.factory.createBooleanLiteral(
				true,
				this.toTextRange(this.next()),
			);
		} else if (this.consumeKeyword("...")) {
			return LuaAST.factory.createDotsKeyword(this.toTextRange(token));
		} else if (this.consumeSymbol("{")) {
			return this.parseTable();
		}
		// function
		return this.parseSuffixedExpression(false, true);
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
							this.toTextRange(token),
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
						this.toTextRange(token),
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
					this.toTextRange(token),
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
					this.toTextRange(token),
				),
			err => this.throwError(err),
		);
	}

	//// main expression parser ////
	private parseExpression() {
		return this.parseComplexExpression(0);
	}
}
