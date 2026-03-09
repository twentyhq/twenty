export const resolveOverridableEntityProperty = <
  TEntity extends { overrides?: Partial<TEntity> | null },
  K extends string & keyof TEntity,
>(
  entity: TEntity,
  property: K,
): TEntity[K] => {
  const overrideValue = entity.overrides?.[property];

  return overrideValue !== undefined ? overrideValue : entity[property];
};
