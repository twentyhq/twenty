import { isObject } from '@sniptt/guards';

export const isEmptyObject = (obj: any): obj is object => {
  return isObject(obj) && Object.keys(obj).length === 0;
};
