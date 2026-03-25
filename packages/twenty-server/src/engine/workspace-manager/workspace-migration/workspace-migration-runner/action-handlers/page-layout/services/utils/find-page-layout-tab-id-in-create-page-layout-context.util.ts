import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const findPageLayoutTabIdInCreatePageLayoutContext = ({
  universalIdentifier,
  tabIdByUniversalIdentifier,
  flatPageLayoutTabMaps,
}: {
  universalIdentifier: string;
  tabIdByUniversalIdentifier: Record<string, string> | undefined;
  flatPageLayoutTabMaps: AllFlatEntityMaps['flatPageLayoutTabMaps'];
}): string | null => {
  const providedId = tabIdByUniversalIdentifier?.[universalIdentifier];

  if (isDefined(providedId)) {
    return providedId;
  }

  const existingTab =
    flatPageLayoutTabMaps.byUniversalIdentifier[universalIdentifier];

  return existingTab?.id ?? null;
};
