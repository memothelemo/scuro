import * as charcodes from "charcodes";

export function isNewLine(code: number): boolean {
	switch (code) {
		case charcodes.lineFeed:
		case charcodes.carriageReturn:
		case charcodes.lineSeparator:
		case charcodes.paragraphSeparator:
			return true;
		default:
			return false;
	}
}

export function isWhitespace(code: number): boolean {
	switch (code) {
		case charcodes.space:
		case charcodes.nonBreakingSpace:
			return true;
		default:
			return false;
	}
}
