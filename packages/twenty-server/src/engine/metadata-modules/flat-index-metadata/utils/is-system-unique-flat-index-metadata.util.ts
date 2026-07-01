export const isSystemUniqueFlatIndexMetadata = (flatIndexMetadata: {
  isSystemSideEffect: boolean;
  isUnique: boolean;
}): boolean =>
  flatIndexMetadata.isSystemSideEffect === true &&
  flatIndexMetadata.isUnique === true;
