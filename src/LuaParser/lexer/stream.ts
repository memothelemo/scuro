export class TextStream {
	private ptr = 0;
	private column = 1;
	private row = 1;

	private sourceLength: number;

	public constructor(private source: string) {
		this.sourceLength = this.source.length;
	}

	public hasNext() {
		return this.sourceLength >= this.ptr;
	}

	public consume(regex: RegExp) {
		const letter = this.peek();
		if (regex.test(letter)) {
			return this.next();
		}
	}

	public sub(start: number, end: number) {
		return this.source.substring(start, end);
	}

	public next() {
		const char = this.peek();
		this.ptr++;
		if (char === "\n") {
			this.column = 0;
			this.row++;
		} else if (char === "\t") {
			this.column += 4;
		} else {
			this.column++;
		}
		return char;
	}

	public getColumn() {
		return this.column;
	}

	public getRow() {
		return this.row;
	}

	public skip(steps = 1) {
		for (let i = 1; i <= steps; i++) {
			this.next();
		}
	}

	public isEof() {
		// osyrisrblx' way to find out if it is NaN
		return this.peekToCode() !== this.peekToCode();
	}

	public peekToCode(offset = 0) {
		return this.peek(offset).charCodeAt(0);
	}

	public peek(offset = 0) {
		return this.source.substr(this.ptr + offset, 1);
	}

	public reset() {
		this.ptr = 0;
		this.column = 0;
		this.row = 0;
	}

	public getPtr() {
		return this.ptr;
	}
}
