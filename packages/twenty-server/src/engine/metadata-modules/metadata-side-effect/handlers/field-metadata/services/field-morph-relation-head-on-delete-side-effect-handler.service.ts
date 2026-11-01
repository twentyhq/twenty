import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldMorphRelationHeadOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldMorphRelationHeadOnDelete',
    description:
      'When the last target of a morph relation is deleted, delete its head and the view fields displaying it. Counterpart of fieldMorphRelationHeadOnCreate: manifest deletion inference excludes isSystemSideEffect rows, so removing a morph field from a manifest would otherwise leave the head behind, still reserving the field name. Noop while another target of the same morphId survives or is created in the same batch.',
  },
) {
  buildSideEffects({
    flatEntity: target,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (
      !isFlatFieldMetadataOfType(target, FieldMetadataType.MORPH_RELATION) ||
      isMorphRelationHead(target)
    ) {
      return { status: 'noop' };
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      relatedFlatEntityMaps;

    const head = flatFieldMetadataMaps.byUniversalIdentifier[target.morphId];

    const fieldsToDelete =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToDelete ?? {};

    if (
      !isDefined(head) ||
      isDefined(fieldsToDelete[head.universalIdentifier])
    ) {
      return { status: 'noop' };
    }

    const remainingObjectFields = (
      flatObjectMetadataMaps.byUniversalIdentifier[
        target.objectMetadataUniversalIdentifier
      ]?.fieldUniversalIdentifiers ?? []
    )
      .filter(
        (universalIdentifier) =>
          !isDefined(fieldsToDelete[universalIdentifier]),
      )
      .map(
        (universalIdentifier) =>
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
      );

    const fieldsToCreate = Object.values(
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToCreate ?? {},
    );

    const hasRemainingTarget = [...remainingObjectFields, ...fieldsToCreate]
      .filter(isDefined)
      .some(
        (field) =>
          field.type === FieldMetadataType.MORPH_RELATION &&
          field.morphId === target.morphId &&
          !isMorphRelationHead(field),
      );

    if (hasRemainingTarget) {
      return { status: 'noop' };
    }

    const viewFieldsToDelete = Object.fromEntries(
      head.viewFieldUniversalIdentifiers
        .map(
          (universalIdentifier) =>
            relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
              universalIdentifier
            ],
        )
        .filter(isDefined)
        .map((viewField) => [viewField.universalIdentifier, viewField]),
    );

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToDelete: { [head.universalIdentifier]: head },
        },
        viewField: {
          flatEntityToDelete: viewFieldsToDelete,
        },
      },
    };
  }
}
