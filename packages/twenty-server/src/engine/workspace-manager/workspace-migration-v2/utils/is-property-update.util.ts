import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export const isPropertyUpdate = <T, P extends keyof T>(
  update: PropertyUpdate<T, keyof T>,
  property: P,
): update is PropertyUpdate<T, P> => {
  return update.property === property;
};
