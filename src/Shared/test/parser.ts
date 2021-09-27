import fs from "fs";
import path from "path";
import { Parser } from "../../Parser/parser";

// adapted from Yueliang
const source = fs
	.readFileSync(
		path.join(__dirname, "..", "..", "..", "test-parser-lines.txt"),
	)
	.toString();

let unexpectedErrors = 0;
let failedToParse = 0;

source.split("\n").every((line, i) => {
	try {
		const parser = Parser.fromSource(line);
		parser.parse();
		// hack
		if (line.endsWith("-- FAIL")) {
			unexpectedErrors++;
			console.log(
				`Unexpected successful parsing but intended to fail (index: ${
					i + 1
				})`,
			);
		}
	} catch (e) {
		if (!line.endsWith("-- FAIL")) {
			failedToParse++;
			console.log(`Failed to parse line id: ${i + 1}, reason: ${e}`);
		}
	}
	if (i >= 300) return false;
	return true;
});

console.log(
	`Failed to parse: ${failedToParse} | Unexpected successful parsing: ${unexpectedErrors}`,
);
