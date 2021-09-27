export const hasOwnProperty = (
	obj: Record<string, unknown> | unknown[],
	key: string | number,
): boolean => Object.prototype.hasOwnProperty.call(obj, key);
