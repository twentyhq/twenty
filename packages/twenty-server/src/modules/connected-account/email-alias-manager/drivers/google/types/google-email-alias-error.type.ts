export type GoogleEmailAliasError = {
  code?: string;
  errors: {
    reason: string;
    message: string;
  }[];
};
