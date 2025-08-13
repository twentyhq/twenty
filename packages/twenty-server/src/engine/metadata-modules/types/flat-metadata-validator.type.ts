export type FlatMetadataValidator<T> = {
  validator: (value: T) => boolean;
  message: string;
};
