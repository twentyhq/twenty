export type EachTestingContext<T> = {
  title: string;
  context: T;
  // TODO implem
  skip?: boolean
  only?: boolean
};
