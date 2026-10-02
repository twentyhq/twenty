export type Expect<T extends true> = T;

export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// Class types are compared through their instance type
export type HasAllProperties<T, U> = [T] extends [new (...args: any[]) => any]
  ? HasAllProperties<InstanceType<T>, U>
  : [U] extends [new (...args: any[]) => any]
    ? HasAllProperties<T, InstanceType<U>>
    : {
          [K in keyof U]-?: K extends keyof T ? Equal<T[K], U[K]> : false;
        }[keyof U] extends true
      ? true
      : false;

class TestClass {
  id!: string;
  name!: string;
}

// oxlint-disable-next-line unused-imports/no-unused-vars
type BasicTests = [
  Expect<Equal<string, string>>,
  Expect<Equal<number, number>>,
  Expect<Equal<{ a: string }, { a: string }>>,

  Expect<HasAllProperties<{ a: string; b: number }, { a: string }>>,
  Expect<HasAllProperties<{ a: string; b: number }, { a: string; b: number }>>,
  Expect<
    HasAllProperties<{ a?: string; b: number }, { a?: string; b: number }>
  >,

  Expect<HasAllProperties<{ a: never; b: never }, { a: never }>>,

  Expect<HasAllProperties<TestClass, { id: string }>>,
  Expect<HasAllProperties<{ id: string; name: string }, { id: string }>>,
];
