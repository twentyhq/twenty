import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { text } from 'stream/consumers';

import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { doNotTranslate } from 'twenty-shared/i18n';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import {
  type FrontComponentDiagnostic,
  type FrontComponentDraft,
  type FrontComponentDraftInput,
  type FrontComponentQuery,
} from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.schemas';
import { AiFrontComponentBuildService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component-build.service';
import { readFrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/read-front-component-query.util';

const DRAFT_TTL = 24 * 60 * 60 * 1000;

@Injectable()
export class AiFrontComponentService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cache: CacheStorageService,
    private readonly locks: CacheLockService,
    private readonly featureFlags: FeatureFlagService,
    private readonly permissions: PermissionsService,
    private readonly applications: ApplicationService,
    private readonly files: FileStorageService,
    private readonly components: FrontComponentService,
    private readonly flatMaps: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly queryContext: CommonApiContextBuilderService,
    private readonly records: FindRecordsService,
    @InjectWorkspaceScopedRepository(FrontComponentEntity)
    private readonly componentRepository: WorkspaceScopedRepository<FrontComponentEntity>,
    private readonly builder: AiFrontComponentBuildService,
  ) {}

  private isEnabled(workspaceId: string) {
    return this.featureFlags.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
      workspaceId,
    );
  }

  async assertEnabled(workspaceId: string) {
    if (!(await this.isEnabled(workspaceId))) {
      throw new ForbiddenException(
        doNotTranslate('AI component builder is disabled.'),
      );
    }
  }

  async assertCanAuthor(workspaceId: string, userWorkspaceId: string) {
    await this.assertEnabled(workspaceId);
    if (
      !(await this.permissions.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId,
        setting: PermissionFlagType.APPLICATIONS,
        applicationId: undefined,
        agentId: undefined,
      }))
    ) {
      throw new ForbiddenException(
        doNotTranslate('Managing applications is required.'),
      );
    }
  }

  private draftKey(workspaceId: string, draftId: string) {
    return `ai-front-component:${workspaceId}:${draftId}`;
  }

  private currentKey(workspaceId: string, rootId: string) {
    return `${this.draftKey(workspaceId, rootId)}:current`;
  }

  private async saveDraft(workspaceId: string, draft: FrontComponentDraft) {
    await this.cache.set(
      this.draftKey(workspaceId, draft.id),
      draft,
      Math.max(1, draft.expiresAt - Date.now()),
    );
  }

  async getDraft(
    workspaceId: string,
    userWorkspaceId: string,
    draftId: string,
  ) {
    await this.assertCanAuthor(workspaceId, userWorkspaceId);
    const draft = await this.cache.get<FrontComponentDraft>(
      this.draftKey(workspaceId, draftId),
    );

    if (
      !isDefined(draft) ||
      draft.expiresAt <= Date.now() ||
      draft.userWorkspaceId !== userWorkspaceId ||
      !isDefined(draft.compiledSource) ||
      !isDefined(draft.entrySource)
    ) {
      throw new NotFoundException(
        doNotTranslate('Component draft not found or expired.'),
      );
    }

    return draft;
  }

  private async isCurrent(workspaceId: string, draft: FrontComponentDraft) {
    return (
      (await this.cache.get<string>(
        this.currentKey(workspaceId, draft.rootId),
      )) === draft.id
    );
  }

  private async validateQuery(
    query: FrontComponentQuery,
    authContext: WorkspaceAuthContext,
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'],
  ) {
    const { selectedFields } = await this.queryContext.build({
      authContext,
      objectName: query.objectName,
      rolePermissionConfig,
    });

    for (const fieldName of query.select) {
      if (!isDefined(selectedFields[fieldName])) {
        throw new ForbiddenException(
          doNotTranslate(
            `Field ${query.objectName}.${fieldName} is unavailable. Select accessible top-level fields.`,
          ),
        );
      }
    }
  }

  async createDraft(
    input: FrontComponentDraftInput,
    context: ToolProviderContext,
  ) {
    if (
      !isDefined(context.userWorkspaceId) ||
      !isDefined(context.threadId) ||
      !isDefined(context.authContext)
    ) {
      throw new ForbiddenException(
        doNotTranslate('A signed-in chat is required.'),
      );
    }
    await this.assertCanAuthor(context.workspaceId, context.userWorkspaceId);
    await this.validateQuery(
      input.query,
      context.authContext,
      context.rolePermissionConfig,
    );
    if (JSON.stringify(input.sampleRecords).length > 100000) {
      throw new BadRequestException(
        doNotTranslate('Sample records exceed 100 KB.'),
      );
    }
    if (
      input.sampleRecords.some((record) =>
        Object.keys(record).some(
          (key) => key !== 'id' && !input.query.select.includes(key),
        ),
      )
    ) {
      throw new BadRequestException(
        doNotTranslate(
          'Sample records must only contain selected fields and id.',
        ),
      );
    }
    const previous = isDefined(input.previousDraftId)
      ? await this.getDraft(
          context.workspaceId,
          context.userWorkspaceId,
          input.previousDraftId,
        )
      : undefined;
    const id = v4();
    const rootId = previous?.rootId ?? id;
    const built = await this.builder.build({
      workspaceId: context.workspaceId,
      componentId: id,
      input,
    });

    return this.locks.withLock(
      async () => {
        if (isDefined(previous)) {
          const latestPrevious = await this.getDraft(
            context.workspaceId,
            context.userWorkspaceId!,
            previous.id,
          );

          if (
            !(await this.isCurrent(context.workspaceId, latestPrevious)) ||
            latestPrevious.publicationStarted ||
            latestPrevious.threadId !== context.threadId
          ) {
            throw new BadRequestException(
              doNotTranslate(
                'This draft was superseded or published. Start a new draft.',
              ),
            );
          }
        }
        const draft: FrontComponentDraft = {
          ...input,
          compiledSource: built.compiledSource,
          checksum: built.checksum,
          entrySource: built.source,
          componentName: built.componentName,
          id,
          rootId,
          expiresAt: Date.now() + DRAFT_TTL,
          userWorkspaceId: context.userWorkspaceId!,
          threadId: context.threadId!,
        };

        await this.saveDraft(context.workspaceId, draft);
        await this.cache.set(
          this.currentKey(context.workspaceId, rootId),
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
      this.currentKey(context.workspaceId, rootId),
    );
  }

  async getPreview(
    userWorkspaceId: string,
    draftId: string,
    authContext: WorkspaceAuthContext,
  ) {
    const workspaceId = authContext.workspace.id;
    const draft = await this.getDraft(workspaceId, userWorkspaceId, draftId);

    return {
      draftId: draft.id,
      name: draft.name,
      isCurrent: await this.isCurrent(workspaceId, draft),
      published: isDefined(draft.publishedComponentId),
      componentSource: draft.compiledSource,
      data: {
        records: draft.sampleRecords,
        count: draft.sampleRecords.length,
        hasNextPage: false,
      },
    };
  }

  async recordDiagnostic(
    workspaceId: string,
    userWorkspaceId: string,
    draftId: string,
    diagnostic: FrontComponentDiagnostic,
  ) {
    const draft = await this.getDraft(workspaceId, userWorkspaceId, draftId);

    await this.locks.withLock(
      async () => {
        const latest = await this.getDraft(
          workspaceId,
          userWorkspaceId,
          draftId,
        );

        await this.saveDraft(workspaceId, { ...latest, diagnostic });
      },
      this.currentKey(workspaceId, draft.rootId),
    );
  }

  private async readRecords(
    query: FrontComponentQuery,
    authContext: WorkspaceAuthContext,
    rolePermissionConfig?: ToolProviderContext['rolePermissionConfig'],
  ) {
    await this.validateQuery(query, authContext, rolePermissionConfig);
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
      throw new BadRequestException(
        output.error ??
          output.warnings?.join(' ') ??
          doNotTranslate('Unable to read component records.'),
      );
    }

    return { ...output.result, count: Number(output.result.count) };
  }

  async getRecords(componentId: string, authContext: WorkspaceAuthContext) {
    const workspaceId = authContext.workspace.id;

    await this.assertEnabled(workspaceId);
    const component = await this.components.findById(componentId, workspaceId);
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      !isDefined(component) ||
      component.applicationId !== application.id ||
      component.sourceComponentPath !==
        `src/ai-front-components/${componentId}.front-component.tsx`
    ) {
      throw new NotFoundException(
        doNotTranslate('AI front component not found.'),
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

    return this.readRecords(query, authContext);
  }

  async getRuntime(componentId: string, authContext: WorkspaceAuthContext) {
    const data = await this.getRecords(componentId, authContext);
    const component = await this.components.findById(
      componentId,
      authContext.workspace.id,
    );

    if (
      !isDefined(component) ||
      component.sourceComponentPath !==
        `src/ai-front-components/${componentId}.front-component.tsx`
    ) {
      throw new NotFoundException(
        doNotTranslate('Recreate this component with the current builder.'),
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
      throw new BadRequestException(
        doNotTranslate('Component source checksum mismatch.'),
      );
    }

    let sharedDependenciesSource: string | undefined;

    if (
      componentSource.includes(
        FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
      )
    ) {
      const fullApplication =
        await this.applications.findOneApplicationWithRelationsOrThrow({
          id: application.id,
          workspaceId: authContext.workspace.id,
        });
      if (
        !isDefined(fullApplication.frontComponentSharedDependenciesBuiltPath)
      ) {
        throw new BadRequestException(
          doNotTranslate('Component shared dependencies are missing.'),
        );
      }
      sharedDependenciesSource = await text(
        await this.files.readFile({
          workspaceId: authContext.workspace.id,
          applicationUniversalIdentifier: application.universalIdentifier,
          fileFolder: FileFolder.BuiltFrontComponent,
          resourcePath:
            fullApplication.frontComponentSharedDependenciesBuiltPath,
        }),
      );
      if (
        createHash('sha256').update(sharedDependenciesSource).digest('hex') !==
        fullApplication.frontComponentSharedDependenciesChecksum
      ) {
        throw new BadRequestException(
          doNotTranslate('Component shared dependencies checksum mismatch.'),
        );
      }
    }

    return { componentSource, sharedDependenciesSource, data };
  }
}
