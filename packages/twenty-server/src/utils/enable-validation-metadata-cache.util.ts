import { getMetadataStorage } from 'class-validator';

let installed = false;

export const enableValidationMetadataCache = (): void => {
  if (installed) {
    return;
  }
  installed = true;

  const storage = getMetadataStorage();
  const computeTargetValidationMetadatas =
    storage.getTargetValidationMetadatas.bind(storage);

  type ValidationMetadatas = ReturnType<
    typeof computeTargetValidationMetadatas
  >;

  const cacheByTarget = new WeakMap<object, Map<string, ValidationMetadatas>>();

  storage.getTargetValidationMetadatas = (
    targetConstructor,
    targetSchema,
    always,
    strictGroups,
    groups,
  ) => {
    let cacheByArgs = cacheByTarget.get(targetConstructor);

    if (cacheByArgs === undefined) {
      cacheByArgs = new Map();
      cacheByTarget.set(targetConstructor, cacheByArgs);
    }

    const cacheKey = `${targetSchema}|${always}|${strictGroups}|${[
      ...(groups ?? []),
    ]
      .sort()
      .join(',')}`;

    const cached = cacheByArgs.get(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    // Safe to memoize: a target's own and inherited validation metadata is fully
    // registered at class load, before the target can ever be validated. Classes loaded
    // later only register their own metadata and never change this target's result.
    const metadatas = computeTargetValidationMetadatas(
      targetConstructor,
      targetSchema,
      always,
      strictGroups,
      groups,
    );

    cacheByArgs.set(cacheKey, metadatas);

    return metadatas;
  };
};
