import { STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/timeline';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { FlatTimelineActivityTypeValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-timeline-activity-type-validator.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const TYPE_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';
const OBJECT_UNIVERSAL_IDENTIFIER = '33333333-3333-4333-8333-333333333333';
const RELATION_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';

const emptyMaps = () => ({ byUniversalIdentifier: {} });

const buildCreationArgs = (
  applicationUniversalIdentifier: string,
  overrides: Partial<{
    action: 'created' | 'linked';
    objectUniversalIdentifier: string | null;
    frontComponentUniversalIdentifier: string | null;
    targetRelationFieldUniversalIdentifier: string | null;
  }> = {},
) =>
  ({
    flatEntityToValidate: {
      universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier,
      name: 'recordCreated',
      label: 'was created by',
      action: 'created',
      icon: null,
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: null,
      targetRelationFieldUniversalIdentifier: null,
      triggerFieldUniversalIdentifiers: null,
      replacesTimelineActivityTypeUniversalIdentifier: null,
      isActive: true,
      overrides: null,
      createdAt: '2026-08-22T00:00:00.000Z',
      updatedAt: '2026-08-22T00:00:00.000Z',
      ...overrides,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: emptyMaps(),
      flatFrontComponentMaps: emptyMaps(),
      flatObjectMetadataMaps: emptyMaps(),
      flatFieldMetadataMaps: emptyMaps(),
    },
  }) as unknown as Parameters<
    FlatTimelineActivityTypeValidatorService['validateFlatTimelineActivityTypeCreation']
  >[0];

describe('FlatTimelineActivityTypeValidatorService', () => {
  const service = new FlatTimelineActivityTypeValidatorService();

  it('rejects a workspace-global emitter declared by an application', () => {
    const result = service.validateFlatTimelineActivityTypeCreation(
      buildCreationArgs(APPLICATION_UNIVERSAL_IDENTIFIER),
    );

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message:
            'An application timeline activity emitter must target one of its objects',
        }),
      ]),
    );
  });

  it('keeps platform fallback emitters valid', () => {
    const result = service.validateFlatTimelineActivityTypeCreation(
      buildCreationArgs(TWENTY_STANDARD_APPLICATION.universalIdentifier),
    );

    expect(result.errors).toEqual([]);
  });

  it('rejects linked emitters without through routing', () => {
    const result = service.validateFlatTimelineActivityTypeCreation(
      buildCreationArgs(APPLICATION_UNIVERSAL_IDENTIFIER, {
        action: 'linked',
        objectUniversalIdentifier: '33333333-3333-4333-8333-333333333333',
      }),
    );

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message:
            'Linked and unlinked timeline activity emitters require a target relation',
        }),
      ]),
    );
  });

  it('allows a standard renderer owned by the standard application', () => {
    const result = service.validateFlatTimelineActivityTypeCreation(
      buildCreationArgs(TWENTY_STANDARD_APPLICATION.universalIdentifier, {
        frontComponentUniversalIdentifier:
          STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message,
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('accepts a direct many-to-one relation as through routing', () => {
    const creationArgs = buildCreationArgs(APPLICATION_UNIVERSAL_IDENTIFIER, {
      action: 'linked',
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      targetRelationFieldUniversalIdentifier: RELATION_UNIVERSAL_IDENTIFIER,
    });
    const validationMaps =
      creationArgs.optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    validationMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      OBJECT_UNIVERSAL_IDENTIFIER
    ] = {
      universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    } as never;
    validationMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      RELATION_UNIVERSAL_IDENTIFIER
    ] = {
      universalIdentifier: RELATION_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.MORPH_RELATION,
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
    } as never;

    const result =
      service.validateFlatTimelineActivityTypeCreation(creationArgs);

    expect(result.errors).toEqual([]);
  });

  it('does not expose standard renderers to installed applications', () => {
    const creationArgs = buildCreationArgs(APPLICATION_UNIVERSAL_IDENTIFIER, {
      objectUniversalIdentifier: '33333333-3333-4333-8333-333333333333',
      frontComponentUniversalIdentifier:
        STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message,
    });

    creationArgs.optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFrontComponentMaps.byUniversalIdentifier[
      STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message
    ] = {
      universalIdentifier:
        STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    } as never;

    const result =
      service.validateFlatTimelineActivityTypeCreation(creationArgs);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message:
            'Timeline activity type references a front component that does not belong to its application',
        }),
      ]),
    );
  });
});
