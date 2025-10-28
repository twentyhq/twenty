export const mergeUpdateInExistingRecord = <
  TExisting,
  P extends keyof TExisting,
  TUpdate extends Partial<TExisting>,
>({
  existing,
  properties,
  update,
}: {
  existing: TExisting;
  update: TUpdate;
  properties: P[];
}) =>
  properties.reduce((acc, property) => {
    const isPropertyUpdated = update[property] !== undefined;

    return {
      ...acc,
      ...(isPropertyUpdated ? { [property]: update[property] } : {}),
    };
  }, existing);
