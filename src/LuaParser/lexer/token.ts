export enum TokenKind {
	Whitespace,
	Comment,
	String,
	Number,
	Keyword,
	Identifier,
	Symbol,
	Eof,
}

export interface Token<T extends TokenKind = TokenKind> {
	row: number;
	column: number;
	kind: T;
	value: string;
	leading: (WhitespaceToken | CommentToken)[];
}

export interface CommentToken extends Token<TokenKind.Comment> {
	commentKind: "Long" | "Short" | "Shebang";
}

export interface WhitespaceToken extends Token<TokenKind.Whitespace> {}
export interface EofToken extends Token<TokenKind.Eof> {}
export interface StringToken extends Token<TokenKind.String> {
	constant: string;
}
export interface NumberToken extends Token<TokenKind.Number> {}
export interface KeywordToken extends Token<TokenKind.Keyword> {}
export interface SymbolToken extends Token<TokenKind.Symbol> {}
export interface IdentifierToken extends Token<TokenKind.Symbol> {}

export interface TokenByKind {
	[TokenKind.Comment]: CommentToken;
	[TokenKind.Eof]: EofToken;
	[TokenKind.String]: StringToken;
	[TokenKind.Number]: NumberToken;
	[TokenKind.Keyword]: KeywordToken;
	[TokenKind.Symbol]: SymbolToken;
	[TokenKind.Identifier]: IdentifierToken;
	[TokenKind.Whitespace]: WhitespaceToken;
}
