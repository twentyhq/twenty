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
