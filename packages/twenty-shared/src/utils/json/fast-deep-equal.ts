// Source: https://github.com/epoberezkin/fast-deep-equal/blob/master/src/index.jst

export const fastDeepEqual = (
  firstValue: unknown,
  secondValue: unknown,
): boolean => {
  if (firstValue === secondValue) return true;

  if (
    firstValue &&
    secondValue &&
    typeof firstValue === 'object' &&
    typeof secondValue === 'object'
  ) {
    if (firstValue.constructor !== secondValue.constructor) return false;

    if (Array.isArray(firstValue)) {
      const firstArray = firstValue;
      const secondArray = secondValue as unknown[];

      if (firstArray.length !== secondArray.length) return false;

      for (let index = firstArray.length; index-- !== 0; ) {
        if (!fastDeepEqual(firstArray[index], secondArray[index])) return false;
      }

      return true;
    }

    if (firstValue instanceof Map && secondValue instanceof Map) {
      if (firstValue.size !== secondValue.size) return false;

      for (const [key] of firstValue.entries()) {
        if (!secondValue.has(key)) return false;
      }

      for (const [key, value] of firstValue.entries()) {
        if (!fastDeepEqual(value, secondValue.get(key))) return false;
      }

      return true;
    }

    if (firstValue instanceof Set && secondValue instanceof Set) {
      if (firstValue.size !== secondValue.size) return false;

      for (const item of firstValue) {
        if (!secondValue.has(item)) return false;
      }

      return true;
    }

    if (ArrayBuffer.isView(firstValue) && ArrayBuffer.isView(secondValue)) {
      const firstView = firstValue as unknown as ArrayLike<unknown>;
      const secondView = secondValue as unknown as ArrayLike<unknown>;

      if (firstView.length !== secondView.length) return false;

      for (let index = firstView.length; index-- !== 0; ) {
        if (firstView[index] !== secondView[index]) return false;
      }

      return true;
    }

    if (firstValue.constructor === RegExp) {
      const firstRegex = firstValue as RegExp;
      const secondRegex = secondValue as RegExp;

      return (
        firstRegex.source === secondRegex.source &&
        firstRegex.flags === secondRegex.flags
      );
    }

    if (firstValue.valueOf !== Object.prototype.valueOf) {
      return firstValue.valueOf() === secondValue.valueOf();
    }

    if (firstValue.toString !== Object.prototype.toString) {
      return firstValue.toString() === secondValue.toString();
    }

    const firstKeys = Object.keys(firstValue);
    const secondKeys = Object.keys(secondValue);

    if (firstKeys.length !== secondKeys.length) return false;

    for (let index = firstKeys.length; index-- !== 0; ) {
      if (!(firstKeys[index] in secondValue)) return false;
    }

    for (let index = firstKeys.length; index-- !== 0; ) {
      const key = firstKeys[index];

      if (
        !fastDeepEqual(
          (firstValue as Record<string, unknown>)[key],
          (secondValue as Record<string, unknown>)[key],
        )
      ) {
        return false;
      }
    }

    return true;
  }

  // true if both NaN, false otherwise
  return firstValue !== firstValue && secondValue !== secondValue;
};
