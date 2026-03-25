import { isNumberOrNaN } from '@sniptt/guards';

export const sumByProperty = <T, K extends keyof T>(property: K) => {
  return (accumulator: number, nextItem: T) => {
    if (typeof accumulator !== 'number') {
      accumulator = 0;
    }

    if (!isNumberOrNaN(nextItem[property])) {
      return accumulator;
    }

    accumulator += nextItem[property];

    return accumulator;
  };
};
