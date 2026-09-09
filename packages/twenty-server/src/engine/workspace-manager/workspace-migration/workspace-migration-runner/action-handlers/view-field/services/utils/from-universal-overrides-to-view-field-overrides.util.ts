import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

type UniversalViewFieldOverrides =
  FormatRecordSerializedRelationProperties<ViewFieldOverrides>;

const fromUniversalOverridesToViewFieldOverridesEntry = ({
  universalOverrides,
  flatViewFieldGroupMaps,
}: {
  universalOverrides: UniversalViewFieldOverrides;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
}): ViewFieldOverrides => {
  const { viewFieldGroupUniversalIdentifier, ...scalarOverrides } =
    universalOverrides;

  if (!isDefined(viewFieldGroupUniversalIdentifier)) {
    return {
      ...scalarOverrides,
      ...(viewFieldGroupUniversalIdentifier === null
        ? { viewFieldGroupId: null }
        : {}),
    };
  }

  const flatViewFieldGroup =
    findFlatEntityByUniversalIdentifier<FlatViewFieldGroup>({
      flatEntityMaps: flatViewFieldGroupMaps,
      universalIdentifier: viewFieldGroupUniversalIdentifier,
    });

  return {
    ...scalarOverrides,
    viewFieldGroupId: flatViewFieldGroup?.id ?? null,
  };
};

export const fromUniversalOverridesToViewFieldOverrides = ({
  universalOverrides,
  flatViewFieldGroupMaps,
}: {
  universalOverrides: AuthoredOverrides<UniversalViewFieldOverrides>;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
}): AuthoredOverrides<ViewFieldOverrides> =>
  mapAuthoredOverrideEntries(universalOverrides, (entry) =>
    fromUniversalOverridesToViewFieldOverridesEntry({
      universalOverrides: entry,
      flatViewFieldGroupMaps,
    }),
  );
