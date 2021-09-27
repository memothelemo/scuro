import * as charcodes from "LuaParser/shared/charcodes";
import {
	DOT_REGEX,
	INT_SIGN_REGEX,
	PP_REGEX,
	WHITESPACE_REGEX,
} from "./constants";
import { toLetterCode } from "./functions/toLetterCode";
import { tryGetLongString } from "./functions/tryGetLongString";
import { TextStream } from "./stream";
import {
	CommentToken,
	Token,
	TokenByKind,
	TokenKind,
	WhitespaceToken,
} from "./token";
import { isCodeInAlphabet, isValidIdentifier } from "./utils/identifier";
import { isAnyHexX, isHexDigit, isNumberDigit } from "./utils/number";
import { isSymbol } from "./utils/symbols";

export interface LexerOptions {
	keepComments: boolean;
}

export class Lexer {
	private isInEof = false;
	private leadingWhite = "";
	private leadings: (CommentToken | WhitespaceToken)[] = [];
	private isLongStr = false;

	private currentToken?: Token;

	public constructor(
		private stream: TextStream,
		private options: LexerOptions,
	) {}

	// utils
	private createToken<T extends TokenKind>(
		kind: T,
		data: Omit<TokenByKind[T], "kind" | "column" | "row" | "leading">,
	): TokenByKind[T] {
		return {
			column: this.stream.getColumn(),
			row: this.stream.getRow(),
			kind: kind,
			leading: this.options.keepComments
				? kind === TokenKind.Whitespace || kind === TokenKind.Comment
					? []
					: this.leadings
				: [],
			...data,
		} as TokenByKind[T];
	}

	// number
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
			if (this.stream.consume(PP_REGEX)) {
				this.stream.consume(INT_SIGN_REGEX);
				this.skipNumber();
			}
		} else {
			this.skipNumber();
			if (this.stream.consume(DOT_REGEX)) {
				this.skipNumber();
			}
			if (this.stream.consume(PP_REGEX)) {
				this.stream.consume(INT_SIGN_REGEX);
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
		const delim = toLetterCode(this.stream.next());
		const contentStart = this.stream.getPtr();

		//process.stdout.write("---- string begin ----\n");
		while (true) {
			const char = toLetterCode(this.stream.next());
			//process.stdout.write(this.stream.peek(-1));
			if (char === charcodes.backslash) {
				this.stream.next();
			}
			if (char === delim) {
				break;
			}
			if (this.stream.isEof()) {
				throw "incomplete string";
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
		const [content, wholeText] = tryGetLongString(this.stream);
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
		throw "do you mean? `~=`";
	}

	// dots
	private isNextDot() {
		return this.stream.peekToCode() === charcodes.dot;
	}

	private readDot() {
		let content = ".";
		this.stream.next();
		if (this.stream.consume(DOT_REGEX)) {
			content += ".";
			if (this.stream.consume(DOT_REGEX)) {
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
		return WHITESPACE_REGEX.test(this.stream.peek());
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
		return (
			this.stream.peekToCode() !== charcodes.lineFeed &&
			!this.stream.isEof()
		);
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

		const [_, wholeText] = tryGetLongString(this.stream);
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

	private readLeadings() {
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
	}

	private readNext() {
		// leading
		this.readLeadings();
		if (this.leadingWhite !== "") {
			this.constructLeading();
		}

		// eof
		if (this.stream.isEof()) return this.readEof();

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

		throw "unknown letter";
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
