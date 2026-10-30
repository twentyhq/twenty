import { validateFrontComponentSampleRecordsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-sample-records-or-throw.util';
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
import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { text } from 'stream/consumers';

import { readFrontComponentSharedDependenciesChecksum } from 'twenty-shared/application';
import { isAiFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/is-ai-front-component.util';
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
import { readFrontComponentQueryOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query-or-throw.util';

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
    context: Pick<
      ToolProviderContext,
      | 'workspaceId'
      | 'userWorkspaceId'
      | 'threadId'
      | 'authContext'
      | 'rolePermissionConfig'
    >;
  }) {
    const { userWorkspaceId, threadId } = context;
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
      !isDefined(userWorkspaceId) ||
      !isDefined(threadId) ||
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
      userWorkspaceId,
    });
    await this.validateQueryOrThrow({
      query: input.query,
      authContext: context.authContext,
      rolePermissionConfig: context.rolePermissionConfig,
    });
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: input.sampleRecords,
      selectedFields: input.query.select,
    });
    const previous = isDefined(input.previousDraftId)
      ? await this.getDraft({
          workspaceId: context.workspaceId,
          userWorkspaceId,
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
            userWorkspaceId,
            draftId: previous.id,
          });

          if (
            !(await this.isCurrent({
              workspaceId: context.workspaceId,
              draft: latestPrevious,
            })) ||
            latestPrevious.threadId !== threadId
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
          userWorkspaceId,
          threadId,
        };

        await this.sharedDependencies.saveBuiltSharedDependenciesOrThrow({
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

  async getRuntime({
    componentId,
    authContext,
  }: {
    componentId: string;
    authContext: WorkspaceAuthContext;
  }) {
    const workspaceId = authContext.workspace.id;

    await this.assertEnabledOrThrow(workspaceId);
    const component = await this.components.findById(componentId, workspaceId);
    const { workspaceCustomFlatApplication } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      !isDefined(component) ||
      component.applicationId !== workspaceCustomFlatApplication.id ||
      !isAiFrontComponent(component)
    ) {
      throw new ApplicationException(
        doNotTranslate('AI front component not found.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        { userFriendlyMessage: msg`AI front component not found.` },
      );
    }
    const queryFile = await this.files.readFile({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: component.sourceComponentPath,
    });
    const content = await text(queryFile);
    const query = readFrontComponentQueryOrThrow(content);

    const data = await this.readRecords({ query, authContext });
    const application =
      await this.applications.findOneApplicationWithRelationsOrThrow({
        id: component.applicationId,
        workspaceId: authContext.workspace.id,
      });

    return {
      applicationId: application.id,
      builtComponentChecksum: component.builtComponentChecksum,
      sharedDependenciesChecksum:
        application.frontComponentSharedDependenciesChecksum,
      data,
    };
  }
}
