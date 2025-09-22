import { isNumber, isObject, isString } from '@sniptt/guards';
import { type Difference } from 'microdiff';

type ObjectType = Record<string, unknown>;
type ArrayType = unknown[];
type MutableData = ObjectType | ArrayType;

type ArrayDeletionFn = () => void;

// Symbol used to mark array elements for deletion
const REMOVE_SYMBOL = Symbol('micropatch-delete');

export const applyDiff = <T>(obj: T, diffs: Difference[]): T => {
  if (!obj) {
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
      throw new Error(`Failed to apply diff at path ${diff.path.join('.')}: ${error}`);
    }
  }

  arrayDeletionQueue.forEach((deletionFn) => deletionFn());

  return mutableObj;
};

const applyDiffToPath = (
  obj: MutableData,
  diff: Difference,
  arrayDeletionQueue: ArrayDeletionFn[]
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
      handleRemoval(obj, path, parentContainer, lastPathElement, arrayDeletionQueue);
      break;
      
    default:
      throw new Error(`Unsupported diff type: ${type}`);
  }
};

const navigateToParent = (obj: MutableData, path: (string | number)[]): MutableData => {
  let current = obj;
  
  for (let i = 0; i < path.length - 1; i++) {
    const pathElement = path[i];
    
    if (current === null || current === undefined) {
      throw new Error(`Cannot traverse path: found null/undefined at element ${i}`);
    }
    
    if (isNumber(pathElement) && !Array.isArray(current)) {
      throw new Error(`Expected array at path element ${i}, got ${typeof current}`);
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
  value: unknown
): void => {
  if (Array.isArray(container)) {
    if (!isNumber(pathElement)) {
      throw new Error(`Expected numeric index for array, got ${typeof pathElement}`);
    }
    
    try {
      container[pathElement] = value;
    } catch (error) {
      throw new Error(`Cannot set array element at index ${pathElement}: ${error}. Array may be non-extensible.`);
    }
  } else {
    try {
      (container as ObjectType)[pathElement] = value;
    } catch (error) {
      throw new Error(`Cannot set property '${String(pathElement)}': ${error}. Object may be non-extensible.`);
    }
  }
};

const handleRemoval = (
  rootObj: MutableData,
  fullPath: (string | number)[],
  parentContainer: MutableData,
  lastPathElement: string | number,
  arrayDeletionQueue: ArrayDeletionFn[]
): void => {
  if (Array.isArray(parentContainer)) {
    handleArrayRemoval(rootObj, fullPath, parentContainer, lastPathElement, arrayDeletionQueue);
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
  arrayDeletionQueue: ArrayDeletionFn[]
): void => {
  if (typeof index !== 'number') {
    throw new Error(`Expected numeric index for array removal, got ${typeof index}`);
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
  key: string | number
): void => {
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

  try {
    return structuredClone(obj) as MutableData;
  } catch {
    try {
      return JSON.parse(JSON.stringify(obj)) as MutableData;
    } catch {
      return manualDeepClone(obj);
    }
  }
};

const manualDeepClone = (obj: MutableData): MutableData => {
  if (obj === null || !isObject(obj)) {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as MutableData;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj) as unknown as MutableData;
  }

  if (Array.isArray(obj)) {
    const newArray: ArrayType = [];
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i];
      if (isObject(item)) {
        newArray[i] = manualDeepClone(item as MutableData);
      } else {
        newArray[i] = item;
      }
    }
    return newArray;
  }

  const cloned: ObjectType = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as ObjectType)[key];
      if (isObject(value)) {
        cloned[key] = manualDeepClone(value as MutableData);
      } else {
        cloned[key] = value;
      }
    }
  }

  return cloned;
};
