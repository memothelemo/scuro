export function isUnaryOperatorText(operator: string) {
	switch (operator) {
		case "#":
		case "-":
		case "not":
			return true;
		default:
			return false;
	}
}
