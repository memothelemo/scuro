import * as charcodes from "LuaParser/shared/charcodes";

export function isAnyHexX(code: number): boolean {
	switch (code) {
		case charcodes.lowercaseX:
		case charcodes.uppercaseX:
			return true;
		default:
			return false;
	}
}

export function isHexDigit(code: number): boolean {
	switch (code) {
		case charcodes.digit0:
		case charcodes.digit1:
		case charcodes.digit2:
		case charcodes.digit3:
		case charcodes.digit4:
		case charcodes.digit5:
		case charcodes.lowercaseX:
		case charcodes.uppercaseX:
			return true;
		default:
			return false;
	}
}

export function isNumberDigit(code: number): boolean {
	switch (code) {
		case charcodes.digit0:
		case charcodes.digit1:
		case charcodes.digit2:
		case charcodes.digit3:
		case charcodes.digit4:
		case charcodes.digit5:
		case charcodes.digit6:
		case charcodes.digit7:
		case charcodes.digit8:
		case charcodes.digit9:
			return true;
		default:
			return false;
	}
}
