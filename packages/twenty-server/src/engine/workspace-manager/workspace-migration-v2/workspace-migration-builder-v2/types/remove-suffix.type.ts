export type RemoveSuffix<
  T extends string,
  P extends string,
> = T extends `${infer Prefix}${P}` ? Prefix : T;
