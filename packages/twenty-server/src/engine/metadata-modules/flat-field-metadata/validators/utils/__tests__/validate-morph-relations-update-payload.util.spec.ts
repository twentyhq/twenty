import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { validateMorphRelationsUpdatePayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relations-update-payload.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000c1';

const buildFixture = () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      twentyStandardApplicationId: '20202020-0000-4000-8000-000000000001',
      now: '2026-10-11T12:00:00.000Z',
    });
  const fields = Object.values(
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const objects = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((object) => ({
      ...object,
      fieldIds: fields
        .filter((field) => field.objectMetadataId === object.id)
        .map((field) => field.id),
    }));
  const group = fields.find(
    (field) =>
      field.universalIdentifier ===
      STANDARD_OBJECTS.noteTarget.fields.target.universalIdentifier,
  );
  const target = fields.find(
    (field) =>
      isDefined(group) &&
      field.morphId === group.morphId &&
      !isMorphRelationGroup(field),
  );

  if (
    !isDefined(group) ||
    !isDefined(target) ||
    !isDefined(target.relationTargetObjectMetadataId)
  ) {
    throw new Error('Expected the standard noteTarget morph field');
  }

  const newDestination = objects.find(
    (object) =>
      object.id !== group.objectMetadataId &&
      !object.isRemote &&
      !fields.some(
        (field) =>
          field.morphId === group.morphId &&
          field.relationTargetObjectMetadataId === object.id,
      ),
  );

  if (!isDefined(newDestination)) {
    throw new Error('Expected an object that is not yet a destination');
  }

  return {
    group,
    target,
    existingDestinationId: target.relationTargetObjectMetadataId,
    newDestinationId: newDestination.id,
    owner: { universalIdentifier: group.applicationUniversalIdentifier },
    maps: {
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
        flatEntities: objects,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
    },
  };
};

describe('validateMorphRelationsUpdatePayload', () => {
  it('accepts a new destination from the application that owns the field', () => {
    const { group, newDestinationId, owner, maps } = buildFixture();

    expect(
      validateMorphRelationsUpdatePayload({
        ...maps,
        flatFieldMetadataToUpdate: group,
        morphRelationsUpdatePayload: [
          { targetObjectMetadataId: newDestinationId },
        ],
        flatApplication: owner,
        isSystemBuild: false,
      }),
    ).toEqual([]);
  });

  it('rejects destinations sent to one of the physical targets', () => {
    const { target, newDestinationId, owner, maps } = buildFixture();

    expect(
      validateMorphRelationsUpdatePayload({
        ...maps,
        flatFieldMetadataToUpdate: target,
        morphRelationsUpdatePayload: [
          { targetObjectMetadataId: newDestinationId },
        ],
        flatApplication: owner,
        isSystemBuild: false,
      }),
    ).toEqual([
      expect.objectContaining({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      }),
    ]);
  });

  it('rejects destinations added by another application unless it is a system build', () => {
    const { group, newDestinationId, maps } = buildFixture();
    const validate = (isSystemBuild: boolean) =>
      validateMorphRelationsUpdatePayload({
        ...maps,
        flatFieldMetadataToUpdate: group,
        morphRelationsUpdatePayload: [
          { targetObjectMetadataId: newDestinationId },
        ],
        flatApplication: {
          universalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
        isSystemBuild,
      });

    expect(validate(false)).toEqual([
      expect.objectContaining({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      }),
    ]);
    expect(validate(true)).toEqual([]);
  });

  it('reports every invalid destination in the payload', () => {
    const { group, existingDestinationId, newDestinationId, owner, maps } =
      buildFixture();
    const unknownObjectMetadataId = '20202020-0000-4000-8000-0000000000ff';

    expect(
      validateMorphRelationsUpdatePayload({
        ...maps,
        flatFieldMetadataToUpdate: group,
        morphRelationsUpdatePayload: [
          { targetObjectMetadataId: newDestinationId },
          { targetObjectMetadataId: newDestinationId },
          { targetObjectMetadataId: unknownObjectMetadataId },
          { targetObjectMetadataId: group.objectMetadataId },
          { targetObjectMetadataId: existingDestinationId },
        ],
        flatApplication: owner,
        isSystemBuild: false,
      }),
    ).toEqual([
      expect.objectContaining({
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: expect.stringContaining('listed more than once'),
      }),
      expect.objectContaining({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      }),
      expect.objectContaining({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: expect.stringContaining('its own object'),
      }),
      expect.objectContaining({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: expect.stringContaining('already a destination'),
      }),
    ]);
  });
});
