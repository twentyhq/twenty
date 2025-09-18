import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-field-test-case';
import { WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-object-test-case';
import { type WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { eachTestingContextFilter } from 'twenty-shared/testing';
``

const allWorkspaceBuilderTestCases: {
  label: string;
  testCases: WorkspaceMigrationBuilderTestCase[];
}[] = [
  {
    label: 'object',
    testCases: WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES,
  },
  {
    label: 'field',
    testCases: WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES,
  },
];

describe.each(allWorkspaceBuilderTestCases)(
  'Workspace migration builder $label actions test suite',
  ({ testCases }) => {
    let service: WorkspaceMigrationBuilderV2Service;
    let featureFlagService: FeatureFlagService;
    let flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService;
    let flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService;
    let flatObjectMetadataValidatorService: FlatObjectMetadataValidatorService;
    let objectActionsBuilder: WorkspaceMigrationV2ObjectActionsBuilderService;
    let fieldActionsBuilder: WorkspaceMigrationV2FieldActionsBuilderService;

    beforeEach(() => {
      featureFlagService = {
        isFeatureEnabled: jest.fn().mockResolvedValue(true),
      } as any;

      flatFieldMetadataTypeValidatorService =
        new FlatFieldMetadataTypeValidatorService(featureFlagService);

      flatFieldMetadataValidatorService = new FlatFieldMetadataValidatorService(
        flatFieldMetadataTypeValidatorService,
      );

      flatObjectMetadataValidatorService =
        new FlatObjectMetadataValidatorService(
          flatFieldMetadataValidatorService,
        );

      objectActionsBuilder =
        new WorkspaceMigrationV2ObjectActionsBuilderService(
          flatObjectMetadataValidatorService,
        );
      fieldActionsBuilder = new WorkspaceMigrationV2FieldActionsBuilderService(
        flatFieldMetadataValidatorService,
      );
      service = new WorkspaceMigrationBuilderV2Service(
        objectActionsBuilder,
        fieldActionsBuilder,
      );
    });

    it.each(eachTestingContextFilter(testCases))(
      '$title',
      async ({ context: { input } }) => {
        const {
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
          buildOptions = {
            inferDeletionFromMissingEntities: true,
            isSystemBuild: false,
          },
        } = typeof input === 'function' ? input() : input;
        const validateAndBuildResult = await service.validateAndBuild({
          buildOptions,
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
        });

        expect(validateAndBuildResult.status).toBe('success');
        if (validateAndBuildResult.status !== 'success') {
          throw new Error('Should never occur');
        }
        expect(validateAndBuildResult.fieldsActions).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny(
            validateAndBuildResult.fieldsActions,
          ),
        );
        expect(validateAndBuildResult.objectActions).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny(
            validateAndBuildResult.objectActions,
          ),
        );
      },
    );
  },
);
