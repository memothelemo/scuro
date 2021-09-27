// INSPIRED BY ROBLOX-TS
import * as luau from "../bundle";

const ARRAY_MARKER = Symbol("Array");

export type NodePage<T extends luau.Node> = {
	prev?: NodePage<T>;
	next?: NodePage<T>;
	value: T;
};

export type NodeArray<T extends luau.Node> = {
	[ARRAY_MARKER]: true;
	page?: NodePage<T>;
	readonly readonly: boolean;
};

export namespace NodeArray {
	export function makePage<T extends luau.Node>(value: T): NodePage<T> {
		return {
			value: value,
		};
	}

	export function setParentToAll<T extends luau.Node>(
		value: NodeArray<T>,
		parent: luau.Node,
	) {
		NodeArray.forEach(value, element => parent.addChild(element));
	}

	export function make<T extends luau.Node>(
		readonly = false,
		...values: T[]
	): NodeArray<T> {
		if (values.length > 0) {
			const array: NodeArray<T> = {
				[ARRAY_MARKER]: true,
				readonly: readonly,
			};

			// making a new page right now
			let currentPage: NodePage<T> = {
				value: values[0],
			};

			array.page = currentPage;

			// removing the first element
			// because it wasn't used anymore
			values.shift();

			values.forEach(node => {
				// creating new page
				let newPage: NodePage<T> = {
					prev: currentPage,
					value: node,
				};

				// and then set next property to the current page
				currentPage.next = newPage;

				// override the value
				currentPage = newPage;
			});

			return array;
		}
		return {
			[ARRAY_MARKER]: true,
			readonly: readonly,
		};
	}

	export function clone<T extends luau.Node>(
		array: NodeArray<T>,
	): NodeArray<T> {
		const newArray = NodeArray.make<T>(false);
		NodeArray.forEach(array, element => {
			NodeArray.push(newArray, element);
		});
		return newArray;
	}

	export function shift<T extends luau.Node>(array: NodeArray<T>) {
		if (array.readonly) {
			throw new Error("Cannot override readonly NodeArray!");
		}

		// ignore if page does not exists in that array or
		// a page doesn't have a next property on it
		if (!array.page || !array.page.next) {
			return undefined;
		}

		const lastPage = array.page;
		const nextPage = lastPage.next!;

		nextPage.prev = undefined;
		array.page = nextPage;

		lastPage.next = undefined;

		return lastPage;
	}

	export function unshift<T extends luau.Node>(
		array: NodeArray<T>,
		value: T,
	) {
		if (array.readonly) {
			throw new Error("Cannot override readonly NodeArray!");
		}

		// if page does not exists in that array then override it
		if (!array.page) {
			array.page = NodeArray.makePage(value);
			return;
		}

		// get the first member of the page possible
		const lastPage = array.page;

		// make a new page and do some configurations
		const newPage = NodeArray.makePage(value);
		newPage.next = lastPage;
		lastPage.prev = newPage;

		array.page = lastPage;
	}

	export function pop<T extends luau.Node>(array: NodeArray<T>) {
		if (array.readonly) {
			throw new Error("Cannot override readonly NodeArray!");
		}

		// get the second to the last page
		// how: prediction

		// ignore if page does not exists in that array or
		// a page doesn't have a next property on it
		if (!array.page || !array.page.next) {
			return undefined;
		}

		let currentPage = array.page;
		while (currentPage.next!.next) {
			currentPage = currentPage.next!;
		}

		const secondLastPage = currentPage;
		const lastPage = secondLastPage.next!;

		secondLastPage.next = undefined;
		lastPage.prev = undefined;
		lastPage.next = undefined;

		return lastPage;
	}

	export function push<T extends luau.Node>(array: NodeArray<T>, value: T) {
		if (array.readonly) {
			throw new Error("Cannot override readonly NodeArray!");
		}

		// if page does not exists in that array then override it
		if (!array.page) {
			array.page = NodeArray.makePage(value);
			return;
		}

		// find the deepest page available
		let lastPage = array.page;
		while (lastPage.next) {
			lastPage = lastPage.next;
		}

		// make a new page and do some configurations
		const newPage = NodeArray.makePage(value);
		newPage.prev = lastPage;
		lastPage.next = newPage;

		return;
	}

	export function isArray(value: unknown): value is NodeArray<luau.Node> {
		return (
			typeof value === "object" &&
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(value as any)[ARRAY_MARKER] === true
		);
	}

	export function isEmpty<T extends luau.Node>(array: NodeArray<T>) {
		return array.page === undefined;
	}

	export function isNonEmpty<T extends luau.Node>(array: NodeArray<T>) {
		return array.page !== undefined;
	}

	export function forEach<T extends luau.Node>(
		array: NodeArray<T>,
		callback: (node: T) => void,
	): void {
		let page = array.page;
		while (page) {
			callback(page.value);
			page = page.next;
		}
	}

	export function map<T extends luau.Node, U>(
		array: NodeArray<T>,
		callback: (value: T) => U,
	): Array<U> {
		const result = new Array<U>();
		NodeArray.forEach(array, node => result.push(callback(node)));
		return result;
	}

	export function toArray<T extends luau.Node>(
		array: NodeArray<T>,
	): Array<T> {
		const result = new Array<T>();
		NodeArray.forEach(array, node => result.push(node));
		return result;
	}

	export function every<T extends luau.Node>(
		array: NodeArray<T>,
		callback: (value: T) => boolean,
	) {
		let node = array.page;
		while (node) {
			if (!callback(node.value)) {
				return false;
			}
			node = node.next;
		}
		return true;
	}

	export function some<T extends luau.Node>(
		array: NodeArray<T>,
		callback: (value: T) => boolean,
	) {
		let node = array.page;
		while (node) {
			if (callback(node.value)) {
				return true;
			}
			node = node.next;
		}
		return false;
	}

	export function size<T extends luau.Node>(array: NodeArray<T>) {
		let size = 0;
		let page = array.page;
		while (page) {
			size++;
			page = page.next;
		}
		return size;
	}
}
