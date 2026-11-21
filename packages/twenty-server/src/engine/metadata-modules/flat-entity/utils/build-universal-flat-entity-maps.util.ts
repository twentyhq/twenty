export const buildUniversalFlatEntityMaps = <
  TUniversalFlatEntity extends { universalIdentifier: string },
>(
  universalFlatEntities: TUniversalFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalFlatEntities.map((universalFlatEntity) => [
      universalFlatEntity.universalIdentifier,
      universalFlatEntity,
    ]),
  ),
});
