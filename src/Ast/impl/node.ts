import * as luau from "../bundle";

export type Node = NodeObject;

const KEYWORD_SYMBOL = Symbol("Keyword");
const EXPRESSION_SYMBOL = Symbol("Expression");
const TOKEN_SYMBOL = Symbol("Token");
const STATEMENT_SYMBOL = Symbol("Statement");

class NodeObject {
	private _children = new Array<Node>();

	textRange?: {
		row: number;
		column: number;
	};

	public constructor(
		public kind: luau.SyntaxKind,
		public parent?: luau.Node,
	) {}

	public addChild(node: luau.Node) {
		if (!this._children.includes(node)) {
			node.parent = this;
			this._children.push(node);
		}
	}

	public getSourceFile() {
		return luau.getSourceFileOfNode(this);
	}

	public forEach(callback: (child: Node) => void) {
		this._children.forEach(child => callback(child));
	}

	public getChildCount() {
		return this._children.length;
	}

	public getChildAt(index: number) {
		return this.getChildren()[index];
	}

	public getChildren() {
		return this._children;
	}
}

export function isNode(node: unknown): node is luau.Node {
	// fastest way to do that
	return (
		typeof node === "object" &&
		(node as { kind: number }).kind !== undefined
	);
}

type FilterProps<T, U> = Omit<T, keyof U>;

export function createNode<T extends luau.Node>(
	kind: T["kind"],
	field: FilterProps<T, luau.Node>,
	parent?: luau.Node,
) {
	const newNode = new NodeObject(kind, parent);
	for (const [index, value] of Object.entries(field)) {
		if (luau.isNode(value)) {
			newNode.addChild(value);
			Object.assign(newNode, {
				[index]: value,
			});
		} else if (luau.NodeArray.isArray(value)) {
			luau.NodeArray.setParentToAll(value, newNode);
			Object.assign(newNode, {
				[index]: value,
			});
		} else {
			Object.assign(newNode, {
				[index]: value,
			});
		}
	}
	return newNode as T;
}

export function cloneNode<T extends luau.Node>(node: T): T {
	// copy contents
	const newNode = new NodeObject(node.kind, node.parent) as T;
	for (const [index, value] of Object.entries(node)) {
		// exclude kind and parent
		if (index === "parent" || index === "kind") {
			continue;
		} else if (luau.isNode(value)) {
			const childNode = cloneNode(value);
			childNode.parent = newNode;
			Object.assign(childNode, {
				[index]: childNode,
			});
		} else if (luau.NodeArray.isArray(value)) {
			const newArray = luau.NodeArray.clone(value);
			luau.NodeArray.setParentToAll(newArray, newNode);
			Object.assign(newNode, {
				[index]: newArray,
			});
		} else {
			Object.assign(newNode, {
				[index]: value,
			});
		}
	}

	return newNode;
}

export function createKeyword<T extends luau.Keyword>(
	kind: T["kind"],
	value: T["keyword"],
	parent?: luau.Node,
) {
	return createExpression<luau.Keyword>(
		kind,
		{
			symbol: KEYWORD_SYMBOL,
			keyword: value,
		},
		parent,
	) as unknown as T;
}

export function createExpression<T extends luau.Expression>(
	kind: T["kind"],
	field: FilterProps<T, luau.Expression>,
	parent?: luau.Node,
) {
	const newField = Object.assign(field, {
		expressionSymbol: EXPRESSION_SYMBOL,
	}) as unknown as FilterProps<T, luau.Node>;
	const expNode = createNode(kind, newField, parent);
	return expNode as T;
}

export function createToken<T extends luau.Token>(
	kind: T["kind"],
	text: T["text"],
	parent?: luau.Node,
) {
	const tokenNode = createNode(
		kind,
		{
			tokenSymbol: TOKEN_SYMBOL,
			text: text,
		} as unknown as FilterProps<T, luau.Node>,
		parent,
	);
	return tokenNode as T;
}

export function createStatement<T extends luau.Statement>(
	kind: T["kind"],
	field: FilterProps<T, luau.Statement>,
	parent?: luau.Node,
) {
	const newField = Object.assign(field, {
		statementSymbol: STATEMENT_SYMBOL,
	}) as unknown as FilterProps<T, luau.Node>;
	const tokenNode = createNode(kind, newField, parent);
	return tokenNode as T;
}
