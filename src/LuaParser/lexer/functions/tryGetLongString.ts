import { TextStream } from "../stream";
import { getLongEqualsCount } from "./getLongEqualsCount";
import { hasLongStringEnd } from "./hasLongStringEnd";
import { isLeftSquareBracket } from "./isLeftSquareBracket";

export function tryGetLongString(
	stream: TextStream,
): [string, string] | [undefined, undefined] {
	const start = stream.getPtr();
	if (isLeftSquareBracket(stream)) {
		let equalsCount = getLongEqualsCount(stream);
		let depth = 1;
		if (isLeftSquareBracket(stream, equalsCount + 1)) {
			// start parsing the string. strip the starting bit
			stream.skip(equalsCount + 2);

			// get the contents
			const contentStart = stream.getPtr();
			while (true) {
				// check for eof
				if (stream.isEof()) {
					throw `Expected \`]${"=".repeat(equalsCount)}\` near <eof>`;
				}

				// check for the end
				let [foundEnd, depthChange] = hasLongStringEnd(
					stream,
					equalsCount,
				);

				depth += depthChange;

				if (foundEnd) {
					depth--;
					if (depth === 0) {
						break;
					}
					stream.skip(equalsCount + 1);
				} else {
					stream.next();
				}
			}

			// get the interior string
			const contentString = stream.sub(contentStart, stream.getPtr());

			// found the end. get rid of the trailing bit
			stream.skip(equalsCount + 2);

			// get the exterior strong
			const longString = stream.sub(start, stream.getPtr());
			return [contentString, longString];
		}
	}
	return [undefined, undefined];
}
