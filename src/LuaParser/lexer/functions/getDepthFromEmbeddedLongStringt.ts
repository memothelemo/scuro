import * as charcodes from "LuaParser/shared/charcodes";
import { TextStream } from "../stream";
import { isLeftSquareBracket } from "./isLeftSquareBracket";

export function getDepthFromEmbeddedLongString(
	stream: TextStream,
	equalsCount: number,
) {
	let embedded = true;
	let depth = 0;
	for (let i = 1; i <= equalsCount; i++) {
		if (stream.peekToCode(i) !== charcodes.equalsTo) {
			embedded = false;
			break;
		}
	}
	if (isLeftSquareBracket(stream, equalsCount + 1) && embedded) {
		// oh look, there was
		depth++;
		for (let i = 1; i <= equalsCount + 2; i++) {
			stream.next();
		}
	}
	return depth;
}
