export function isSymbol(code: number): boolean {
	switch (code) {
		case 123:
		case 125:
		case 126:
		case 91:
		case 93:
		case 47:
			return true;
		default:
			return (
				(code >= 35 && code <= 38) ||
				(code >= 40 && code <= 45) ||
				(code >= 59 && code <= 62) ||
				(code >= 94 && code <= 95)
			);
	}
}
