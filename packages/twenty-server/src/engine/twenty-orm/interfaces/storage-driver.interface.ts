export interface StorageDriver<
  Params extends object = Record<string, unknown>,
> {
  collectData(params?: Params): Promise<Array<unknown>>;
}
