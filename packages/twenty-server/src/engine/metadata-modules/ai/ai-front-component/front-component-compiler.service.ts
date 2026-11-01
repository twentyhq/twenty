import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  decodeFrontComponentTypeReferences,
  encodeFrontComponentTypeReferences,
} from 'twenty-shared/front-component-build';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { convertFrontComponentBuildFailureToException } from 'src/engine/metadata-modules/ai/ai-front-component/utils/convert-front-component-build-failure-to-exception.util';
import { getFrontComponentCompilerTypeReferences } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-compiler-type-references.util';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

@Injectable()
export class FrontComponentCompilerService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly driverFactory: LogicFunctionDriverFactory,
    private readonly workspaceDependencies: WorkspaceFrontComponentDependenciesService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
  ) {}

  async build({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: FrontComponentBuildInput;
  }) {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');
    if (
      driverType !== LogicFunctionDriverType.LOCAL &&
      driverType !== LogicFunctionDriverType.LAMBDA
    ) {
      throw new FrontComponentException(
        'AI component compilation requires the LOCAL or LAMBDA logic-function driver.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    const source = this.buildEntrySource(input);
    const driver = this.driverFactory.getCurrentDriver();
    const builtDependencies =
      await this.workspaceDependencies.getSharedDependenciesOrThrow(
        workspaceId,
      );
    const typeReferences = encodeFrontComponentTypeReferences({
      ...getFrontComponentCompilerTypeReferences(),
      ...decodeFrontComponentTypeReferences(
        Buffer.from(builtDependencies.typeReferences, 'base64'),
      ),
      ...(await this.sdkClientArchiveService.getClientTypeReferences({
        workspaceId,
        applicationId: builtDependencies.applicationId,
        applicationUniversalIdentifier:
          builtDependencies.applicationUniversalIdentifier,
      })),
    }).toString('base64');
    const built = await driver.transpile({
      typeReferences,
      targetRuntime: 'browser',
      workspaceId,
      input,
      manifest: {
        checksum: builtDependencies.checksum,
        exports: builtDependencies.exports,
      },
    });
    if (!built.success) {
      throw convertFrontComponentBuildFailureToException(built);
    }
    if (
      createHash('sha256').update(built.builtCode).digest('hex') !==
        built.checksum ||
      built.sharedDependenciesChecksum !== builtDependencies.checksum ||
      Buffer.byteLength(built.builtCode) >
        FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES
    ) {
      throw new FrontComponentException(
        'Frontend component build checksum mismatch.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    return {
      source,
      dependencyRevision: builtDependencies.dependencyRevision,
      componentName: FRONT_COMPONENT_WRAPPER_NAME,
      compiledSource: built.builtCode,
      hasSdkClientImport: built.hasSdkClientImport,
      checksum: built.checksum,
    };
  }

  private buildEntrySource(input: FrontComponentBuildInput) {
    try {
      return buildFrontComponentEntrySource(input);
    } catch (error) {
      if (!(error instanceof FrontComponentBuildException)) {
        throw error;
      }
      throw convertFrontComponentBuildFailureToException({
        error: error.message,
        code: error.code,
      });
    }
  }
}
