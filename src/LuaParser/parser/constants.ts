export const OPERATOR_PRIORITY: Record<string, [number, number] | undefined> = {
	"+": [6, 6],
	"-": [6, 6],
	"%": [7, 7],
	"/": [7, 7],
	"*": [7, 7],
	"^": [10, 9],
	"..": [5, 4],
	"==": [3, 3],
	"<": [3, 3],
	"<=": [3, 3],
	"~=": [3, 3],
	">": [3, 3],
	">=": [3, 3],
	and: [2, 2],
	or: [1, 1],
};

export const DEFAULT_UNARY_OP_PRIORTY = 8;
