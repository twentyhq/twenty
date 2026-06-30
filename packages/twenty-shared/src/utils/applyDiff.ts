import { isDefined } from '@/utils/validation';
import { isNumber, isObject, isString } from '@sniptt/guards';
import { type Difference } from 'microdiff';

type ObjectType = Record<string, unknown>;
type ArrayType = unknown[];
type MutableData = ObjectType | ArrayType;

type ArrayDeletionFn = () => void;

// Symbol used to mark array elements for deletion
const REMOVE_SYMBOL = Symbol('micropatch-delete');

const FORBIDDEN_OBJECT_KEYS = ['__proto__', 'constructor', 'prototype'];

export const applyDiff = <T>(obj: T, diffs: Difference[]): T => {
  if (!isDefined(obj)) {
    throw new Error('Cannot apply diff to null or undefined object');
  }

  if (!Array.isArray(diffs)) {
    throw new Error('Diffs must be an array');
  }

  // Create a deep copy to avoid modifying read-only/frozen objects
  const mutableObj = deepClone(obj) as T;
  const arrayDeletionQueue: ArrayDeletionFn[] = [];

  for (const diff of diffs) {
    if (!diff || !diff.path || diff.path.length === 0) {
      continue;
    }

    try {
      applyDiffToPath(mutableObj as MutableData, diff, arrayDeletionQueue);
    } catch (error) {
      throw new Error(
        `Failed to apply diff at path ${diff.path.join('.')}: ${error}`,
      );
    }
  }

  arrayDeletionQueue.forEach((deletionFn) => deletionFn());

  return mutableObj;
};

const applyDiffToPath = (
  obj: MutableData,
  diff: Difference,
  arrayDeletionQueue: ArrayDeletionFn[],
) => {
  const { path, type } = diff;
  const value = 'value' in diff ? diff.value : undefined;
  const pathLength = path.length;
  const lastPathElement = path[pathLength - 1];

  const parentContainer = navigateToParent(obj, path);

  switch (type) {
    case 'CREATE':
    case 'CHANGE':
      setValueAtPath(parentContainer, lastPathElement, value);
      break;

    case 'REMOVE':
      handleRemoval(
        obj,
        path,
        parentContainer,
        lastPathElement,
        arrayDeletionQueue,
      );
      break;

    default:
      throw new Error(`Unsupported diff type: ${type}`);
  }
};

const navigateToParent = (
  obj: MutableData,
  path: (string | number)[],
): MutableData => {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const pathElement = path[i];

    if (current === null || current === undefined) {
      throw new Error(
        `Cannot traverse path: found null/undefined at element ${i}`,
      );
    }

    if (isNumber(pathElement) && !Array.isArray(current)) {
      throw new Error(
        `Expected array at path element ${i}, got ${typeof current}`,
      );
    }

    if (isString(pathElement) && Array.isArray(current)) {
      throw new Error(`Expected object at path element ${i}, got array`);
    }

    if (Array.isArray(current)) {
      current = current[pathElement as number] as MutableData;
    } else {
      current = (current as ObjectType)[pathElement as string] as MutableData;
    }
  }

  return current;
};

const setValueAtPath = (
  container: MutableData,
  pathElement: string | number,
  value: unknown,
): void => {
  if (Array.isArray(container)) {
    if (!isNumber(pathElement)) {
      throw new Error(
        `Expected numeric index for array, got ${typeof pathElement}`,
      );
    }

    try {
      container[pathElement] = value;
    } catch (error) {
      throw new Error(
        `Cannot set array element at index ${pathElement}: ${error}. Array may be non-extensible.`,
      );
    }
  } else if (isObject(container)) {
    if (FORBIDDEN_OBJECT_KEYS.includes(pathElement as string)) {
      throw new Error(
        `Refusing to set forbidden property key '${pathElement}' on object (prototype pollution protection)`,
      );
    }

    try {
      container[pathElement] = value;
    } catch (error) {
      throw new Error(
        `Cannot set property '${String(pathElement)}': ${error}. Object may be non-extensible.`,
      );
    }
  } else {
    throw new Error(`Expected object or array, got ${typeof container}`);
  }
};

const handleRemoval = (
  rootObj: MutableData,
  fullPath: (string | number)[],
  parentContainer: MutableData,
  lastPathElement: string | number,
  arrayDeletionQueue: ArrayDeletionFn[],
): void => {
  if (Array.isArray(parentContainer)) {
    handleArrayRemoval(
      rootObj,
      fullPath,
      parentContainer,
      lastPathElement,
      arrayDeletionQueue,
    );
  } else {
    handleObjectRemoval(parentContainer as ObjectType, lastPathElement);
  }
};

// Handles removal from arrays by marking for deletion and queuing cleanup
const handleArrayRemoval = (
  rootObj: MutableData,
  fullPath: (string | number)[],
  parentArray: ArrayType,
  index: string | number,
  arrayDeletionQueue: ArrayDeletionFn[],
): void => {
  if (typeof index !== 'number') {
    throw new Error(
      `Expected numeric index for array removal, got ${typeof index}`,
    );
  }

  parentArray[index] = REMOVE_SYMBOL;

  arrayDeletionQueue.push(() => {
    if (fullPath.length === 1) {
      if (Array.isArray(rootObj)) {
        filterRemoveSymbols(rootObj);
      }
    } else {
      filterRemoveSymbols(parentArray);
    }
  });
};

const handleObjectRemoval = (
  parentObject: ObjectType,
  key: string | number,
): void => {
  if (FORBIDDEN_OBJECT_KEYS.includes(key as string)) {
    return;
  }

  delete parentObject[key];
};

const filterRemoveSymbols = (array: ArrayType): void => {
  const indicesToRemove: number[] = [];

  for (let i = 0; i < array.length; i++) {
    if (array[i] === REMOVE_SYMBOL) {
      indicesToRemove.push(i);
    }
  }

  for (let i = indicesToRemove.length - 1; i >= 0; i--) {
    array.splice(indicesToRemove[i], 1);
  }
};

const deepClone = (obj: MutableData): MutableData => {
  if (obj === null || !isObject(obj)) {
    return obj;
  }

  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(obj) as MutableData;
    } catch {
      return deepCloneJson(obj);
    }
  }

  return deepCloneJson(obj);
};

const deepCloneJson = (obj: MutableData): MutableData => {
  try {
    return JSON.parse(JSON.stringify(obj)) as MutableData;
  } catch {
    throw new Error('Failed to clone object');
  }
};
