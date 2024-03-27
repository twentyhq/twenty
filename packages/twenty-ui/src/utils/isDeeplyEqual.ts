import deepEqual from 'deep-equal';

export const isDeeplyEqual = <T>(a: T, b: T) => deepEqual(a, b);
