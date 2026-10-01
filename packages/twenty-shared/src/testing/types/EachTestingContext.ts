export type EachTestingContext<T> = {
  title: string;
  context: T;
  only?: true;
};
