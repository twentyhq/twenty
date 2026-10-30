import { FrontComponentSharedDependenciesService } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.service';
import { PermissionFlagType } from 'twenty-shared/constants';
import { v4 } from 'uuid';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type FrontComponentDiagnostic } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-diagnostic.type';
import { type FrontComponentDraft } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft.type';
import { type FrontComponentDraftInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft-input.type';
import { FrontComponentCompilerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-compiler.service';
import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';
import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { createHash } from 'crypto';
import { text } from 'stream/consumers';

import {
  FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
  getAiFrontComponentSourcePath,
} from 'twenty-shared/application';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { type FrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-query.type';
import { readFrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query.util';

const DRAFT_TTL = 24 * 60 * 60 * 1000;

@Injectable()
export class AiFrontComponentService {
  constructor(
    private readonly featureFlags: FeatureFlagService,
    private readonly applications: ApplicationService,
    private readonly files: FileStorageService,
    private readonly components: FrontComponentService,
    private readonly queryContext: CommonApiContextBuilderService,
    private readonly records: FindRecordsService,
    private readonly compiler: FrontComponentCompilerService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cache: CacheStorageService,
    private readonly locks: CacheLockService,
    private readonly permissions: PermissionsService,
    private readonly sharedDependencies: FrontComponentSharedDependenciesService,
  ) {}

  private isEnabled(workspaceId: string) {
    return this.featureFlags.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
      workspaceId,
    );
  }

  async assertEnabledOrThrow(workspaceId: string) {
    if (!(await this.isEnabled(workspaceId))) {
      throw new ApplicationException(
        doNotTranslate('AI component builder is disabled.'),
        ApplicationExceptionCode.FORBIDDEN,
        { userFriendlyMessage: msg`AI component builder is disabled.` },
      );
    }
  }

  async assertCanAuthorOrThrow({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }) {
    await this.assertEnabledOrThrow(workspaceId);
    if (
      !(await this.permissions.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId,
        setting: PermissionFlagType.APPLICATIONS,
        applicationId: undefined,
        agentId: undefined,
      }))
    ) {
      throw new ApplicationException(
        doNotTranslate('Managing applications is required.'),
        ApplicationExceptionCode.FORBIDDEN,
        { userFriendlyMessage: msg`Managing applications is required.` },
      );
    }
  }

  private draftKey({
    workspaceId,
    draftId,
  }: {
    workspaceId: string;
    draftId: string;
  }) {
    return `ai-front-component:${workspaceId}:${draftId}`;
  }

  private currentKey({
    workspaceId,
    rootId,
  }: {
    workspaceId: string;
    rootId: string;
  }) {
    return `${this.draftKey({ workspaceId, draftId: rootId })}:current`;
  }

  private async saveDraft({
    workspaceId,
    draft,
  }: {
    workspaceId: string;
    draft: FrontComponentDraft;
  }) {
    await this.cache.set(
      this.draftKey({ workspaceId, draftId: draft.id }),
      draft,
      Math.max(1, draft.expiresAt - Date.now()),
    );
  }

  async getDraft({
    workspaceId,
    userWorkspaceId,
    draftId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    draftId: string;
  }) {
    await this.assertCanAuthorOrThrow({ workspaceId, userWorkspaceId });
    const draft = await this.cache.get<FrontComponentDraft>(
      this.draftKey({ workspaceId, draftId }),
    );

    if (
      !isDefined(draft) ||
      draft.expiresAt <= Date.now() ||
      draft.userWorkspaceId !== userWorkspaceId ||
      !isDefined(draft.compiledSource) ||
      !isDefined(draft.entrySource)
    ) {
      throw new ApplicationException(
        doNotTranslate('Component draft not found or expired.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        { userFriendlyMessage: msg`Component draft not found or expired.` },
      );
    }

    return draft;
  }

  private async isCurrent({
    workspaceId,
    draft,
  }: {
    workspaceId: string;
    draft: FrontComponentDraft;
  }) {
    return (
      (await this.cache.get<string>(
        this.currentKey({ workspaceId, rootId: draft.rootId }),
      )) === draft.id
    );
  }

  async createDraft({
    draftInput,
    context,
  }: {
    draftInput: FrontComponentDraftInput;
    context: ToolProviderContext;
  }) {
    const validation = frontComponentDraftSchema.safeParse(draftInput);

    if (!validation.success) {
      throw new ApplicationException(
        doNotTranslate('Invalid component draft input.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Invalid component draft input.` },
      );
    }

    const input = validation.data;

    if (
      !isDefined(context.userWorkspaceId) ||
      !isDefined(context.threadId) ||
      !isDefined(context.authContext)
    ) {
      throw new ApplicationException(
        doNotTranslate('A signed-in chat is required.'),
        ApplicationExceptionCode.FORBIDDEN,
        { userFriendlyMessage: msg`A signed-in chat is required.` },
      );
    }
    await this.assertCanAuthorOrThrow({
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
    });
    await this.validateQueryOrThrow({
      query: input.query,
      authContext: context.authContext,
      rolePermissionConfig: context.rolePermissionConfig,
    });
    if (JSON.stringify(input.sampleRecords).length > 100000) {
      throw new ApplicationException(
        doNotTranslate('Sample records exceed 100 KB.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Sample records exceed 100 KB.` },
      );
    }
    if (
      input.sampleRecords.some((record) =>
        Object.keys(record).some(
          (key) => key !== 'id' && !input.query.select.includes(key),
        ),
      )
    ) {
      throw new ApplicationException(
        doNotTranslate(
          'Sample records must only contain selected fields and id.',
        ),
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Sample records must only contain selected fields and id.`,
        },
      );
    }
    const previous = isDefined(input.previousDraftId)
      ? await this.getDraft({
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
          draftId: input.previousDraftId,
        })
      : undefined;
    const id = v4();
    const rootId = previous?.rootId ?? id;
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: context.workspaceId },
      );
    const built = await this.compiler.build({
      workspaceId: context.workspaceId,
      input: {
        componentId: id,
        name: input.name,
        source: input.source,
        query: input.query,
        pageLayoutType: input.pageLayoutType,
      },
    });

    return this.locks.withLock(
      async () => {
        if (isDefined(previous)) {
          const latestPrevious = await this.getDraft({
            workspaceId: context.workspaceId,
            userWorkspaceId: context.userWorkspaceId!,
            draftId: previous.id,
          });

          if (
            !(await this.isCurrent({
              workspaceId: context.workspaceId,
              draft: latestPrevious,
            })) ||
            latestPrevious.threadId !== context.threadId
          ) {
            throw new ApplicationException(
              doNotTranslate(
                'This draft was superseded or belongs to another chat. Start a new draft.',
              ),
              ApplicationExceptionCode.INVALID_INPUT,
              {
                userFriendlyMessage: msg`This draft was superseded or belongs to another chat. Start a new draft.`,
              },
            );
          }
        }
        const draft: FrontComponentDraft = {
          ...input,
          compiledSource: built.compiledSource,
          checksum: built.checksum,
          dependencyRevision: built.dependencyRevision,
          entrySource: built.source,
          componentName: built.componentName,
          id,
          applicationId: application.id,
          rootId,
          expiresAt: Date.now() + DRAFT_TTL,
          userWorkspaceId: context.userWorkspaceId!,
          threadId: context.threadId!,
        };

        await this.sharedDependencies.saveBuiltSharedDependencies({
          applicationId: application.id,
          workspaceId: context.workspaceId,
          source: built.sharedDependencies.source,
          checksum: built.sharedDependencies.checksum,
        });
        await this.saveDraft({ workspaceId: context.workspaceId, draft });
        await this.cache.set(
          this.currentKey({ workspaceId: context.workspaceId, rootId }),
          id,
          DRAFT_TTL,
        );

        return {
          draftId: id,
          checksum: built.checksum,
          name: input.name,
          sampleRecordCount: input.sampleRecords.length,
        };
      },
      this.currentKey({ workspaceId: context.workspaceId, rootId }),
    );
  }

  async getPreview({
    userWorkspaceId,
    draftId,
    authContext,
  }: {
    userWorkspaceId: string;
    draftId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const workspaceId = authContext.workspace.id;
    const draft = await this.getDraft({
      workspaceId,
      userWorkspaceId,
      draftId,
    });

    return {
      draftId: draft.id,
      name: draft.name,
      isCurrent: await this.isCurrent({ workspaceId, draft }),
      componentSource: draft.compiledSource,
      applicationId: draft.applicationId,
      sharedDependenciesChecksum: readFrontComponentSharedDependenciesChecksum(
        draft.compiledSource,
      ),
      data: {
        records: draft.sampleRecords,
        count: draft.sampleRecords.length,
        hasNextPage: false,
      },
    };
  }

  async recordDiagnostic({
    workspaceId,
    userWorkspaceId,
    draftId,
    diagnostic,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    draftId: string;
    diagnostic: FrontComponentDiagnostic;
  }) {
    const draft = await this.getDraft({
      workspaceId,
      userWorkspaceId,
      draftId,
    });

    await this.locks.withLock(
      async () => {
        const latest = await this.getDraft({
          workspaceId,
          userWorkspaceId,
          draftId,
        });

        await this.saveDraft({ workspaceId, draft: { ...latest, diagnostic } });
      },
      this.currentKey({ workspaceId, rootId: draft.rootId }),
    );
  }

  private async validateQueryOrThrow({
    query,
    authContext,
    rolePermissionConfig,
  }: {
    query: FrontComponentQuery;
    authContext: WorkspaceAuthContext;
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'];
  }) {
    const { selectedFields } = await this.queryContext.build({
      authContext,
      objectName: query.objectName,
      rolePermissionConfig,
    });

    for (const fieldName of query.select) {
      if (!isDefined(selectedFields[fieldName])) {
        throw new ApplicationException(
          doNotTranslate(
            `Field ${query.objectName}.${fieldName} is unavailable. Select accessible top-level fields.`,
          ),
          ApplicationExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`Field ${query.objectName}.${fieldName} is unavailable. Select accessible top-level fields.`,
          },
        );
      }
    }
  }

  private async readRecords({
    query,
    authContext,
    rolePermissionConfig,
  }: {
    query: FrontComponentQuery;
    authContext: WorkspaceAuthContext;
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'];
  }) {
    await this.validateQueryOrThrow({
      query,
      authContext,
      rolePermissionConfig,
    });
    const output = await this.records.execute({
      ...query,
      authContext,
      rolePermissionConfig,
      shouldBuildEffectiveSelectFields: true,
    });

    if (
      !output.success ||
      !isDefined(output.result) ||
      isDefined(output.warnings)
    ) {
      throw new ApplicationException(
        output.error ??
          output.warnings?.join(' ') ??
          doNotTranslate('Unable to read component records.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Unable to read component records.` },
      );
    }

    return { ...output.result, count: Number(output.result.count) };
  }

  async getRecords({
    componentId,
    authContext,
  }: {
    componentId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const workspaceId = authContext.workspace.id;

    await this.assertEnabledOrThrow(workspaceId);
    const component = await this.components.findById(componentId, workspaceId);
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      !isDefined(component) ||
      component.applicationId !== application.id ||
      component.sourceComponentPath !==
        getAiFrontComponentSourcePath(componentId)
    ) {
      throw new ApplicationException(
        doNotTranslate('AI front component not found.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        { userFriendlyMessage: msg`AI front component not found.` },
      );
    }
    const queryFile = await this.files.readFile({
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: component.sourceComponentPath,
    });
    const content = await text(queryFile);
    const query = readFrontComponentQuery(content);

    return this.readRecords({ query, authContext });
  }

  async getRuntime({
    componentId,
    authContext,
  }: {
    componentId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const data = await this.getRecords({ componentId, authContext });
    const component = await this.components.findById(
      componentId,
      authContext.workspace.id,
    );

    if (
      !isDefined(component) ||
      component.sourceComponentPath !==
        getAiFrontComponentSourcePath(componentId)
    ) {
      throw new ApplicationException(
        doNotTranslate('Recreate this component with the current builder.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        {
          userFriendlyMessage: msg`Recreate this component with the current builder.`,
        },
      );
    }
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: authContext.workspace.id },
      );
    const componentSource = await text(
      await this.files.readFile({
        workspaceId: authContext.workspace.id,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.BuiltFrontComponent,
        resourcePath: component.builtComponentPath,
      }),
    );

    if (
      createHash('sha256').update(componentSource).digest('hex') !==
      component.builtComponentChecksum
    ) {
      throw new ApplicationException(
        doNotTranslate('Component source checksum mismatch.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`Component source checksum mismatch.` },
      );
    }

    let sharedDependenciesChecksum =
      readFrontComponentSharedDependenciesChecksum(componentSource);

    if (
      componentSource.includes(
        FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
      ) &&
      !isDefined(sharedDependenciesChecksum)
    ) {
      const applicationDependencies =
        await this.applications.findOneApplicationWithRelationsOrThrow({
          id: application.id,
          workspaceId: authContext.workspace.id,
        });

      if (
        !isDefined(
          applicationDependencies.frontComponentSharedDependenciesBuiltPath,
        ) ||
        !isDefined(
          applicationDependencies.frontComponentSharedDependenciesChecksum,
        )
      ) {
        throw new ApplicationException(
          doNotTranslate('Component shared dependencies are missing.'),
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Component shared dependencies are missing.`,
          },
        );
      }
      sharedDependenciesChecksum =
        applicationDependencies.frontComponentSharedDependenciesChecksum;
    }

    return {
      applicationId: application.id,
      componentSource,
      sharedDependenciesChecksum,
      data,
    };
  }
}
