import * as charcodes from "LuaParser/shared/charcodes";
import { TextStream } from "../stream";
import { getDepthFromEmbeddedLongString } from "./getDepthFromEmbeddedLongStringt";

export function hasLongStringEnd(
	stream: TextStream,
	equalsCount: number,
): [boolean, number] {
	let initial = true;
	if (stream.peekToCode() === charcodes.rightSquareBracket) {
		for (let i = 1; i <= equalsCount; i++) {
			if (stream.peekToCode(i) !== charcodes.equalsTo) {
				initial = false;
			}
		}
		if (
			stream.peekToCode(equalsCount + 1) !== charcodes.rightSquareBracket
		) {
			return [false, 0];
		}
		return [initial, 0];
	}
	let depth = 0;
	if (stream.peekToCode() === charcodes.leftSquareBracket) {
		depth = getDepthFromEmbeddedLongString(stream, equalsCount);
	}
	return [false, depth];
}
