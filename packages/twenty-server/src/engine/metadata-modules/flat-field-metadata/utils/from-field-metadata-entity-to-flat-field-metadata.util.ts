import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromFieldMetadataEntityToFlatFieldMetadata = ({
  entity: fieldMetadataEntity,
  fieldMetadataIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'fieldMetadata'>): FlatFieldMetadata => {
  const fieldMetadataWithoutRelations = removePropertiesFromRecord(
    fieldMetadataEntity,
    getMetadataEntityRelationProperties('fieldMetadata'),
  );
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      fieldMetadataEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${fieldMetadataEntity.applicationId} not found when building flat field metadata for field ${fieldMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(
      fieldMetadataEntity.objectMetadataId,
    );

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Object metadata with id ${fieldMetadataEntity.objectMetadataId} not found when building flat field metadata for field ${fieldMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let relationTargetObjectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(fieldMetadataEntity.relationTargetObjectMetadataId)) {
    relationTargetObjectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        fieldMetadataEntity.relationTargetObjectMetadataId,
      ) ?? null;

    if (!isDefined(relationTargetObjectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Relation target object metadata with id ${fieldMetadataEntity.relationTargetObjectMetadataId} not found when building flat field metadata for field ${fieldMetadataEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  let relationTargetFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(fieldMetadataEntity.relationTargetFieldMetadataId)) {
    relationTargetFieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        fieldMetadataEntity.relationTargetFieldMetadataId,
      ) ?? null;

    if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `Relation target field metadata with id ${fieldMetadataEntity.relationTargetFieldMetadataId} not found when building flat field metadata for field ${fieldMetadataEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  const settings = fieldMetadataEntity.settings;
  const isRelationSettings =
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.RELATION) ||
    isFieldMetadataSettingsOfType(settings, FieldMetadataType.MORPH_RELATION);

  const settingsWithUniversalIdentifiers = isRelationSettings
    ? {
        ...settings,
        ...(isDefined(settings.junctionTargetFieldId) && {
          junctionTargetFieldUniversalIdentifier:
            fieldMetadataIdToUniversalIdentifierMap.get(
              settings.junctionTargetFieldId,
            ),
        }),
      }
    : settings;

  return {
    ...fieldMetadataWithoutRelations,
    universalIdentifier: fieldMetadataWithoutRelations.universalIdentifier,
    createdAt: fieldMetadataWithoutRelations.createdAt.toISOString(),
    updatedAt: fieldMetadataWithoutRelations.updatedAt.toISOString(),
    kanbanAggregateOperationViewIds:
      fieldMetadataEntity.kanbanAggregateOperationViews.map(({ id }) => id),
    calendarViewIds: fieldMetadataEntity.calendarViews.map(({ id }) => id),
    mainGroupByFieldMetadataViewIds:
      fieldMetadataEntity.mainGroupByFieldMetadataViews?.map(({ id }) => id) ??
      [],
    viewFieldIds: fieldMetadataEntity.viewFields.map(({ id }) => id),
    viewFilterIds: fieldMetadataEntity.viewFilters.map(({ id }) => id),
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
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
    mainGroupByFieldMetadataViewUniversalIdentifiers:
      fieldMetadataEntity.mainGroupByFieldMetadataViews?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    universalSettings: settingsWithUniversalIdentifiers,
  };
};
