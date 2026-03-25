export type FunctionInput =
  | {
      [name: string]: FunctionInput;
    }
  | any;
