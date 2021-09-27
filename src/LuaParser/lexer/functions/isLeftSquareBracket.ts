import * as charcodes from "LuaParser/shared/charcodes";
import { TextStream } from "../stream";

export function isLeftSquareBracket(stream: TextStream, offset = 0) {
	return stream.peekToCode(offset) === charcodes.leftSquareBracket;
}
