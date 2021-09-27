export function castArray<T>(value: T | T[]): T[];
export function castArray<T>(value: T | readonly T[]): readonly T[];
export function castArray<T>(value: T | readonly T[]): readonly T[] {
	return Array.isArray(value) ? value : [value];
}
