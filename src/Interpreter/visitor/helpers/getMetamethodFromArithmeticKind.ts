import { ArithmeticKind } from "../../../Interpreter/types";

export function getMetamethodNameFromArithmeticKind(kind: ArithmeticKind) {
	switch (kind) {
		case ArithmeticKind.Add:
			return "__add";
		case ArithmeticKind.Subtract:
			return "__sub";
		case ArithmeticKind.Multiply:
			return "__mul";
		case ArithmeticKind.Divide:
			return "__div";
		case ArithmeticKind.Exponent:
			return "__pow";
		case ArithmeticKind.Modulus:
			return "__mod";
		case ArithmeticKind.Concat:
			return "__concat";
		default:
			throw `Invalid arithmetic kind`;
	}
}
