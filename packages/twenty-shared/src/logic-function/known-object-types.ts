import { capitalize } from '@/utils/strings/capitalize';

export type KnownObjectTypes = Record<string, string>;

export const buildKnownObjectTypes = (
  objects: { nameSingular: string; universalIdentifier: string }[],
): KnownObjectTypes =>
  Object.fromEntries(
    objects.map((object) => [
      capitalize(object.nameSingular),
      object.universalIdentifier,
    ]),
  );
