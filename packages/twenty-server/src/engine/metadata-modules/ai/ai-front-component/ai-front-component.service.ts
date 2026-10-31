import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { validateFrontComponentSampleRecordsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-sample-records-or-throw.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import { v4 } from 'uuid';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
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

import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type FrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-query.type';

const DRAFT_TIME_TO_LIVE_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Injectable()
export class AiFrontComponentService {
  constructor(
    private readonly featureFlags: FeatureFlagService,
    private readonly applications: ApplicationService,
    private readonly queryContext: CommonApiContextBuilderService,
    private readonly compiler: FrontComponentCompilerService,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
    private readonly permissions: PermissionsService,
    private readonly fileStorageService: FileStorageService,
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

  private async withDraftLock<TResult>({
    workspaceId,
    draftId,
    callback,
  }: {
    workspaceId: string;
    draftId: string;
    callback: () => Promise<TResult>;
  }): Promise<TResult> {
    const result = await this.postgresAdvisoryLockService.tryWithLock(
      `ai-front-component-draft:${workspaceId}:${draftId}`,
      callback,
    );

    if (!result.acquired) {
      throw new ApplicationException(
        doNotTranslate('This draft is being updated. Try again.'),
        ApplicationExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: msg`This draft is being updated. Try again.` },
      );
    }

    return result.value;
  }

  private async saveDraft({
    workspaceId,
    draft,
  }: {
    workspaceId: string;
    draft: FrontComponentDraft;
  }) {
    const application =
      await this.applications.findOneApplicationWithRelationsOrThrow({
        id: draft.applicationId,
        workspaceId,
      });

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      applicationId: draft.applicationId,
      fileFolder: FileFolder.AgentChat,
      resourcePath: `front-component-drafts/${draft.id}.json`,
      fileId: draft.id,
      sourceFile: JSON.stringify(draft),
      settings: {
        isTemporaryFile: true,
        toDelete: false,
        expiresAt: new Date(draft.expiresAt).toISOString(),
      },
    });
  }

  async getDraftOrThrow({
    workspaceId,
    userWorkspaceId,
    draftId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    draftId: string;
  }): Promise<FrontComponentDraft> {
    return this.withDraftLock({
      workspaceId,
      draftId,
      callback: () =>
        this.readDraftOrThrow({ workspaceId, userWorkspaceId, draftId }),
    });
  }

  private async readDraftOrThrow({
    workspaceId,
    userWorkspaceId,
    draftId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    draftId: string;
  }): Promise<FrontComponentDraft> {
    await this.assertCanAuthorOrThrow({ workspaceId, userWorkspaceId });
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    let draft: FrontComponentDraft | undefined;

    try {
      const stream = await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.AgentChat,
        resourcePath: `front-component-drafts/${draftId}.json`,
      });
      draft = JSON.parse((await streamToBuffer(stream)).toString());
    } catch (error) {
      if (error.code !== FileStorageExceptionCode.FILE_NOT_FOUND) {
        throw error;
      }
    }

    if (
      !isDefined(draft) ||
      draft.expiresAt <= Date.now() ||
      draft.userWorkspaceId !== userWorkspaceId
    ) {
      throw new ApplicationException(
        doNotTranslate('Component draft not found or expired.'),
        ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        { userFriendlyMessage: msg`Component draft not found or expired.` },
      );
    }

    return draft;
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
    const objectNamePlural = await this.getQueryObjectNamePluralOrThrow({
      query: input.query,
      authContext: context.authContext,
      rolePermissionConfig: context.rolePermissionConfig,
    });
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: input.sampleRecords,
      selectedFields: input.query.select,
    });
    let previous = isDefined(input.previousDraftId)
      ? await this.getDraftOrThrow({
          workspaceId: context.workspaceId,
          userWorkspaceId,
          draftId: input.previousDraftId,
        })
      : undefined;
    const id = v4();
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
        pageLayoutType: input.pageLayoutType,
      },
    });

    const saveRevision = async () => {
      if (isDefined(previous)) {
        previous = await this.readDraftOrThrow({
          workspaceId: context.workspaceId,
          userWorkspaceId,
          draftId: previous.id,
        });

        if (previous.isSuperseded || previous.threadId !== threadId) {
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
        hasSdkClientImport: built.hasSdkClientImport,
        objectNamePlural,
        id,
        applicationId: application.id,
        expiresAt: Date.now() + DRAFT_TIME_TO_LIVE_IN_MILLISECONDS,
        userWorkspaceId,
        threadId,
      };

      await this.saveDraft({ workspaceId: context.workspaceId, draft });
      if (isDefined(previous)) {
        await this.saveDraft({
          workspaceId: context.workspaceId,
          draft: { ...previous, isSuperseded: true },
        });
      }

      return {
        draftId: id,
        checksum: built.checksum,
        name: input.name,
        sampleRecordCount: input.sampleRecords.length,
      };
    };

    return isDefined(previous)
      ? this.withDraftLock({
          workspaceId: context.workspaceId,
          draftId: previous.id,
          callback: saveRevision,
        })
      : saveRevision();
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
    const draft = await this.getDraftOrThrow({
      workspaceId,
      userWorkspaceId,
      draftId,
    });

    const application =
      await this.applications.findOneApplicationWithRelationsOrThrow({
        id: draft.applicationId,
        workspaceId,
      });

    return {
      draftId: draft.id,
      name: draft.name,
      isCurrent: !draft.isSuperseded,
      componentSource: draft.compiledSource,
      applicationId: draft.applicationId,
      sharedDependenciesChecksum:
        application.frontComponentSharedDependenciesChecksum,
      mockQueryResult: {
        [draft.objectNamePlural]: {
          edges: draft.sampleRecords.map((node) => ({ node })),
          totalCount: draft.sampleRecords.length,
          pageInfo: { hasNextPage: false },
        },
      },
    };
  }

  async reportPreviewError({
    workspaceId,
    userWorkspaceId,
    draftId,
    previewError,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    draftId: string;
    previewError: string;
  }) {
    await this.withDraftLock({
      workspaceId,
      draftId,
      callback: async () => {
        const draft = await this.readDraftOrThrow({
          workspaceId,
          userWorkspaceId,
          draftId,
        });

        await this.saveDraft({
          workspaceId,
          draft: { ...draft, previewError },
        });
      },
    });
  }

  private async getQueryObjectNamePluralOrThrow({
    query,
    authContext,
    rolePermissionConfig,
  }: {
    query: FrontComponentQuery;
    authContext: WorkspaceAuthContext;
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'];
  }) {
    const { selectedFields, flatObjectMetadata } =
      await this.queryContext.build({
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

    return flatObjectMetadata.namePlural;
  }
}
