import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Drives the same code path as `code-step-build.service.ts ::
// switchCodeStepLogicFunctionsToPrebuilt`: reads the freshly built flat
// function, then runs it through the workspace migration with
// `executionMode = PREBUILT`. The update-action-handler will install the
// prebuilt bundle synchronously when the prebuilt feature flag is on.
//
// The required services live in `LogicFunctionModule` /
// `WorkspaceManyOrAllFlatEntityMapsCacheModule`. Importing those modules
// from a Jest test file pulls `graphql-upload`'s `.mjs` files into Jest's
// CJS transform, which crashes parsing — so we rely on `setup-test.ts`
// (which runs through `tsx/esm`) to resolve them once and stash them on
// `globalThis`.
export const switchLogicFunctionToPrebuilt = async ({
  logicFunctionId,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
}: {
  logicFunctionId: string;
  workspaceId?: string;
}): Promise<void> => {
  const helperService = global.logicFunctionFromSourceHelperService;
  const flatEntityMapsCacheService =
    global.workspaceManyOrAllFlatEntityMapsCacheService;

  const { flatLogicFunctionMaps, flatApplicationMaps } =
    await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
    });

  const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: logicFunctionId,
    flatEntityMaps: flatLogicFunctionMaps,
  });

  if (!flatLogicFunction) {
    throw new Error(
      `switchLogicFunctionToPrebuilt: logic function '${logicFunctionId}' not found in workspace '${workspaceId}'`,
    );
  }

  if (!flatLogicFunction.isBuildUpToDate || !flatLogicFunction.checksum) {
    throw new Error(
      `switchLogicFunctionToPrebuilt: logic function '${logicFunctionId}' is not built ` +
        `(isBuildUpToDate=${flatLogicFunction.isBuildUpToDate}, checksum=${flatLogicFunction.checksum ?? 'null'}). ` +
        `Trigger a build first by executing the function once in LIVE mode.`,
    );
  }

  const applicationUniversalIdentifier = flatLogicFunction.applicationId
    ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
        ?.universalIdentifier
    : undefined;

  if (!applicationUniversalIdentifier) {
    throw new Error(
      `switchLogicFunctionToPrebuilt: cannot resolve applicationUniversalIdentifier for ` +
        `logic function '${logicFunctionId}' (applicationId=${flatLogicFunction.applicationId ?? 'null'})`,
    );
  }

  await helperService.updateOneFromMetadata({
    flatLogicFunctionToUpdate: {
      ...flatLogicFunction,
      executionMode: LogicFunctionExecutionMode.PREBUILT,
      updatedAt: new Date().toISOString(),
    },
    workspaceId,
    applicationUniversalIdentifier,
  });
};
