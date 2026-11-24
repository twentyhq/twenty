import {
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { fromRollupSettingsToUniversalRollupSettings } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-rollup-settings-to-universal-rollup-settings.util';
import { getRollupSettingsFieldMetadataIds } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-rollup-settings-field-metadata-ids.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

const toRelationUniversalSettings = ({
  settings,
  fieldMetadataIdToUniversalIdentifierMap,
}: {
  settings: FieldMetadataSettings<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
}) => {
  const { junctionTargetFieldId, ...universalSettings } = settings;

  return {
    ...universalSettings,
    ...(isDefined(junctionTargetFieldId) && {
      junctionTargetFieldUniversalIdentifier:
        fieldMetadataIdToUniversalIdentifierMap.get(junctionTargetFieldId),
    }),
  };
};

const toUniversalSettings = ({
  fieldMetadataType,
  settings,
  fieldMetadataIdToUniversalIdentifierMap,
}: {
  fieldMetadataType: FieldMetadataType;
  settings: FieldMetadataSettings;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
}): FlatFieldMetadata['universalSettings'] => {
  if (
    fieldMetadataType === FieldMetadataType.ROLLUP &&
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.ROLLUP)
  ) {
    return fromRollupSettingsToUniversalRollupSettings({
      settings,
      fieldMetadataUniversalIdentifierById: Object.fromEntries(
        getRollupSettingsFieldMetadataIds(settings).map((fieldMetadataId) => [
          fieldMetadataId,
          fieldMetadataIdToUniversalIdentifierMap.get(fieldMetadataId),
        ]),
      ),
    });
  }

  const isRelationSettings =
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION) ||
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.MORPH_RELATION);

  return isRelationSettings
    ? toRelationUniversalSettings({
        settings,
        fieldMetadataIdToUniversalIdentifierMap,
      })
    : settings;
};

export const fromFieldMetadataEntityToFlatFieldMetadata = (
  args: FromEntityToFlatEntityArgs<'fieldMetadata'>,
): FlatFieldMetadata => {
  const {
    entity: fieldMetadataEntity,
    fieldMetadataIdToUniversalIdentifierMap,
  } = args;

  const fieldMetadataScalarEntity = fromEntityToScalarEntity({
    metadataName: 'fieldMetadata',
    entity: fieldMetadataEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'fieldMetadata',
      ...args,
    });

  const settingsWithUniversalIdentifiers = toUniversalSettings({
    fieldMetadataType: fieldMetadataEntity.type,
    settings: fieldMetadataEntity.settings,
    fieldMetadataIdToUniversalIdentifierMap,
  });

  return {
    ...fieldMetadataScalarEntity,
    ...relationUniversalIdentifiers,
    kanbanAggregateOperationViewIds:
      fieldMetadataEntity.kanbanAggregateOperationViews.map(({ id }) => id),
    calendarViewIds: fieldMetadataEntity.calendarViews.map(({ id }) => id),
    calendarEndViewIds: fieldMetadataEntity.calendarEndViews.map(
      ({ id }) => id,
    ),
    mainGroupByFieldMetadataViewIds:
      fieldMetadataEntity.mainGroupByFieldMetadataViews?.map(({ id }) => id) ??
      [],
    viewFieldIds: fieldMetadataEntity.viewFields.map(({ id }) => id),
    viewFilterIds: fieldMetadataEntity.viewFilters.map(({ id }) => id),
    fieldPermissionIds:
      fieldMetadataEntity.fieldPermissions?.map(({ id }) => id) ?? [],
    viewFieldUniversalIdentifiers: fieldMetadataEntity.viewFields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFilterUniversalIdentifiers: fieldMetadataEntity.viewFilters.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    kanbanAggregateOperationViewUniversalIdentifiers:
      fieldMetadataEntity.kanbanAggregateOperationViews.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    calendarViewUniversalIdentifiers: fieldMetadataEntity.calendarViews.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    calendarEndViewUniversalIdentifiers:
      fieldMetadataEntity.calendarEndViews.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    mainGroupByFieldMetadataViewUniversalIdentifiers:
      fieldMetadataEntity.mainGroupByFieldMetadataViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    viewSortIds: fieldMetadataEntity.viewSorts?.map(({ id }) => id) ?? [],
    viewSortUniversalIdentifiers:
      fieldMetadataEntity.viewSorts?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    searchFieldMetadataIds:
      fieldMetadataEntity.searchFieldMetadatas?.map(({ id }) => id) ?? [],
    rowLevelPermissionPredicateIds:
      fieldMetadataEntity.rowLevelPermissionPredicates?.map(({ id }) => id) ??
      [],
    rowLevelPermissionPredicateUniversalIdentifiers:
      fieldMetadataEntity.rowLevelPermissionPredicates?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    relationRowLevelPermissionPredicateIds:
      fieldMetadataEntity.relationRowLevelPermissionPredicates?.map(
        ({ id }) => id,
      ) ?? [],
    relationRowLevelPermissionPredicateUniversalIdentifiers:
      fieldMetadataEntity.relationRowLevelPermissionPredicates?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    workspaceMemberRowLevelPermissionPredicateIds:
      fieldMetadataEntity.workspaceMemberRowLevelPermissionPredicates?.map(
        ({ id }) => id,
      ) ?? [],
    workspaceMemberRowLevelPermissionPredicateUniversalIdentifiers:
      fieldMetadataEntity.workspaceMemberRowLevelPermissionPredicates?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    fieldMetadataOptionIds:
      fieldMetadataEntity.fieldMetadataOptions?.map(({ id }) => id) ?? [],
    fieldMetadataOptionUniversalIdentifiers:
      fieldMetadataEntity.fieldMetadataOptions?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    searchFieldMetadataUniversalIdentifiers:
      fieldMetadataEntity.searchFieldMetadatas?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    fieldPermissionUniversalIdentifiers:
      fieldMetadataEntity.fieldPermissions?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    universalSettings: settingsWithUniversalIdentifiers,
  };
};
