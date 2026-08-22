import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type UniversalFlatTimelineActivityType } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-timeline-activity-type.type';
import { FlatTimelineActivityTypeValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-timeline-activity-type-validator.service';

const TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000a1';
const OTHER_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000a2';
const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000b1';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000b2';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c1';

const buildTimelineActivityType = (
  overrides: Partial<UniversalFlatTimelineActivityType> = {},
): UniversalFlatTimelineActivityType => ({
  universalIdentifier: TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'noteCreated',
  label: 'Note created',
  action: 'created',
  icon: 'IconNotes',
  renderer: 'activity',
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  createdAt: '2026-08-22T00:00:00.000Z',
  updatedAt: '2026-08-22T00:00:00.000Z',
  ...overrides,
});

const mapsFrom = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildCreationArgs = ({
  flatTimelineActivityType = buildTimelineActivityType(),
  objectUniversalIdentifiers = [OBJECT_UNIVERSAL_IDENTIFIER],
}: {
  flatTimelineActivityType?: UniversalFlatTimelineActivityType;
  objectUniversalIdentifiers?: string[];
} = {}) =>
  ({
    flatEntityToValidate: flatTimelineActivityType,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: mapsFrom([flatTimelineActivityType]),
      flatObjectMetadataMaps: mapsFrom(
        objectUniversalIdentifiers.map((universalIdentifier) => ({
          universalIdentifier,
        })),
      ),
    },
    buildOptions: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      isSystemBuild: false,
    },
  }) as unknown as Parameters<
    FlatTimelineActivityTypeValidatorService['validateFlatTimelineActivityTypeCreation']
  >[0];

const buildUpdateArgs = ({
  existingTimelineActivityTypes = [buildTimelineActivityType()],
  flatEntityUpdate,
  universalIdentifier = TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
  callerApplicationUniversalIdentifier = APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  existingTimelineActivityTypes?: UniversalFlatTimelineActivityType[];
  flatEntityUpdate: Record<string, unknown>;
  universalIdentifier?: string;
  callerApplicationUniversalIdentifier?: string;
}) =>
  ({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: mapsFrom(existingTimelineActivityTypes),
      flatObjectMetadataMaps: mapsFrom([
        { universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER },
      ]),
    },
    buildOptions: {
      applicationUniversalIdentifier: callerApplicationUniversalIdentifier,
      isSystemBuild: false,
    },
  }) as unknown as Parameters<
    FlatTimelineActivityTypeValidatorService['validateFlatTimelineActivityTypeUpdate']
  >[0];

const buildDeletionArgs = ({
  flatTimelineActivityType = buildTimelineActivityType(),
  callerApplicationUniversalIdentifier = APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  flatTimelineActivityType?: UniversalFlatTimelineActivityType;
  callerApplicationUniversalIdentifier?: string;
} = {}) =>
  ({
    flatEntityToValidate: flatTimelineActivityType,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: mapsFrom([flatTimelineActivityType]),
    },
    buildOptions: {
      applicationUniversalIdentifier: callerApplicationUniversalIdentifier,
      isSystemBuild: false,
    },
  }) as unknown as Parameters<
    FlatTimelineActivityTypeValidatorService['validateFlatTimelineActivityTypeDeletion']
  >[0];

describe('FlatTimelineActivityTypeValidatorService', () => {
  let service: FlatTimelineActivityTypeValidatorService;

  beforeEach(() => {
    service = new FlatTimelineActivityTypeValidatorService();
  });

  it('should accept a valid creation', () => {
    const result =
      service.validateFlatTimelineActivityTypeCreation(buildCreationArgs());

    expect(result.errors).toEqual([]);
  });

  it('should reject creating a type bound to an object that does not exist', () => {
    const result = service.validateFlatTimelineActivityTypeCreation(
      buildCreationArgs({ objectUniversalIdentifiers: [] }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('does not exist');
  });

  it.each([['name'], ['label']])(
    'should reject an empty %s update',
    (property) => {
      const result = service.validateFlatTimelineActivityTypeUpdate(
        buildUpdateArgs({ flatEntityUpdate: { [property]: '' } }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(
        TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      );
    },
  );

  it.each([
    ['action', 'unsupportedAction'],
    ['renderer', 'unsupportedRenderer'],
  ])('should reject an unsupported %s update', (property, value) => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({ flatEntityUpdate: { [property]: value } }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
    );
  });

  it('should reject removing the object binding from a specialized renderer', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        flatEntityUpdate: { objectUniversalIdentifier: null },
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('requires');
  });

  it('should reject assigning a specialized renderer to an unbound type', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        existingTimelineActivityTypes: [
          buildTimelineActivityType({
            renderer: 'genericLinked',
            objectUniversalIdentifier: null,
          }),
        ],
        flatEntityUpdate: { renderer: 'message' },
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('requires');
  });

  it('should reject binding a type to an object that does not exist', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        flatEntityUpdate: {
          objectUniversalIdentifier: '00000000-0000-4000-8000-0000000000ff',
        },
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('does not exist');
  });

  it('should reject a duplicate name within the same application', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        existingTimelineActivityTypes: [
          buildTimelineActivityType(),
          buildTimelineActivityType({
            universalIdentifier:
              OTHER_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
            name: 'messageSent',
          }),
        ],
        flatEntityUpdate: { name: 'messageSent' },
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
    );
  });

  it('should allow the same name in another application', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        existingTimelineActivityTypes: [
          buildTimelineActivityType(),
          buildTimelineActivityType({
            universalIdentifier:
              OTHER_TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier:
              OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
            name: 'messageSent',
          }),
        ],
        flatEntityUpdate: { name: 'messageSent' },
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('should accept a valid partial update', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({ flatEntityUpdate: { label: 'Note added' } }),
    );

    expect(result.errors).toEqual([]);
  });

  it('should reject updating a standard timeline activity type from another application', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        existingTimelineActivityTypes: [
          buildTimelineActivityType({
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
          }),
        ],
        flatEntityUpdate: { label: 'Changed standard label' },
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_IS_STANDARD,
    );
  });

  it('should allow the standard application to update its timeline activity type', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        callerApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        existingTimelineActivityTypes: [
          buildTimelineActivityType({
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
          }),
        ],
        flatEntityUpdate: { label: 'Updated standard label' },
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('should reject deleting a standard timeline activity type from another application', () => {
    const result = service.validateFlatTimelineActivityTypeDeletion(
      buildDeletionArgs({
        flatTimelineActivityType: buildTimelineActivityType({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
        }),
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_IS_STANDARD,
    );
  });

  it('should stop after reporting a missing timeline activity type', () => {
    const result = service.validateFlatTimelineActivityTypeUpdate(
      buildUpdateArgs({
        existingTimelineActivityTypes: [],
        flatEntityUpdate: { renderer: 'message' },
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND,
    );
  });
});
