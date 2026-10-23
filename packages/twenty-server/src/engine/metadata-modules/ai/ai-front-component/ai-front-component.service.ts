import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';
import { frontComponentDraftIdSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft-id.schema';
import { FRONT_COMPONENT_UI_INSTRUCTIONS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-ui-instructions.constant';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/extract-checksum-from-cache-key.util';
import { getFrontComponentSharedDependenciesPath } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies-path.util';
import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
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
import { FeatureFlagKey, FileFolder, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
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
import { type FrontComponentDiagnostic } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-diagnostic.type';
import { type FrontComponentDraft } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft.type';
import { type FrontComponentDraftInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft-input.type';
import { type FrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-query.type';
import { readFrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query.util';
import { FrontComponentCompilerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-compiler.service';

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
    private readonly compiler: FrontComponentCompilerService,
    private readonly workspaceDependencies: WorkspaceFrontComponentDependenciesService,
  ) {}

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    if (
      !isDefined(context.userWorkspaceId) ||
      !(await this.isEnabled(context.workspaceId))
    ) {
      return {};
    }
    if (
      !(await this.permissions.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.APPLICATIONS,
      ))
    ) {
      return {};
    }

    return {
      list_front_components: tool({
        description:
          'List registered frontend components and their widget availability. Use an existing component ID when the user asks to add it to a dashboard or page layout; creating a component and placing it are separate actions.',
        inputSchema: z.object({}),
        execute: async () => ({
          success: true,
          result: (await this.components.findAll(context.workspaceId)).map(
            ({ id, name, applicationId, isHeadless, widgetAvailability }) => ({
              id,
              name,
              applicationId,
              isHeadless,
              widgetAvailability,
            }),
          ),
        }),
      }),
      preview_front_component: tool({
        description:
          'Create or revise a reusable frontend component preview with SAMPLE data. First inspect accessible object fields. No dashboard, page layout or placement is needed. Choose exactly one pageLayoutType, DASHBOARD or RECORD_PAGE, from the request or context; clarify only if ambiguous. source must export a named Component function or const, with no default export, receiving {records, count, hasNextPage}. Import React or hooks explicitly from react; React is not a global. Use twenty-ui components and local state. query selects top-level CRM fields and at most 100 records; show when hasNextPage is true so partial data is not mistaken for a complete summary; sampleRecords must match that schema. Never hardcode sample records in source. Pass previousDraftId to revise the current draft. Nothing is published. Inspect runtime diagnostics with inspect_front_component after the browser renders. To save the exact draft in the Workspace custom application, use propose_tool_call for publish_front_component, never invoke publication directly.' +
          FRONT_COMPONENT_UI_INSTRUCTIONS,
        inputSchema: frontComponentDraftSchema,
        execute: async (input) => ({
          success: true,
          message:
            'Sample preview built. Await browser rendering before approval.',
          result: await this.createDraft(input, context),
        }),
      }),
      inspect_front_component: tool({
        description:
          'Read a component draft source, sample data, current revision and browser runtime diagnostics. Use this to repair failed previews and revise a draft. Drafts expire after 24 hours.',
        inputSchema: frontComponentDraftIdSchema,
        execute: async ({ draftId }) => {
          const draft = await this.getDraft(
            context.workspaceId,
            context.userWorkspaceId!,
            draftId,
          );
          const {
            compiledSource: _compiledSource,
            entrySource: _entrySource,
            ...result
          } = draft;

          return {
            success: true,
            message: 'Component draft retrieved.',
            result: {
              ...result,
              isCurrent: await this.isCurrent(context.workspaceId, draft),
            },
          };
        },
      }),
      publish_front_component: tool({
        description:
          'Save the exact approved frontend component in the Workspace custom application. Makes it available in the widget picker for its selected surface, without creating or changing any page layout. Requires propose_tool_call and explicit human approval. The revision is immutable. Saved components read live records with each viewer permissions; sample records are never saved to the CRM.',
        inputSchema: frontComponentDraftIdSchema,
        execute: async ({ draftId }) => ({
          success: true,
          message:
            'Component saved to the Workspace app. It can now be selected in the widget picker for its selected surface.',
          result: await this.publish(draftId, context),
        }),
      }),
    };
  }

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

  private sharedDependenciesKey(checksum: string) {
    return `ai-front-component-shared-dependencies:${checksum}`;
  }

  private async getDraftSharedDependencies(draft: FrontComponentDraft) {
    const checksum = readFrontComponentSharedDependenciesChecksum(
      draft.compiledSource,
    );

    if (!isDefined(checksum)) {
      return undefined;
    }
    const source = await this.cache.get<string>(
      this.sharedDependenciesKey(checksum),
    );

    if (
      !isDefined(source) ||
      createHash('sha256').update(source).digest('hex') !== checksum
    ) {
      throw new NotFoundException(
        doNotTranslate(
          'Component draft dependencies are missing or expired. Create a new preview.',
        ),
      );
    }

    return source;
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
          dependencyRevision: built.dependencyRevision,
          entrySource: built.source,
          componentName: built.componentName,
          id,
          rootId,
          expiresAt: Date.now() + DRAFT_TTL,
          userWorkspaceId: context.userWorkspaceId!,
          threadId: context.threadId!,
        };

        await this.cache.set(
          this.sharedDependenciesKey(built.sharedDependencies.checksum),
          built.sharedDependencies.source,
          DRAFT_TTL,
        );
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
      pageLayoutType: draft.pageLayoutType,
      isCurrent: await this.isCurrent(workspaceId, draft),
      published: isDefined(draft.publishedComponentId),
      componentSource: draft.compiledSource,
      sharedDependenciesSource: await this.getDraftSharedDependencies(draft),
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
    const sharedDependenciesChecksum =
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
        )
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
            applicationDependencies.frontComponentSharedDependenciesBuiltPath,
        }),
      );
      if (
        createHash('sha256').update(sharedDependenciesSource).digest('hex') !==
        applicationDependencies.frontComponentSharedDependenciesChecksum
      ) {
        throw new BadRequestException(
          doNotTranslate('Component shared dependencies checksum mismatch.'),
        );
      }
    }

    return {
      componentSource,
      sharedDependenciesSource,
      sharedDependenciesChecksum,
      data,
    };
  }

  async getSharedDependencies(
    cacheKey: string,
    authContext: WorkspaceAuthContext,
  ) {
    const workspaceId = authContext.workspace.id;
    await this.assertEnabled(workspaceId);
    const checksum = extractChecksumFromCacheKey(cacheKey);

    if (!isDefined(checksum)) {
      throw new BadRequestException(
        doNotTranslate('Invalid component shared dependencies checksum.'),
      );
    }
    const { workspaceCustomFlatApplication: application } =
      await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const source = await text(
      await this.files.readFile({
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.BuiltFrontComponent,
        resourcePath: getFrontComponentSharedDependenciesPath(checksum),
      }),
    );

    if (createHash('sha256').update(source).digest('hex') !== checksum) {
      throw new BadRequestException(
        doNotTranslate('Component shared dependencies checksum mismatch.'),
      );
    }

    return source;
  }
  async publish(draftId: string, context: ToolProviderContext) {
    if (
      context.approvedToolName !== 'publish_front_component' ||
      !isDefined(context.userWorkspaceId) ||
      !isDefined(context.authContext)
    ) {
      throw new ForbiddenException(
        doNotTranslate('Use propose_tool_call and wait for human approval.'),
      );
    }
    const { workspaceId, userWorkspaceId, authContext } = context;
    const draft = await this.getDraft(workspaceId, userWorkspaceId, draftId);

    if (draft.threadId !== context.threadId) {
      throw new ForbiddenException(
        doNotTranslate('Approve this draft in its original chat.'),
      );
    }

    return this.locks.withLock(
      async () => {
        const current = await this.getDraft(
          workspaceId,
          userWorkspaceId,
          draftId,
        );

        if (!(await this.isCurrent(workspaceId, current))) {
          throw new BadRequestException(
            doNotTranslate(
              'This preview has been superseded. Approve the latest revision.',
            ),
          );
        }
        if (current.diagnostic?.status !== 'ready') {
          throw new BadRequestException(
            doNotTranslate(
              'Open a working preview before saving. Repair any runtime errors first.',
            ),
          );
        }
        const { workspaceCustomFlatApplication: application } =
          await this.applications.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
            { workspaceId },
          );
        const checksum = current.checksum;
        const sourceComponentPath = `src/ai-front-components/${draftId}.front-component.tsx`;
        const builtComponentPath = `src/ai-front-components/${draftId}.mjs`;
        const { flatFrontComponentMaps } =
          await this.flatMaps.getOrRecomputeManyOrAllFlatEntityMaps({
            workspaceId,
            flatMapsKeys: ['flatFrontComponentMaps'],
          });
        const existing = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: draftId,
          flatEntityMaps: flatFrontComponentMaps,
        });

        if (
          isDefined(existing) &&
          (existing.applicationId !== application.id ||
            existing.builtComponentChecksum !== checksum)
        ) {
          throw new BadRequestException(
            doNotTranslate('Published component differs from this draft.'),
          );
        }
        if (!isDefined(existing) && !isDefined(current.publishedComponentId)) {
          const dependencies =
            await this.workspaceDependencies.readOrThrow(workspaceId);

          if (current.dependencyRevision !== dependencies.revision) {
            throw new BadRequestException(
              doNotTranslate(
                'Workspace app dependencies changed. Create and approve a new preview.',
              ),
            );
          }
        }
        await this.readRecords(
          current.query,
          authContext,
          context.rolePermissionConfig,
        );
        await this.saveDraft(workspaceId, {
          ...current,
          publicationStarted: true,
        });
        if (!isDefined(existing)) {
          if (isDefined(current.publishedComponentId)) {
            throw new BadRequestException(
              doNotTranslate(
                'This published component was deleted. Create a new preview to save it again.',
              ),
            );
          }
          const files = [
            {
              path: sourceComponentPath,
              content: current.entrySource,
              folder: FileFolder.Source,
            },
            {
              path: builtComponentPath,
              content: current.compiledSource,
              folder: FileFolder.BuiltFrontComponent,
            },
          ];
          try {
            const sharedDependenciesSource =
              await this.getDraftSharedDependencies(current);
            const sharedDependenciesChecksum =
              readFrontComponentSharedDependenciesChecksum(
                current.compiledSource,
              );

            if (
              isDefined(sharedDependenciesSource) &&
              isDefined(sharedDependenciesChecksum)
            ) {
              await this.files.writeFile({
                workspaceId,
                applicationUniversalIdentifier: application.universalIdentifier,
                applicationId: application.id,
                resourcePath: getFrontComponentSharedDependenciesPath(
                  sharedDependenciesChecksum,
                ),
                fileFolder: FileFolder.BuiltFrontComponent,
                sourceFile: sharedDependenciesSource,
                settings: { isTemporaryFile: false, toDelete: false },
              });
            }

            for (const file of files) {
              await this.files.writeFile({
                workspaceId,
                applicationUniversalIdentifier: application.universalIdentifier,
                applicationId: application.id,
                resourcePath: file.path,
                fileFolder: file.folder,
                sourceFile: file.content,
                settings: { isTemporaryFile: false, toDelete: false },
              });
            }
            await this.components.createOne({
              workspaceId,
              input: {
                id: draftId,
                universalIdentifier: draftId,
                name: current.name,
                componentName: current.componentName,
                universalWidgetAvailability: [
                  { pageLayoutType: current.pageLayoutType },
                ],
                sourceComponentPath,
                builtComponentPath,
                builtComponentChecksum: checksum,
              },
            });
          } catch (error) {
            const registered = await this.componentRepository.existsBy(
              workspaceId,
              { id: draftId },
            );
            if (!registered) {
              for (const file of files) {
                await this.files.deleteFile({
                  workspaceId,
                  applicationUniversalIdentifier:
                    application.universalIdentifier,
                  applicationId: application.id,
                  resourcePath: file.path,
                  fileFolder: file.folder,
                });
              }
              await this.saveDraft(workspaceId, {
                ...current,
                publicationStarted: false,
              });
            }
            throw error;
          }
        }
        await this.saveDraft(workspaceId, {
          ...current,
          publicationStarted: true,
          publishedComponentId: draftId,
        });

        return {
          frontComponentId: draftId,
          applicationId: application.id,
          applicationPath: getSettingsPath(SettingsPath.ApplicationDetail, {
            applicationId: application.id,
          }),
        };
      },
      this.currentKey(workspaceId, draft.rootId),
    );
  }
}
