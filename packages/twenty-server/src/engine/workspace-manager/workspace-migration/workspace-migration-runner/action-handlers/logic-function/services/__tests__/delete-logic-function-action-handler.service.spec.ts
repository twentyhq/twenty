import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { DeleteLogicFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/logic-function/services/delete-logic-function-action-handler.service';

const FUNCTION_ID = 'logic-function-id';
const FUNCTION_UNIVERSAL_ID = 'logic-function-universal-id';

const flatLogicFunction = {
  id: FUNCTION_ID,
  universalIdentifier: FUNCTION_UNIVERSAL_ID,
  builtHandlerPath: 'built/handler.js',
};

const buildContext = () =>
  ({
    flatAction: { entityId: FUNCTION_ID },
    queryRunner: {
      manager: {
        getRepository: jest.fn().mockReturnValue({ delete: jest.fn() }),
      },
    },
    workspaceId: 'workspace-id',
    allFlatEntityMaps: {
      flatLogicFunctionMaps: {
        universalIdentifierById: { [FUNCTION_ID]: FUNCTION_UNIVERSAL_ID },
        byUniversalIdentifier: { [FUNCTION_UNIVERSAL_ID]: flatLogicFunction },
      },
    },
    flatApplication: { universalIdentifier: 'app-universal-id' },
  }) as any;

describe('DeleteLogicFunctionActionHandlerService', () => {
  let handler: DeleteLogicFunctionActionHandlerService;
  let driverDelete: jest.Mock;
  let fileStorageService: FileStorageService;
  let warn: jest.Mock;

  beforeEach(() => {
    driverDelete = jest.fn().mockResolvedValue(undefined);

    const driver = {
      delete: driverDelete,
    } as unknown as LogicFunctionDriver;

    const driverFactory = {
      getCurrentDriver: jest.fn().mockReturnValue(driver),
    } as unknown as LogicFunctionDriverFactory;

    fileStorageService = {
      deleteFolder: jest.fn().mockResolvedValue(undefined),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    } as unknown as FileStorageService;

    handler = new DeleteLogicFunctionActionHandlerService(
      fileStorageService,
      driverFactory,
    );

    warn = jest.fn();
    (handler as unknown as { logger: { warn: jest.Mock } }).logger = {
      warn,
    };
  });

  it('should release the runtime resource via the driver', async () => {
    await handler.executeForMetadata(buildContext());

    expect(driverDelete).toHaveBeenCalledTimes(1);
    expect(driverDelete).toHaveBeenCalledWith(flatLogicFunction);
  });

  it('should not wedge metadata deletion when the driver delete fails', async () => {
    driverDelete.mockRejectedValueOnce(new Error('aws down'));

    await expect(
      handler.executeForMetadata(buildContext()),
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledTimes(1);
  });
});
