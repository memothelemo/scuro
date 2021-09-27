import * as charcodes from "LuaParser/shared/charcodes";
import { TextStream } from "../stream";

export function getLongEqualsCount(stream: TextStream) {
	let equalsCount = 0;
	while (stream.peekToCode(equalsCount + 1) === charcodes.equalsTo) {
		equalsCount++;
	}
	return equalsCount;
}
