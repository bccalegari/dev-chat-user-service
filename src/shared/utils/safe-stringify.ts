export function safeStringify(
  value: unknown,
  replacer?: (this: unknown, key: string, value: unknown) => unknown,
  space?: number,
): string {
  const bigIntReplacer = (key: string, val: unknown): unknown =>
    typeof val === 'bigint' ? val.toString() : val;

  if (typeof replacer === 'function') {
    const combinedReplacer = (key: string, val: unknown): unknown => {
      const replacedVal: unknown = replacer.call(undefined, key, val);
      return typeof replacedVal === 'bigint'
        ? replacedVal.toString()
        : replacedVal;
    };
    return JSON.stringify(value, combinedReplacer, space);
  }

  return JSON.stringify(value, bigIntReplacer, space);
}
