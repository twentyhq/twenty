import { FileFolder } from 'twenty-shared/types';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { DeleteLogicFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/logic-function/services/delete-logic-function-action-handler.service';
import { type FlatDeleteLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import { type WorkspaceMigrationActionRunnerContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

class TestDeleteLogicFunctionActionHandlerService extends DeleteLogicFunctionActionHandlerService {
  public exposeGetAfterCommitSideEffects(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteLogicFunctionAction>,
  ) {
    return this.getAfterCommitSideEffects(context);
  }
}

describe('DeleteLogicFunctionActionHandlerService', () => {
  const workspaceId = 'workspace-1';
  const logicFunctionId = 'fn-1';
  const universalIdentifier = 'fn-universal-id';
  const builtHandlerPath = 'path/to/built/handler.js';
  const applicationUniversalIdentifier = 'app-universal-id';

  const flatLogicFunction = {
    id: logicFunctionId,
    universalIdentifier,
    builtHandlerPath,
  } as FlatLogicFunction;

  let service: TestDeleteLogicFunctionActionHandlerService;
  let deleteFolder: jest.Mock;
  let deleteFile: jest.Mock;
  let driverDelete: jest.Mock;
  let getCurrentDriver: jest.Mock;
  let repositoryDelete: jest.Mock;
  let getRepository: jest.Mock;

  const buildContext =
    (): WorkspaceMigrationActionRunnerContext<FlatDeleteLogicFunctionAction> =>
      ({
        flatAction: {
          type: 'delete',
          metadataName: 'logicFunction',
          entityId: logicFunctionId,
        },
        queryRunner: {
          manager: { getRepository },
        },
        workspaceId,
        allFlatEntityMaps: {
          flatLogicFunctionMaps: {
            byUniversalIdentifier: {
              [universalIdentifier]: flatLogicFunction,
            },
            universalIdentifierById: {
              [logicFunctionId]: universalIdentifier,
            },
            universalIdentifiersByApplicationId: {},
          },
        },
        flatApplication: {
          universalIdentifier: applicationUniversalIdentifier,
        },
      }) as unknown as WorkspaceMigrationActionRunnerContext<FlatDeleteLogicFunctionAction>;

  beforeEach(() => {
    deleteFolder = jest.fn().mockResolvedValue(undefined);
    deleteFile = jest.fn().mockResolvedValue(undefined);
    driverDelete = jest.fn().mockResolvedValue(undefined);
    getCurrentDriver = jest.fn().mockReturnValue({
      delete: driverDelete,
    } as unknown as LogicFunctionDriver);
    repositoryDelete = jest.fn().mockResolvedValue(undefined);
    getRepository = jest.fn().mockReturnValue({ delete: repositoryDelete });

    const fileStorageService = {
      deleteFolder,
      deleteFile,
    } as unknown as FileStorageService;
    const logicFunctionDriverFactory = {
      getCurrentDriver,
    } as unknown as LogicFunctionDriverFactory;

    service = new TestDeleteLogicFunctionActionHandlerService(
      fileStorageService,
      logicFunctionDriverFactory,
    );
  });

  describe('executeForMetadata', () => {
    it('should only delete the row in the transaction and perform no S3/Lambda calls', async () => {
      await service.executeForMetadata(buildContext());

      expect(repositoryDelete).toHaveBeenCalledWith({
        id: logicFunctionId,
        workspaceId,
      });
      expect(deleteFolder).not.toHaveBeenCalled();
      expect(deleteFile).not.toHaveBeenCalled();
      expect(getCurrentDriver).not.toHaveBeenCalled();
      expect(driverDelete).not.toHaveBeenCalled();
    });
  });

  describe('getAfterCommitSideEffects', () => {
    it('should return the source folder, built handler and runtime resource deletes', () => {
      const sideEffects =
        service.exposeGetAfterCommitSideEffects(buildContext());

      expect(sideEffects).toHaveLength(3);
      const expectedSuffix = `(universalIdentifier=${universalIdentifier}, applicationUniversalIdentifier=${applicationUniversalIdentifier})`;

      expect(sideEffects.map((sideEffect) => sideEffect.description)).toEqual([
        `source folder for logic function ${logicFunctionId} ${expectedSuffix}`,
        `built handler for logic function ${logicFunctionId} ${expectedSuffix}`,
        `runtime resource for logic function ${logicFunctionId} ${expectedSuffix}`,
      ]);
    });

    it('should not run any external delete until the side effect is invoked', () => {
      service.exposeGetAfterCommitSideEffects(buildContext());

      expect(deleteFolder).not.toHaveBeenCalled();
      expect(deleteFile).not.toHaveBeenCalled();
      expect(driverDelete).not.toHaveBeenCalled();
    });

    it('should delete the source folder when the first side effect runs', async () => {
      const [sourceFolderSideEffect] =
        service.exposeGetAfterCommitSideEffects(buildContext());

      await sourceFolderSideEffect.run();

      expect(deleteFolder).toHaveBeenCalledWith({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        folderPath: logicFunctionId,
      });
    });

    it('should delete the built handler file when the second side effect runs', async () => {
      const [, builtHandlerSideEffect] =
        service.exposeGetAfterCommitSideEffects(buildContext());

      await builtHandlerSideEffect.run();

      expect(deleteFile).toHaveBeenCalledWith({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: builtHandlerPath,
      });
    });

    it('should delete the runtime resource via the current driver when the third side effect runs', async () => {
      const [, , runtimeResourceSideEffect] =
        service.exposeGetAfterCommitSideEffects(buildContext());

      await runtimeResourceSideEffect.run();

      expect(getCurrentDriver).toHaveBeenCalledTimes(1);
      expect(driverDelete).toHaveBeenCalledWith(flatLogicFunction);
    });
  });
});
