import { type ConditionalDisplaySurface } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getConditionalDisplayRoleUniversalIdentifiers } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-conditional-display-role-universal-identifiers.util';
import { getUniversalFlatEntityConditionalDisplays } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-universal-flat-entity-conditional-displays.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export const isRoleReferencedByUniversalFlatEntityMaps = <
  TMetadataName extends ConditionalDisplaySurface,
>({
  roleUniversalIdentifier,
  metadataName,
  flatEntityMaps,
}: {
  roleUniversalIdentifier: string;
  metadataName: TMetadataName;
  flatEntityMaps: MetadataUniversalFlatEntityMaps<TMetadataName>;
}): boolean =>
  Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .some((universalFlatEntity) =>
      getUniversalFlatEntityConditionalDisplays({
        metadataName,
        property: 'conditionalDisplay',
        universalConditionalDisplay:
          universalFlatEntity.universalConditionalDisplay,
        universalOverrides:
          'universalOverrides' in universalFlatEntity
            ? universalFlatEntity.universalOverrides
            : undefined,
      }).some((conditionalDisplay) =>
        getConditionalDisplayRoleUniversalIdentifiers(
          conditionalDisplay,
        ).includes(roleUniversalIdentifier),
      ),
    );
