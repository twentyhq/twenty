import { InjectRepository } from '@nestjs/typeorm';

import { Configuration as Config, QueryApi } from '@nestbox-ai/agents';
import { Repository } from 'typeorm';

import { AiAgentConfig } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.entity';
import { AiAgentConfigStatus } from 'src/engine/core-modules/ai-agent-config/enums/ai-agent-config-status.enum';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Processor(MessageQueue.cronQueue)
export class NestboxAiAgentCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(AiAgentConfig, 'core')
    private readonly aiAgentConfigRepository: Repository<AiAgentConfig>,
    @InjectRepository(DataSourceEntity, 'core')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @Process(NestboxAiAgentCronJob.name)
  @SentryCronMonitor(
    NestboxAiAgentCronJob.name,
    '*/1 * * * *', // Default pattern for monitoring, actual pattern comes from config
  )
  async handle(): Promise<void> {
    const cronPattern = this.twentyConfigService.get(
      'NESTBOX_AI_AGENT_CRON_PATTERN',
    );

    console.log(
      `🚀 Nestbox AI Agent cron job started with pattern: ${cronPattern}`,
    );

    try {
      await this.processCoreSchemaRecords();

      console.log('✅ Nestbox AI Agent cron job completed successfully');
    } catch (error) {
      console.error('❌ Nestbox AI Agent cron job failed', error);
      this.exceptionHandlerService.captureExceptions([error]);
    }
  }

  private async processCoreSchemaRecords(): Promise<void> {
    console.log('📊 Processing core schema records...');

    const aiAgentConfigs = await this.aiAgentConfigRepository.find({
      where: {
        status: AiAgentConfigStatus.ENABLED,
      },
    });

    console.log(`Found ${aiAgentConfigs.length} active agents in core schema`);

    for (const aiAgentConfig of aiAgentConfigs) {
      console.log(
        `Processing agent: ${aiAgentConfig.id} - ${aiAgentConfig.workspaceId}`,
      );

      try {
        // Step 1: Get schema from dataSource based on workspaceId
        const dataSource = await this.dataSourceRepository.findOne({
          where: { workspaceId: aiAgentConfig.workspaceId },
        });

        if (!dataSource) {
          console.error(
            `❌ No dataSource found for workspace: ${aiAgentConfig.workspaceId}`,
          );
          continue;
        }

        console.log(
          `📋 Found schema: ${dataSource.schema} for workspace: ${aiAgentConfig.workspaceId}`,
        );

        // Step 2: Get nameSingular from objectMetadata using objectMetadataId as id
        const objectMetadata = await this.objectMetadataRepository.findOne({
          where: { id: aiAgentConfig.objectMetadataId },
        });

        if (!objectMetadata) {
          console.error(
            `❌ No objectMetadata found for id: ${aiAgentConfig.objectMetadataId}`,
          );
          continue;
        }

        // Determine table name based on isCustom property
        const tableName = objectMetadata.isCustom
          ? `_${objectMetadata.nameSingular}`
          : objectMetadata.nameSingular;

        console.log(
          `📋 Found nameSingular: ${objectMetadata.nameSingular} (isCustom: ${objectMetadata.isCustom}) -> tableName: ${tableName} for objectMetadataId: ${aiAgentConfig.objectMetadataId}`,
        );

        // Step 3: Query the actual table using schema and tableName
        const workspaceDataSource =
          await this.twentyORMGlobalManager.getDataSourceForWorkspace({
            workspaceId: aiAgentConfig.workspaceId,
          });

        if (!workspaceDataSource) {
          console.error(
            `❌ No workspace dataSource found for workspace: ${aiAgentConfig.workspaceId}`,
          );
          continue;
        }

        // Step 4: Get field name from fieldMetadata using fieldMetadataId
        const fieldMetadataResult = await workspaceDataSource.query(
          `SELECT name FROM "core"."fieldMetadata" WHERE id = $1`,
          [aiAgentConfig.fieldMetadataId],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        if (!fieldMetadataResult || fieldMetadataResult.length === 0) {
          console.error(
            `❌ No fieldMetadata found for id: ${aiAgentConfig.fieldMetadataId}`,
          );
          continue;
        }

        const fieldName = fieldMetadataResult[0].name;

        console.log(
          `📋 Found field name: ${fieldName} for fieldMetadataId: ${aiAgentConfig.fieldMetadataId}`,
        );

        // Step 5: Get current viewGroup record with position and fieldValue
        const currentViewGroupResult = await workspaceDataSource.query(
          `SELECT "fieldValue", "position" FROM "${dataSource.schema}"."viewGroup" WHERE id = $1 AND "deletedAt" IS NULL`,
          [aiAgentConfig.viewGroupId],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        if (!currentViewGroupResult || currentViewGroupResult.length === 0) {
          console.error(
            `❌ No viewGroup found for id: ${aiAgentConfig.viewGroupId}`,
          );
          continue;
        }

        const currentFieldValue = currentViewGroupResult[0].fieldValue;
        const currentPosition = currentViewGroupResult[0].position;

        console.log(
          `📋 Found current position: ${currentPosition}, fieldValue: ${currentFieldValue} for viewGroupId: ${aiAgentConfig.viewGroupId}`,
        );

        // Step 6: Find next greater position in viewGroup
        const nextViewGroupResult = await workspaceDataSource.query(
          `SELECT "fieldValue", "position" FROM "${dataSource.schema}"."viewGroup" 
           WHERE "position" > $1 AND "deletedAt" IS NULL AND "fieldMetadataId" = $2
           ORDER BY "position" ASC LIMIT 1`,
          [currentPosition, aiAgentConfig.fieldMetadataId],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        if (!nextViewGroupResult || nextViewGroupResult.length === 0) {
          console.log(
            `ℹ️ No next position found after position ${currentPosition}, skipping update`,
          );
          continue;
        }

        const nextFieldValue = nextViewGroupResult[0].fieldValue;
        const nextPosition = nextViewGroupResult[0].position;

        console.log(
          `📋 Found next position: ${nextPosition}, fieldValue: ${nextFieldValue}`,
        );

        // Step 6a: Get ALL view groups for this field so AI agent can decide where to move
        const allViewGroupsResult = await workspaceDataSource.query(
          `SELECT "fieldValue", "position" FROM "${dataSource.schema}"."viewGroup" 
           WHERE "deletedAt" IS NULL AND "fieldMetadataId" = $1 AND "isVisible" = true
           ORDER BY "position" ASC`,
          [aiAgentConfig.fieldMetadataId],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        const availableViewGroups = allViewGroupsResult.map((vg: any) => ({
          fieldValue: vg.fieldValue,
          position: vg.position,
        }));

        // Step 6b: Get View fields for the object
        const viewResult = await workspaceDataSource.query(
          `SELECT "name" FROM "${dataSource.schema}"."view" 
           WHERE "deletedAt" IS NULL AND "id" = $1`,
          [aiAgentConfig.viewId],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        let viewName = null;

        if (viewResult || viewResult.length >= 0) {
          viewName = viewResult[0].name;
        }

        // Step 6c: Load relation fields for the object
        const relationFieldsResult = await workspaceDataSource.query(
          `SELECT f.name, f."settings"->>'joinColumnName' as "joinColumnName", om."nameSingular", om."isCustom"
           FROM "core"."fieldMetadata" f
           LEFT JOIN "core"."objectMetadata" om ON om.id = f."relationTargetObjectMetadataId"
           WHERE f."objectMetadataId" = $1 AND f.type = 'RELATION' AND f."settings"->>'joinColumnName' IS NOT NULL`,
          [aiAgentConfig.objectMetadataId],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        const relationFields = relationFieldsResult.map((r: any) => ({
          fieldName: r.name,
          joinColumnName: r.joinColumnName,
          tableName: r.isCustom ? `_${r.nameSingular}` : r.nameSingular,
        }));

        // Step 7: Query records that match current fieldValue with related notes, tasks, and attachments
        let notesJoin = '';
        let notesSelect = '';

        if (objectMetadata.nameSingular !== 'task') {
          notesJoin = `
            LEFT JOIN "${dataSource.schema}"."noteTarget" 
              ON "noteTarget"."${objectMetadata.nameSingular}Id" = main.id
            LEFT JOIN "${dataSource.schema}"."note" note 
              ON note.id = "noteTarget"."noteId" AND note."deletedAt" IS NULL`;

          notesSelect = `,
            COALESCE(
              json_agg(DISTINCT note.*) FILTER (WHERE note.id IS NOT NULL),
              '[]'::json
            ) as notes`;
        }

        const queryResult = await workspaceDataSource.query(
          `SELECT 
              main.*${notesSelect},
              COALESCE(
                json_agg(DISTINCT task.*) FILTER (WHERE task.id IS NOT NULL),
                '[]'::json
              ) as tasks,
              COALESCE(
                json_agg(DISTINCT attachment.*) FILTER (WHERE attachment.id IS NOT NULL),
                '[]'::json
              ) as attachments
            FROM "${dataSource.schema}"."${tableName}" main
            LEFT JOIN "${dataSource.schema}"."taskTarget" 
              ON "taskTarget"."${objectMetadata.nameSingular}Id" = main.id
            LEFT JOIN "${dataSource.schema}"."task" task 
              ON task.id = "taskTarget"."taskId" AND task."deletedAt" IS NULL
            LEFT JOIN "${dataSource.schema}"."attachment" 
              ON "attachment"."${objectMetadata.nameSingular}Id" = main.id AND "attachment"."deletedAt" IS NULL
            ${notesJoin}
            WHERE main."${fieldName}" = $1
              AND main."deletedAt" IS NULL
            GROUP BY main.id
            LIMIT ${aiAgentConfig.wipLimit}`,
          [currentFieldValue],
          undefined,
          { shouldBypassPermissionChecks: true },
        );

        console.log(
          `📊 Found ${queryResult.length} records to potentially update from ${currentFieldValue} to ${nextFieldValue}`,
        );

        if (queryResult.length > 0) {
          // Step 8: Initialize Nestbox AI API configuration once per agent
          const config = new Config({
            basePath: this.twentyConfigService.get('NESTBOX_AI_INSTANCE_IP'),
            baseOptions: {
              headers: {
                Authorization: this.twentyConfigService.get(
                  'NESTBOX_AI_INSTANCE_API_KEY',
                ),
              },
            },
          });

          const apiKeys = await this.apiKeyService.findByWorkspaceId(
            aiAgentConfig.workspaceId,
          );

          const latestApiKey = apiKeys.find(
            (key) => !key.revokedAt && key.expiresAt > new Date(),
          );

          let apiKeyToken = null;

          if (latestApiKey) {
            apiKeyToken = await this.apiKeyService.generateApiKeyToken(
              aiAgentConfig.workspaceId,
              latestApiKey.id,
              latestApiKey.expiresAt,
            );
          }

          const queryApi = new QueryApi(config);

          // Process each record individually
          for (const record of queryResult) {
            try {
              // Step 8a: Call Nestbox AI API for each record
              console.log(
                `🤖 Processing record ${record.id} with Nestbox AI agent ${aiAgentConfig.agent}`,
              );

              const sanitizedNotes = (record.notes || []).map(
                ({ bodyV2Blocknote, ...note }: any) => note,
              );

              const sanitizedTasks = (record.tasks || []).map(
                ({ bodyV2Blocknote, ...task }: any) => task,
              );

              // Load related objects
              const relatedObjects: Record<string, any> = {};

              for (const rel of relationFields) {
                const relatedId = record[rel.joinColumnName];

                if (!relatedId) continue;
                const relRes = await workspaceDataSource.query(
                  `SELECT * FROM "${dataSource.schema}"."${rel.tableName}" WHERE id = $1 AND "deletedAt" IS NULL LIMIT 1`,
                  [relatedId],
                  undefined,
                  { shouldBypassPermissionChecks: true },
                );

                if (relRes.length > 0)
                  relatedObjects[rel.fieldName] = relRes[0];
              }

              // Add view group information to the record
              const enrichedRecord = {
                ...record,
                ...relatedObjects,
                notes: sanitizedNotes,
                tasks: sanitizedTasks,
              };

              const queries =
                await queryApi.agentOperationsQueryControllerCreateQuery(
                  aiAgentConfig.agent,
                  {
                    params: {
                      data: enrichedRecord,
                      instructions: aiAgentConfig.additionalInput,
                      metadata: {
                        viewGroupContext: {
                          availableViewGroups: availableViewGroups,
                          currentViewGroup: {
                            fieldValue: currentFieldValue,
                            position: currentPosition,
                          },
                        },
                        NestboxApiPath: objectMetadata.namePlural,
                        NestboxTwentyObjectName: objectMetadata.nameSingular,
                        NestboxTwentyURL:
                          this.twentyConfigService.get('SERVER_URL'),
                        NestboxTwentyAPIToken: apiKeyToken?.token,
                        NestboxStateViewName: viewName,
                        NestboxStateFieldName: fieldName,
                      },
                    },
                  },
                );

              await new Promise((r) => setTimeout(r, 100));

              console.log(
                `✅ Nestbox AI query response for record ${record.id}:`,
                queries.data,
              );

              // Step 8b: Update individual record to next position's fieldValue
              await workspaceDataSource.query(
                `UPDATE "${dataSource.schema}"."${tableName}"
                 SET "${fieldName}" = $1, "updatedAt" = NOW()
                 WHERE id = $2 AND "deletedAt" IS NULL`,
                [nextFieldValue, record.id],
                undefined,
                { shouldBypassPermissionChecks: true },
              );

              console.log(
                `✅ Updated record ${record.id} from '${currentFieldValue}' to '${nextFieldValue}' in ${dataSource.schema}.${tableName}`,
              );
            } catch (error) {
              console.error(`❌ Error processing record ${record.id}:`, error);
              this.exceptionHandlerService.captureExceptions([error]);
              // Continue processing other records even if one fails
            }
          }
        } else {
          console.log(
            `ℹ️ No records found to update for ${fieldName} = '${currentFieldValue}'`,
          );
        }
      } catch (error) {
        console.error(`❌ Error processing agent ${aiAgentConfig.id}:`, error);
        this.exceptionHandlerService.captureExceptions([error]);
      }
    }
  }
}
