import { Injectable, Logger } from '@nestjs/common';

import { IngestionPipelineEntity } from 'src/engine/metadata-modules/ingestion-pipeline/entities/ingestion-pipeline.entity';
import { ConvosoCallPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/convoso-call.preprocessor';
import { ConvosoLeadPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/convoso-lead.preprocessor';
import { HealthSherpaPolicyPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/healthsherpa-policy.preprocessor';
import { OldCrmPolicyPreprocessor } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/old-crm-policy.preprocessor';

export interface IngestionPreprocessor {
  preProcess(
    payload: Record<string, unknown>,
    pipeline: IngestionPipelineEntity,
    workspaceId: string,
  ): Promise<Record<string, unknown> | null>;
}

@Injectable()
export class IngestionPreprocessorRegistry {
  private readonly logger = new Logger(IngestionPreprocessorRegistry.name);

  constructor(
    private readonly healthSherpaPolicyPreprocessor: HealthSherpaPolicyPreprocessor,
    private readonly convosoCallPreprocessor: ConvosoCallPreprocessor,
    private readonly convosoLeadPreprocessor: ConvosoLeadPreprocessor,
    private readonly oldCrmPolicyPreprocessor: OldCrmPolicyPreprocessor,
  ) {}

  async preProcessRecords(
    records: Record<string, unknown>[],
    pipeline: IngestionPipelineEntity,
    workspaceId: string,
  ): Promise<Record<string, unknown>[]> {
    const preprocessor = this.getPreprocessor(pipeline);

    if (!preprocessor) {
      // No preprocessor configured, return records as-is
      return records;
    }

    this.logger.log(
      `Preprocessing ${records.length} records with preprocessor for pipeline ${pipeline.name}`,
    );

    // Process each record through the preprocessor
    const processedRecords: Record<string, unknown>[] = [];

    for (const record of records) {
      try {
        const processed = await preprocessor.preProcess(
          record,
          pipeline,
          workspaceId,
        );

        if (processed === null) {
          this.logger.log(`Preprocessor returned null, skipping record`);
          continue;
        }

        processedRecords.push(processed);
      } catch (error) {
        this.logger.error(
          `Failed to preprocess record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        // Re-throw to let job handler deal with retry logic
        throw error;
      }
    }

    return processedRecords;
  }

  private getPreprocessor(
    pipeline: IngestionPipelineEntity,
  ): IngestionPreprocessor | null {
    // Match preprocessor by pipeline name or target object
    // This is a simple approach - could be enhanced to use a config field

    if (
      pipeline.name.toLowerCase().includes('health sherpa') ||
      pipeline.name.toLowerCase().includes('healthsherpa')
    ) {
      return this.healthSherpaPolicyPreprocessor;
    }

    const pipelineName = pipeline.name.toLowerCase();

    if (pipelineName.includes('convoso') && pipelineName.includes('call')) {
      return this.convosoCallPreprocessor;
    }

    if (pipelineName.includes('convoso') && pipelineName.includes('lead')) {
      return this.convosoLeadPreprocessor;
    }

    if (pipelineName.includes('old crm') || pipelineName.includes('legacy')) {
      return this.oldCrmPolicyPreprocessor;
    }

    // No preprocessor for this pipeline
    return null;
  }
}
