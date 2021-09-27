const reservedKeywords = new Set([
	"and",
	"break", // X
	"do", // X
	"else", // X
	"elseif",
	"end",
	"false", // X
	"for", // X
	"function", // X
	"if", // X
	"in", // X
	"local",
	"nil",
	"not",
	"or",
	"repeat",
	"return", // X
	"type",
	"then",
	"true", // X
	"until",
	"while", // X
]);

export function isCodeInAlphabet(code: number): boolean {
	// so that i don't go to the mental hospital now
	return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

export function isValidIdentifier(id: string) {
	return !reservedKeywords.has(id);
}
