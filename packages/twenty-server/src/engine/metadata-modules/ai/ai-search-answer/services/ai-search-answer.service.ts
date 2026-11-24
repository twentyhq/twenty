import { Injectable, Logger } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import {
  generateText,
  type LanguageModelUsage,
  NoObjectGeneratedError,
  Output,
} from 'ai';
import { type AiDataPolicy, type ToolRecordReference } from 'twenty-shared/ai';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  type CommonApiContext,
  CommonApiContextBuilderService,
} from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { buildUsageSpendersFromAuthContext } from 'src/engine/core-modules/usage/utils/build-usage-spenders-from-auth-context.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceAiDataPolicyService } from 'src/engine/metadata-modules/ai/ai-models/services/workspace-ai-data-policy.service';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import { AI_SEARCH_ANSWER_CACHE_TTL_MS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-cache-ttl-ms.constant';
import { AI_SEARCH_ANSWER_MAX_EVIDENCE_CHARACTERS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-evidence-characters.constant';
import { AI_SEARCH_ANSWER_MAX_OUTPUT_TOKENS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-output-tokens.constant';
import { AI_SEARCH_ANSWER_MODEL_IDS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-model-ids.constant';
import { AI_SEARCH_ANSWER_SEARCH_SESSION_TTL_MS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-search-session-ttl-ms.constant';
import { AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-storage-key-prefix.constant';
import { AI_SEARCH_ANSWER_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-system-prompt.constant';
import { AI_SEARCH_ANSWER_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-timeout-ms.constant';
import { type AiSearchAnswerAskAiHandoffInput } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-ask-ai-handoff-input.schema';
import { type AiSearchAnswerInput } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-input.schema';
import { aiSearchAnswerModelOutputSchema } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-model-output.schema';
import { type AiSearchAnswerEvidenceRecord } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-evidence-record.type';
import { type AiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-response.type';
import { buildAiSearchAnswerAutomaticAllowanceBuckets } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-automatic-allowance-buckets.util';
import { buildAiSearchAnswerCacheKey } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-cache-key.util';
import { buildAiSearchAnswerEvidence } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-evidence.util';
import { buildAiSearchAnswerEvidenceRecord } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-evidence-record.util';
import { buildAiSearchAnswerPrompt } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-prompt.util';
import { buildAiSearchAnswerProviderOptions } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-provider-options.util';
import { createAiSearchAnswerInFlightRequests } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/create-ai-search-answer-in-flight-requests.util';
import { getAiSearchAnswerSessionCallIndexLabel } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/get-ai-search-answer-session-call-index-label.util';
import { resolveAiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/resolve-ai-search-answer-response.util';
import { selectAiSearchAnswerEvidenceFields } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/select-ai-search-answer-evidence-fields.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type AiSearchAnswerGenerationOutcome =
  | 'answer'
  | 'handoff'
  | 'aborted'
  | 'failed';

@Injectable()
export class AiSearchAnswerService {
  private readonly logger = new Logger(AiSearchAnswerService.name);
  private readonly inFlightAnswers =
    createAiSearchAnswerInFlightRequests<AiSearchAnswerResponse>();

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly workspaceAiDataPolicyService: WorkspaceAiDataPolicyService,
    private readonly commonApiContextBuilderService: CommonApiContextBuilderService,
    private readonly findRecordsService: FindRecordsService,
    private readonly throttlerService: ThrottlerService,
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async answer({
    input,
    workspace,
    userWorkspaceId,
    authContext,
    clientSignal,
  }: {
    input: AiSearchAnswerInput;
    workspace: WorkspaceEntity;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
    clientSignal: AbortSignal;
  }): Promise<AiSearchAnswerResponse> {
    const aiDataPolicy =
      await this.workspaceAiDataPolicyService.getEffectiveAiDataPolicy(
        workspace,
      );

    const registeredModel = this.resolveSearchAnswerModel(aiDataPolicy);

    const evidenceRecords = await this.collectEvidenceRecords({
      candidates: input.candidates,
      authContext,
    });

    const { serializedEvidence, sourcesByReference } =
      buildAiSearchAnswerEvidence({
        evidenceRecords,
        maxCharacters: AI_SEARCH_ANSWER_MAX_EVIDENCE_CHARACTERS,
      });

    if (sourcesByReference.size === 0) {
      this.recordRequest({ trigger: input.trigger, outcome: 'no-evidence' });

      return { kind: 'handoff' };
    }

    const cacheKey = buildAiSearchAnswerCacheKey({
      workspaceId: workspace.id,
      userWorkspaceId,
      question: input.question,
      searchScope: input.searchScope,
      serializedEvidence,
      modelId: registeredModel.modelId,
      systemPrompt: AI_SEARCH_ANSWER_SYSTEM_PROMPT,
    });

    const cachedResponse =
      await this.cacheStorage.get<AiSearchAnswerResponse>(cacheKey);

    if (isDefined(cachedResponse)) {
      this.recordRequest({ trigger: input.trigger, outcome: 'cache-hit' });

      return cachedResponse;
    }

    const { promise, isDeduplicated } = this.inFlightAnswers.run({
      key: `${cacheKey}:${input.trigger}`,
      waiterSignal: clientSignal,
      execute: (signal) =>
        this.generateAnswer({
          input,
          workspace,
          userWorkspaceId,
          authContext,
          registeredModel,
          serializedEvidence,
          sourcesByReference,
          cacheKey,
          signal,
        }),
    });

    if (isDeduplicated) {
      this.recordRequest({ trigger: input.trigger, outcome: 'deduplicated' });
    }

    return promise;
  }

  async recordAskAiHandoff({
    input,
    workspaceId,
    userWorkspaceId,
  }: {
    input: AiSearchAnswerAskAiHandoffInput;
    workspaceId: string;
    userWorkspaceId: string;
  }) {
    const sessionCallCount =
      (await this.cacheStorage.get<number>(
        this.buildSearchSessionKey({
          workspaceId,
          userWorkspaceId,
          searchSessionId: input.searchSessionId,
        }),
      )) ?? 0;

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiSearchAnswerAskAiHandoff,
      amount: 1,
      attributes: {
        answerStatus: input.answerStatus,
        sessionCallCount:
          getAiSearchAnswerSessionCallIndexLabel(sessionCallCount),
      },
    });
  }

  private resolveSearchAnswerModel(aiDataPolicy: AiDataPolicy) {
    const registeredModel =
      this.aiModelRegistryService.getFirstAvailableModelFromList({
        modelIds: AI_SEARCH_ANSWER_MODEL_IDS,
        aiDataPolicy,
      });

    if (!isDefined(registeredModel)) {
      throw new AiException(
        'No low-cost AI model is available for search answers',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return registeredModel;
  }

  private async generateAnswer({
    input,
    workspace,
    userWorkspaceId,
    authContext,
    registeredModel,
    serializedEvidence,
    sourcesByReference,
    cacheKey,
    signal,
  }: {
    input: AiSearchAnswerInput;
    workspace: WorkspaceEntity;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
    registeredModel: RegisteredAiModel;
    serializedEvidence: string;
    sourcesByReference: Map<string, ToolRecordReference>;
    cacheKey: string;
    signal: AbortSignal;
  }): Promise<AiSearchAnswerResponse> {
    if (input.trigger === 'automatic') {
      const isAllowed = await this.consumeAutomaticAllowance({
        workspaceId: workspace.id,
        userWorkspaceId,
      });

      if (!isAllowed) {
        this.recordRequest({ trigger: input.trigger, outcome: 'limited' });

        return { kind: 'limited' };
      }
    }

    const spenders = buildUsageSpendersFromAuthContext(authContext);

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders,
    });

    const isContentRecordingAllowed =
      await this.workspaceAiDataPolicyService.isContentRecordingAllowed(
        workspace,
      );

    const sessionCallIndex = await this.incrementSearchSessionCallCount({
      workspaceId: workspace.id,
      userWorkspaceId,
      searchSessionId: input.searchSessionId,
    });

    this.recordRequest({ trigger: input.trigger, outcome: 'generated' });

    let usage: LanguageModelUsage | undefined;
    let outcome: AiSearchAnswerGenerationOutcome = 'failed';

    try {
      const result = await withDedicatedAiTrace(() =>
        generateText({
          model: registeredModel.model,
          providerOptions: buildAiSearchAnswerProviderOptions(registeredModel),
          instructions: AI_SEARCH_ANSWER_SYSTEM_PROMPT,
          prompt: buildAiSearchAnswerPrompt({
            question: input.question,
            serializedEvidence,
          }),
          output: Output.object({ schema: aiSearchAnswerModelOutputSchema }),
          maxOutputTokens: AI_SEARCH_ANSWER_MAX_OUTPUT_TOKENS,
          abortSignal: AbortSignal.any([
            signal,
            AbortSignal.timeout(AI_SEARCH_ANSWER_TIMEOUT_MS),
          ]),
          ...buildAiTelemetry({
            functionId: 'ai-search-answer',
            isContentRecordingAllowed,
            workspaceId: workspace.id,
            userWorkspaceId,
          }),
        }),
      );

      usage = result.usage;

      const response = resolveAiSearchAnswerResponse({
        output: result.output,
        sourcesByReference,
      });

      outcome = response.kind === 'answer' ? 'answer' : 'handoff';

      await this.cacheStorage.set(
        cacheKey,
        response,
        AI_SEARCH_ANSWER_CACHE_TTL_MS,
      );

      return response;
    } catch (error) {
      // an unparseable reply still spent tokens
      if (NoObjectGeneratedError.isInstance(error)) {
        usage = error.usage;
      }

      outcome = signal.aborted ? 'aborted' : 'failed';

      throw error;
    } finally {
      this.recordGeneration({
        modelId: registeredModel.modelId,
        trigger: input.trigger,
        outcome,
        sessionCallIndex,
        usage,
      });

      if (isDefined(usage)) {
        void this.aiBillingService.calculateAndBillUsage({
          modelId: registeredModel.modelId,
          billingInput: { usage },
          workspaceId: workspace.id,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          spenders,
        });
      }
    }
  }

  private async consumeAutomaticAllowance({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<boolean> {
    const isPastCooldown = await this.cacheStorage.setIfAbsent(
      `${AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX}:cooldown:${workspaceId}:${userWorkspaceId}`,
      true,
      this.twentyConfigService.get('AI_SEARCH_ANSWER_AUTOMATIC_COOLDOWN_IN_MS'),
    );

    if (!isPastCooldown) {
      return false;
    }

    const [admittedCount] = await this.throttlerService.tryConsumeTokenBuckets({
      buckets: buildAiSearchAnswerAutomaticAllowanceBuckets({
        workspaceId,
        userWorkspaceId,
        userAllowance: this.twentyConfigService.get(
          'AI_SEARCH_ANSWER_AUTOMATIC_USER_ALLOWANCE',
        ),
        workspaceAllowance: this.twentyConfigService.get(
          'AI_SEARCH_ANSWER_AUTOMATIC_WORKSPACE_ALLOWANCE',
        ),
        windowMs: this.twentyConfigService.get(
          'AI_SEARCH_ANSWER_AUTOMATIC_ALLOWANCE_WINDOW_IN_MS',
        ),
      }),
      tokensToConsume: 1,
      allowPartial: false,
    });

    return admittedCount === 1;
  }

  private async incrementSearchSessionCallCount({
    workspaceId,
    userWorkspaceId,
    searchSessionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    searchSessionId: string;
  }): Promise<number> {
    const sessionKey = this.buildSearchSessionKey({
      workspaceId,
      userWorkspaceId,
      searchSessionId,
    });
    const callCount =
      ((await this.cacheStorage.get<number>(sessionKey)) ?? 0) + 1;

    await this.cacheStorage.set(
      sessionKey,
      callCount,
      AI_SEARCH_ANSWER_SEARCH_SESSION_TTL_MS,
    );

    return callCount;
  }

  private buildSearchSessionKey({
    workspaceId,
    userWorkspaceId,
    searchSessionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    searchSessionId: string;
  }) {
    return `${AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX}:session:${workspaceId}:${userWorkspaceId}:${searchSessionId}`;
  }

  private recordRequest({
    trigger,
    outcome,
  }: {
    trigger: AiSearchAnswerInput['trigger'];
    outcome:
      | 'no-evidence'
      | 'cache-hit'
      | 'deduplicated'
      | 'limited'
      | 'generated';
  }) {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiSearchAnswerRequest,
      amount: 1,
      attributes: { trigger, outcome },
    });
  }

  private recordGeneration({
    modelId,
    trigger,
    outcome,
    sessionCallIndex,
    usage,
  }: {
    modelId: RegisteredAiModel['modelId'];
    trigger: AiSearchAnswerInput['trigger'];
    outcome: AiSearchAnswerGenerationOutcome;
    sessionCallIndex: number;
    usage: LanguageModelUsage | undefined;
  }) {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiSearchAnswerGeneration,
      amount: 1,
      attributes: {
        model: modelId,
        trigger,
        outcome,
        sessionCallIndex:
          getAiSearchAnswerSessionCallIndexLabel(sessionCallIndex),
      },
    });

    if (!isDefined(usage)) {
      return;
    }

    const attributes = { model: modelId };

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiSearchAnswerInputTokens,
      amount: usage.inputTokens ?? 0,
      attributes,
    });
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiSearchAnswerOutputTokens,
      amount: usage.outputTokens ?? 0,
      attributes,
    });
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiSearchAnswerCostMicroDollars,
      amount: Math.round(
        this.aiBillingService.calculateCost(modelId, { usage }) * 1_000_000,
      ),
      attributes,
    });
  }

  private async collectEvidenceRecords({
    candidates,
    authContext,
  }: {
    candidates: AiSearchAnswerInput['candidates'];
    authContext: WorkspaceAuthContext;
  }): Promise<AiSearchAnswerEvidenceRecord[]> {
    const recordIdsByObjectName = new Map<string, Set<string>>();

    for (const { objectNameSingular, recordId } of candidates) {
      const recordIds =
        recordIdsByObjectName.get(objectNameSingular) ?? new Set<string>();

      recordIds.add(recordId);
      recordIdsByObjectName.set(objectNameSingular, recordIds);
    }

    const evidenceRecordsByObject = await Promise.all(
      [...recordIdsByObjectName].map(([objectNameSingular, recordIds]) =>
        this.findEvidenceRecords({
          objectNameSingular,
          recordIds: [...recordIds],
          authContext,
        }),
      ),
    );

    const evidenceRecordByKey = new Map(
      evidenceRecordsByObject
        .flat()
        .map((evidenceRecord) => [
          `${evidenceRecord.objectNameSingular}:${evidenceRecord.recordId}`,
          evidenceRecord,
        ]),
    );

    const candidateKeys = new Set(
      candidates.map(
        ({ objectNameSingular, recordId }) =>
          `${objectNameSingular}:${recordId}`,
      ),
    );

    return [...candidateKeys]
      .map((candidateKey) => evidenceRecordByKey.get(candidateKey))
      .filter(isDefined);
  }

  // Candidates come from the client, so object, field and record access are all rechecked here
  private async findEvidenceRecords({
    objectNameSingular,
    recordIds,
    authContext,
  }: {
    objectNameSingular: string;
    recordIds: string[];
    authContext: WorkspaceAuthContext;
  }): Promise<AiSearchAnswerEvidenceRecord[]> {
    let apiContext: CommonApiContext;

    try {
      apiContext = await this.commonApiContextBuilderService.build({
        authContext,
        objectName: objectNameSingular,
      });
    } catch (error) {
      this.logger.warn(
        `Skipping search answer candidates of ${objectNameSingular}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return [];
    }

    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      unreadableFieldMetadataIds,
    } = apiContext;

    if (!flatObjectMetadata.isActive || !flatObjectMetadata.isSearchable) {
      return [];
    }

    const evidenceFields = selectAiSearchAnswerEvidenceFields({
      flatFields: findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
      labelIdentifierFieldMetadataId:
        flatObjectMetadata.labelIdentifierFieldMetadataId,
      unreadableFieldMetadataIds,
    });

    const findRecordsResult = await this.findRecordsService.execute({
      objectName: objectNameSingular,
      authContext,
      filter: { id: { in: recordIds } },
      limit: recordIds.length,
      select: evidenceFields.map((field) => field.name),
      shouldBuildEffectiveSelectFields: true,
    });

    if (!findRecordsResult.success || !isDefined(findRecordsResult.result)) {
      return [];
    }

    const isLabelIdentifierReadable = evidenceFields.some(
      (field) => field.id === flatObjectMetadata.labelIdentifierFieldMetadataId,
    );

    const getRelationDisplayName = (
      field: FlatFieldMetadata,
      value: unknown,
    ): string | null => {
      if (
        !isObject(value) ||
        !isDefined(field.relationTargetObjectMetadataId)
      ) {
        return null;
      }

      const relatedRecord = value as ObjectRecord;
      const relationTargetFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: field.relationTargetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

      if (!isDefined(relationTargetFlatObjectMetadata)) {
        return null;
      }

      const displayName = getRecordDisplayName(
        relatedRecord,
        relationTargetFlatObjectMetadata,
        flatFieldMetadataMaps,
      );

      return displayName === relatedRecord.id ? null : displayName;
    };

    return (findRecordsResult.result.records as ObjectRecord[]).map(
      (record) => {
        const displayName = isLabelIdentifierReadable
          ? getRecordDisplayName(
              record,
              flatObjectMetadata,
              flatFieldMetadataMaps,
            )
          : '';

        return buildAiSearchAnswerEvidenceRecord({
          record,
          objectNameSingular,
          objectLabel: flatObjectMetadata.labelSingular,
          displayName: displayName === record.id ? '' : displayName,
          evidenceFields,
          labelIdentifierFieldMetadataId:
            flatObjectMetadata.labelIdentifierFieldMetadataId,
          getRelationDisplayName,
        });
      },
    );
  }
}
