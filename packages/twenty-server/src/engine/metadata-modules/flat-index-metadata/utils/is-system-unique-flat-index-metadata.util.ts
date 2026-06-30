// The single-field unique index backing a unique scalar field is a system side effect whose
// whole lifecycle (create/update/delete) is owned by the metadata side-effect engine. The
// metadata API transpilers must leave it untouched so the engine is its sole owner — any other
// index (declared, composite, relation join, search vector) stays handled by the API path.
export const isSystemUniqueFlatIndexMetadata = (flatIndexMetadata: {
  isSystemSideEffect: boolean;
  isUnique: boolean;
}): boolean =>
  flatIndexMetadata.isSystemSideEffect === true &&
  flatIndexMetadata.isUnique === true;
