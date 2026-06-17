import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type WebhookMetadataName = typeof ALL_METADATA_NAME.webhook;

class TestWorkspaceEntityMigrationBuilderService extends WorkspaceEntityMigrationBuilderService<WebhookMetadataName> {
  constructor() {
    super(ALL_METADATA_NAME.webhook);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<WebhookMetadataName>,
  ): UniversalFlatEntityValidationReturnType<WebhookMetadataName, 'create'> {
    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'webhook',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<WebhookMetadataName>,
  ): UniversalFlatEntityValidationReturnType<WebhookMetadataName, 'delete'> {
    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'webhook',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<WebhookMetadataName>,
  ): UniversalFlatEntityValidationReturnType<WebhookMetadataName, 'update'> {
    return {
      status: 'success',
      action: {
        type: 'update',
        metadataName: 'webhook',
        universalIdentifier: args.universalIdentifier,
        update: args.flatEntityUpdate,
      },
    };
  }
}

const emptyMetadataMaps = (): MetadataUniversalFlatEntityMaps<WebhookMetadataName> => ({
  byUniversalIdentifier: {},
});

const buildToMapsWithSingleEntity = (
  universalIdentifier: string,
): MetadataUniversalFlatEntityMaps<WebhookMetadataName> => ({
  byUniversalIdentifier: {
    [universalIdentifier]: {
      universalIdentifier,
    } as unknown as MetadataUniversalFlatEntity<WebhookMetadataName>,
  },
});

const runCreationValidateAndBuild = (toUniversalIdentifier: string) => {
  const service = new TestWorkspaceEntityMigrationBuilderService();

  (
    service as unknown as {
      logger: { perfTime: jest.Mock; perfTimeEnd: jest.Mock };
    }
  ).logger = {
    perfTime: jest.fn(),
    perfTimeEnd: jest.fn(),
  };

  return service.validateAndBuild({
    buildOptions: {
      isSystemBuild: true,
      applicationUniversalIdentifier: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    } satisfies WorkspaceMigrationBuilderOptions,
    dependencyOptimisticFlatEntityMaps:
      createEmptyAllFlatEntityMaps() as unknown as AllUniversalFlatEntityMaps,
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    additionalCacheDataMaps: {
      featureFlagsMap: {},
    } as unknown as WorkspaceMigrationBuilderAdditionalCacheDataMaps,
    from: emptyMetadataMaps(),
    to: buildToMapsWithSingleEntity(toUniversalIdentifier),
  });
};

describe('WorkspaceEntityMigrationBuilderService', () => {
  describe('universalIdentifier lowercase enforcement', () => {
    it('should fail when a created entity has an uppercase universalIdentifier', async () => {
      const uppercaseUniversalIdentifier =
        '2CCD5DD8-6CFF-41E6-8A34-22EC0010A9F9';

      const result = await runCreationValidateAndBuild(
        uppercaseUniversalIdentifier,
      );

      expect(result.status).toBe('fail');

      if (result.status !== 'fail') {
        throw new Error('Expected validateAndBuild to fail');
      }

      const messages = result.errors.flatMap((failedValidation) =>
        failedValidation.errors.map((error) => error.message),
      );

      expect(
        messages.some((message) =>
          message.includes(
            `Invalid universalIdentifier: "${uppercaseUniversalIdentifier}" must be lowercase`,
          ),
        ),
      ).toBe(true);
    });

    it('should succeed when a created entity has a lowercase universalIdentifier', async () => {
      const lowercaseUniversalIdentifier =
        '2ccd5dd8-6cff-41e6-8a34-22ec0010a9f9';

      const result = await runCreationValidateAndBuild(
        lowercaseUniversalIdentifier,
      );

      expect(result.status).toBe('success');
    });
  });
});
