import chalk from "chalk";
import * as charcodes from "charcodes";
import { LogError } from "../Shared/error";
import { isSymbol } from "../Shared/utils/symbols";
import {
	isCodeInAlphabet,
	isValidIdentifier,
} from "../Shared/utils/identifier";
import { isAnyHexX, isHexDigit, isNumberDigit } from "../Shared/utils/number";
import { TextStream } from "./stream";
import {
	CommentToken,
	Token,
	TokenByKind,
	TokenKind,
	WhitespaceToken,
} from "./token";

const LuauErrors = {
	UnknownLetter: (letter: string) =>
		`Unexpected symbol when parsing, got \`${letter}\``,

	// to make more literal
	IncompleteString: "Malformed string",
};

export class LexerError extends LogError {
	constructor(
		public readonly reason: string,
		public readonly fileName: string,
		public readonly ptr: number,
		public column: number,
		public row: number,
	) {
		super();
	}

	toString() {
		return `${chalk.cyanBright(this.fileName)}:${chalk.yellow(
			this.row,
		)}:${chalk.yellow(this.column)}: ${this.reason}\n`;
	}
}

export class Lexer {
	private dot_regex = /[.]/;
	private whitespace_regex = /[ \t\r\n]/;
	private int_sign_regex = /[+-]/;

	private isInEof = false;
	private leadingWhite = "";
	private leadings: (CommentToken | WhitespaceToken)[] = [];
	private isLongStr = false;

	private currentToken?: Token;

	public constructor(private stream: TextStream, public fileName = "stdin") {}

	public static fromSource(source: string, fileName?: string) {
		return new Lexer(new TextStream(source), fileName);
	}

	// utils
	private createToken<T extends TokenKind>(
		kind: T,
		data: Omit<TokenByKind[T], "kind" | "column" | "row" | "leading">,
	): TokenByKind[T] {
		return {
			column: this.stream.getColumn(),
			row: this.stream.getRow(),
			kind: kind,
			leading:
				kind === TokenKind.Whitespace || kind === TokenKind.Comment
					? []
					: this.leadings,
			...data,
		} as TokenByKind[T];
	}

	private getLongEqualsCount() {
		let equalsCount = 0;
		while (this.stream.peekToCode(equalsCount + 1) === charcodes.equalsTo) {
			equalsCount++;
		}
		return equalsCount;
	}

	private isSquareLeftBracket(offset = 0) {
		return this.stream.peekToCode(offset) === charcodes.leftSquareBracket;
	}

	private throwError(reason: string): never {
		const ptr = this.stream.getPtr();
		throw new LexerError(
			reason,
			this.fileName,
			ptr,
			this.stream.getColumn(),
			this.stream.getRow(),
		);
	}

	private getDepthFromEmbeddedLongString(equalsCount: number) {
		let embedded = true;
		let depth = 0;
		for (let i = 1; i <= equalsCount; i++) {
			if (this.stream.peekToCode(i) !== charcodes.equalsTo) {
				embedded = false;
				break;
			}
		}
		if (this.isSquareLeftBracket(equalsCount + 1) && embedded) {
			// oh look, there was
			depth++;
			for (let i = 1; i <= equalsCount + 2; i++) {
				this.stream.next();
			}
		}
		return depth;
	}

	private hasLongStringEnd(equalsCount: number): [boolean, number] {
		let initial = true;
		if (this.stream.peekToCode() === charcodes.rightSquareBracket) {
			for (let i = 1; i <= equalsCount; i++) {
				if (this.stream.peekToCode(i) !== charcodes.equalsTo) {
					initial = false;
				}
			}
			if (
				this.stream.peekToCode(equalsCount + 1) !==
				charcodes.rightSquareBracket
			) {
				return [false, 0];
			}
			return [initial, 0];
		}
		let depth = 0;
		if (this.stream.peekToCode() === charcodes.leftSquareBracket) {
			depth = this.getDepthFromEmbeddedLongString(equalsCount);
		}
		return [false, depth];
	}

	private tryGetLongString(): [string, string] | [undefined, undefined] {
		const start = this.stream.getPtr();
		if (this.isSquareLeftBracket()) {
			let equalsCount = this.getLongEqualsCount();
			let depth = 1;
			if (this.isSquareLeftBracket(equalsCount + 1)) {
				// start parsing the string. strip the starting bit
				this.stream.skip(equalsCount + 2);

				// get the contents
				const contentStart = this.stream.getPtr();
				while (true) {
					// check for eof
					if (this.isEof()) {
						this.throwError(
							`Expected \`]${"=".repeat(
								equalsCount,
							)}\` near <eof>`,
						);
					}

					// check for the end
					let [foundEnd, depthChange] =
						this.hasLongStringEnd(equalsCount);

					depth += depthChange;

					if (foundEnd) {
						depth--;
						if (depth === 0) {
							break;
						}
						this.stream.skip(equalsCount + 1);
					} else {
						this.stream.next();
					}
				}

				// get the interior string
				const contentString = this.stream.sub(
					contentStart,
					this.stream.getPtr(),
				);

				// found the end. get rid of the trailing bit
				this.stream.skip(equalsCount + 2);

				// get the exterior strong
				const longString = this.stream.sub(start, this.stream.getPtr());
				return [contentString, longString];
			}
		}
		return [undefined, undefined];
	}

	private toLetterCode(letter: string) {
		return letter.charCodeAt(0);
	}

	private isEof() {
		// osyrisrblx' way to find out if it is NaN
		return this.stream.peekToCode() !== this.stream.peekToCode();
	}

	// other methods
	private isNextNumber() {
		const code = this.stream.peekToCode();
		return (
			isNumberDigit(code) ||
			(code === charcodes.dot &&
				isNumberDigit(this.stream.peek(1).charCodeAt(0)))
		);
	}

	private isNextHex() {
		const code = this.stream.peekToCode();
		const nextChar = this.stream.peekToCode(1);
		return code === charcodes.digit0 && isAnyHexX(nextChar);
	}

	private skipHex() {
		while (isHexDigit(this.stream.peekToCode())) {
			this.stream.next();
		}
	}

	private skipNumber() {
		while (isNumberDigit(this.stream.peekToCode())) {
			this.stream.next();
		}
	}

	private readNumber() {
		const start = this.stream.getPtr();
		if (this.isNextHex()) {
			this.stream.skip(2);
			this.skipHex();
			if (this.stream.consume(/[Pp]/)) {
				this.stream.consume(this.int_sign_regex);
				this.skipNumber();
			}
		} else {
			this.skipNumber();
			if (this.stream.consume(this.dot_regex)) {
				this.skipNumber();
			}
			if (this.stream.consume(/[Ee]/)) {
				this.stream.consume(/[+-]/);
				this.skipNumber();
			}
		}
		return this.createToken(TokenKind.Number, {
			value: this.stream.sub(start, this.stream.getPtr()),
		});
	}

	// identifier
	private isNextIdentifier() {
		const code = this.stream.peekToCode();
		return isCodeInAlphabet(code) || code === charcodes.underscore;
	}

	private isValidLuaIdentifier() {
		const code = this.stream.peekToCode();
		return (
			isCodeInAlphabet(code) ||
			code === charcodes.underscore ||
			isNumberDigit(code)
		);
	}

	private skipIdentifier() {
		while (this.isValidLuaIdentifier()) {
			this.stream.next();
		}
	}

	private readIdentifier() {
		const start = this.stream.getPtr();
		this.stream.next();
		this.skipIdentifier();

		const content = this.stream.sub(start, this.stream.getPtr());
		if (isValidIdentifier(content)) {
			return this.createToken(TokenKind.Identifier, {
				value: content,
			});
		}
		return this.createToken(TokenKind.Keyword, { value: content });
	}

	// string
	private isNextString() {
		const code = this.stream.peekToCode();
		switch (code) {
			case charcodes.quotationMark:
			case charcodes.apostrophe:
				return true;
			default:
				return false;
		}
	}

	private readString() {
		const start = this.stream.getPtr();
		const delim = this.toLetterCode(this.stream.next());
		const contentStart = this.stream.getPtr();

		//process.stdout.write("---- string begin ----\n");
		while (true) {
			const char = this.toLetterCode(this.stream.next());
			//process.stdout.write(this.stream.peek(-1));
			if (char === charcodes.backslash) {
				this.stream.next();
			}
			if (char === delim) {
				break;
			}
			if (this.isEof()) {
				this.throwError(LuauErrors.IncompleteString);
			}
		}

		const endPtr = this.stream.getPtr();
		const content = this.stream.sub(contentStart, endPtr - 1);
		const constant = this.stream.sub(start, endPtr);

		return this.createToken(TokenKind.String, {
			constant: content,
			value: constant,
		});
	}

	// eof
	private readEof() {
		this.stream.next();
		this.isInEof = true;
		return this.createToken(TokenKind.Eof, { value: "" });
	}

	// long string
	private isNextLongString() {
		return this.stream.peekToCode() === charcodes.leftSquareBracket;
	}

	private readLongString() {
		const [content, wholeText] = this.tryGetLongString();
		if (wholeText) {
			// long string
			return this.createToken(TokenKind.String, {
				constant: content!,
				value: wholeText,
			});
		}
		// symbol
		this.stream.next();
		return this.createToken(TokenKind.Symbol, { value: "[" });
	}

	// tilde
	private isNextTilde() {
		return this.stream.peekToCode() === charcodes.tilde;
	}

	private readTilde() {
		this.stream.next();
		if (this.stream.consume(/[=]/)) {
			// ~=
			return this.createToken(TokenKind.Symbol, { value: "~=" });
		}
		this.throwError(LuauErrors.UnknownLetter("~"));
	}

	// dots
	private isNextDot() {
		return this.stream.peekToCode() === charcodes.dot;
	}

	private readDot() {
		let content = ".";
		this.stream.next();
		if (this.stream.consume(this.dot_regex)) {
			content += ".";
			if (this.stream.consume(this.dot_regex)) {
				content += ".";
			}
		}
		return this.createToken(TokenKind.Symbol, { value: content });
	}

	// colon
	private isNextColon() {
		return this.stream.peekToCode() === charcodes.colon;
	}

	private readColon() {
		let result = ":";
		this.stream.next();
		if (this.stream.consume(/[:]/)) {
			result = "::";
		}
		return this.createToken(TokenKind.Symbol, { value: result });
	}

	// symbols
	private isNextSymbol() {
		return isSymbol(this.stream.peekToCode());
	}

	private readSymbol() {
		const char = this.stream.next();
		return this.createToken(TokenKind.Symbol, { value: char });
	}

	// whitespace
	private isWhitespace() {
		return this.whitespace_regex.test(this.stream.peek());
	}

	private readWhitespace() {
		this.stream.next();
	}

	// comment and shebang (why linux)
	private isShebang() {
		return (
			this.stream.peekToCode() === charcodes.numberSign &&
			this.stream.peekToCode(1) === charcodes.exclamationMark &&
			this.stream.getRow() === 1
		);
	}

	private isDash(offset = 0) {
		return this.stream.peekToCode(offset) === charcodes.dash;
	}

	private isComment() {
		return this.isDash() && this.isDash(1);
	}

	private isNotInNextLine() {
		return this.stream.peekToCode() !== charcodes.lineFeed && !this.isEof();
	}

	private readShebang() {
		this.stream.skip(2);
		this.leadingWhite = "#!";
		while (this.isNotInNextLine()) {
			this.leadingWhite += this.stream.next();
		}
		this.leadings.push(
			this.createToken(TokenKind.Comment, {
				commentKind: "Shebang",
				value: this.leadingWhite,
			}),
		);
		this.leadingWhite = "";
	}

	private readComment() {
		this.stream.skip(2);
		this.leadingWhite += "--";

		const [_, wholeText] = this.tryGetLongString();
		if (wholeText) {
			this.leadingWhite += wholeText;
			this.isLongStr = true;
		} else {
			while (this.isNotInNextLine()) {
				this.leadingWhite += this.stream.next();
			}
		}
	}

	private constructLeading() {
		this.leadings.push(
			this.createToken(TokenKind.Comment, {
				commentKind: this.isLongStr ? "Long" : "Short",
				value: this.leadingWhite,
			}),
		);
	}

	// operators
	private isNextOperator() {
		const code = this.stream.peekToCode();
		switch (code) {
			case 37:
			case 42:
			case 43:
			case 45:
			case 47:
			case 94:
				return true;
			default:
				return code >= 60 && code <= 62;
		}
	}

	private readOperator() {
		const char = this.stream.next();
		if (this.stream.peekToCode() === charcodes.equalsTo) {
			this.stream.next();
			return this.createToken(TokenKind.Symbol, {
				value: char + "=",
			});
		}
		return this.createToken(TokenKind.Symbol, {
			value: char,
		});
	}

	private readNext() {
		this.leadingWhite = "";
		this.leadings = [];

		// comment stuff
		while (true) {
			if (this.isShebang()) {
				this.readShebang();
			} else if (this.isWhitespace()) {
				this.readWhitespace();
			} else if (this.isComment()) {
				this.readComment();
			} else {
				break;
			}
		}

		// leading
		if (this.leadingWhite !== "") {
			this.constructLeading();
		}

		// eof
		if (this.isEof()) return this.readEof();

		// number
		if (this.isNextNumber()) return this.readNumber();

		// identifier
		if (this.isNextIdentifier()) return this.readIdentifier();

		// string
		if (this.isNextString()) return this.readString();

		// long string
		if (this.isNextLongString()) return this.readLongString();

		// tilde
		if (this.isNextTilde()) return this.readTilde();

		// operator
		if (this.isNextOperator()) return this.readOperator();

		// dot
		if (this.isNextDot()) return this.readDot();

		// colon
		if (this.isNextColon()) return this.readColon();

		// symbol
		if (this.isNextSymbol()) return this.readSymbol();

		this.throwError(LuauErrors.UnknownLetter(this.stream.peek()));
	}

	public tokenize() {
		const tokens: Token[] = [];
		while (this.hasNext()) {
			tokens.push(this.next());
		}
		return tokens;
	}

	public reset() {
		this.stream.reset();
	}

	public next(): Token {
		const token = this.readNext();
		this.currentToken = token;
		return token;
	}

	public peek() {
		return this.currentToken;
	}

	public hasNext() {
		return this.stream.hasNext() || !this.isInEof;
	}
}
