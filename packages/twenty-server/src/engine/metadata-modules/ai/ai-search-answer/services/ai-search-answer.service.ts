import { Injectable, Logger } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import {
  generateText,
  type LanguageModelUsage,
  NoObjectGeneratedError,
  Output,
} from 'ai';
import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  type CommonApiContext,
  CommonApiContextBuilderService,
} from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { buildUsageSpendersFromAuthContext } from 'src/engine/core-modules/usage/utils/build-usage-spenders-from-auth-context.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceAiDataPolicyService } from 'src/engine/metadata-modules/ai/ai-models/services/workspace-ai-data-policy.service';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { buildReasoningProviderOptions } from 'src/engine/metadata-modules/ai/ai-models/utils/build-reasoning-provider-options.util';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import { AI_SEARCH_ANSWER_MAX_EVIDENCE_CHARACTERS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-evidence-characters.constant';
import { AI_SEARCH_ANSWER_MAX_OUTPUT_TOKENS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-output-tokens.constant';
import { AI_SEARCH_ANSWER_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-system-prompt.constant';
import { AI_SEARCH_ANSWER_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-timeout-ms.constant';
import { type AiSearchAnswerInput } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-input.schema';
import { aiSearchAnswerModelOutputSchema } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-model-output.schema';
import { type AiSearchAnswerEvidenceRecord } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-evidence-record.type';
import { type AiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-response.type';
import { buildAiSearchAnswerEvidence } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-evidence.util';
import { buildAiSearchAnswerEvidenceRecord } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-evidence-record.util';
import { buildAiSearchAnswerPrompt } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-prompt.util';
import { resolveAiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/resolve-ai-search-answer-response.util';
import { selectAiSearchAnswerEvidenceFields } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/select-ai-search-answer-evidence-fields.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

@Injectable()
export class AiSearchAnswerService {
  private readonly logger = new Logger(AiSearchAnswerService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly workspaceAiDataPolicyService: WorkspaceAiDataPolicyService,
    private readonly commonApiContextBuilderService: CommonApiContextBuilderService,
    private readonly findRecordsService: FindRecordsService,
  ) {}

  async answer({
    input,
    workspace,
    userWorkspaceId,
    authContext,
  }: {
    input: AiSearchAnswerInput;
    workspace: WorkspaceEntity;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<AiSearchAnswerResponse> {
    const spenders = buildUsageSpendersFromAuthContext(authContext);

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders,
    });

    const aiDataPolicy =
      await this.workspaceAiDataPolicyService.getEffectiveAiDataPolicy(
        workspace,
      );

    const registeredModel = this.aiModelRegistryService.resolveModelForAgent(
      { modelId: AUTO_SELECT_MODEL_ID_BY_TIER.fast },
      { ...workspace, effectiveAiDataPolicy: aiDataPolicy },
    );

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
      return { kind: 'handoff' };
    }

    const isContentRecordingAllowed =
      await this.workspaceAiDataPolicyService.isContentRecordingAllowed(
        workspace,
      );

    let usage: LanguageModelUsage | undefined;

    try {
      const result = await withDedicatedAiTrace(() =>
        generateText({
          model: registeredModel.model,
          providerOptions: buildReasoningProviderOptions(registeredModel),
          instructions: AI_SEARCH_ANSWER_SYSTEM_PROMPT,
          prompt: buildAiSearchAnswerPrompt({
            question: input.question,
            serializedEvidence,
          }),
          output: Output.object({ schema: aiSearchAnswerModelOutputSchema }),
          maxOutputTokens: AI_SEARCH_ANSWER_MAX_OUTPUT_TOKENS,
          abortSignal: AbortSignal.timeout(AI_SEARCH_ANSWER_TIMEOUT_MS),
          ...buildAiTelemetry({
            functionId: 'ai-search-answer',
            isContentRecordingAllowed,
            workspaceId: workspace.id,
            userWorkspaceId,
          }),
        }),
      );

      usage = result.usage;

      return resolveAiSearchAnswerResponse({
        output: result.output,
        sourcesByReference,
      });
    } catch (error) {
      // an unparseable reply still spent tokens
      if (NoObjectGeneratedError.isInstance(error)) {
        usage = error.usage;
      }

      throw error;
    } finally {
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
