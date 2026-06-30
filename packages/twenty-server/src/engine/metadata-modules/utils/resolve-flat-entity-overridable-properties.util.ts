import { isDefined } from 'twenty-shared/utils';

type FlatEntityWithOverrides = {
  [key: string]: unknown;
  overrides: Record<string, unknown> | null;
};

export const resolveFlatEntityOverridableProperties = <
  T extends FlatEntityWithOverrides,
>(
  flatEntity: T,
): T => {
  if (!isDefined(flatEntity.overrides)) {
    return flatEntity;
  }

  return {
    ...flatEntity,
    ...flatEntity.overrides,
  };
};
