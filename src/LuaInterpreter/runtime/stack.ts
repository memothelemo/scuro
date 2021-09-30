import LuaAST from "LuaAST";

export class LuaStack {
	private statements = new Array<LuaAST.Statement>();

	public flush() {
		const trailingStatements = [...this.statements];
		this.statements = new Array<LuaAST.Statement>();
		return trailingStatements;
	}

	public pushStack(statement: LuaAST.Statement) {
		this.statements.push(statement);
	}

	public popStack() {
		this.statements.pop();
	}
}
