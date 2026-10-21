import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';
import { fromUniversalConditionalDisplayToConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-universal-conditional-display-to-conditional-display.util';

type UniversalViewFieldOverrides =
  FormatRecordSerializedRelationProperties<ViewFieldOverrides>;

const fromUniversalOverridesToViewFieldOverridesEntry = ({
  universalOverrides,
  flatViewFieldGroupMaps,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: UniversalViewFieldOverrides;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): ViewFieldOverrides => {
  const { viewFieldGroupUniversalIdentifier, ...otherOverrides } =
    universalOverrides;

  const scalarOverrides: ViewFieldOverrides =
    mapOverridesEntryConditionalDisplay({
      overridesEntry: otherOverrides,
      mapConditionalDisplay: (universalConditionalDisplay) =>
        fromUniversalConditionalDisplayToConditionalDisplay({
          universalConditionalDisplay,
          flatFieldMetadataMaps,
          flatRoleMaps,
        }),
    });

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
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: AuthoredOverrides<UniversalViewFieldOverrides>;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): AuthoredOverrides<ViewFieldOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'viewField',
    overrides: universalOverrides,
    mapEntry: (entry) =>
      fromUniversalOverridesToViewFieldOverridesEntry({
        universalOverrides: entry,
        flatViewFieldGroupMaps,
        flatFieldMetadataMaps,
        flatRoleMaps,
      }),
  });
