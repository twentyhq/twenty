/* @license Enterprise */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

type PermissionsConfigurationCount = {
  feature: string;
  workspaceCount: number;
  entityCount: number;
};

const PERMISSIONS_CONFIGURATION_COUNTS_SQL = `
  WITH "activeRule" AS (
    SELECT rule."workspaceId"
    FROM core."rowLevelPermissionRule" rule
    JOIN core."workspace" workspace ON workspace.id = rule."workspaceId" AND workspace."deletedAt" IS NULL
  ),
  "activeRelationHopPredicate" AS (
    SELECT predicate."workspaceId"
    FROM core."rowLevelPermissionPredicate" predicate
    JOIN core."workspace" workspace ON workspace.id = predicate."workspaceId" AND workspace."deletedAt" IS NULL
    WHERE predicate."relationFieldMetadataId" IS NOT NULL AND predicate."deletedAt" IS NULL
  ),
  "activeRelatedRecordPath" AS (
    SELECT path."workspaceId",
      CASE
        WHEN path."thirdFieldMetadataId" IS NOT NULL THEN 3
        WHEN path."secondFieldMetadataId" IS NOT NULL THEN 2
        ELSE 1
      END AS depth
    FROM core."relatedRecordPath" path
    JOIN core."workspace" workspace ON workspace.id = path."workspaceId" AND workspace."deletedAt" IS NULL
  )
  SELECT 'row_level_permission_rule' AS feature, COUNT(DISTINCT "workspaceId") AS "workspaceCount", COUNT(*) AS "entityCount" FROM "activeRule"
  UNION ALL
  SELECT 'row_level_permission_relation_hop', COUNT(DISTINCT "workspaceId"), COUNT(*) FROM "activeRelationHopPredicate"
  UNION ALL
  SELECT 'related_record_path', COUNT(DISTINCT "workspaceId"), COUNT(*) FROM "activeRelatedRecordPath"
  UNION ALL
  SELECT 'related_record_path_depth_' || depth, COUNT(DISTINCT "workspaceId"), COUNT(*) FROM "activeRelatedRecordPath" GROUP BY depth
`;

@Injectable()
export class PermissionsConfigurationGaugeService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_permissions_configured_workspaces',
      options: {
        description:
          'Number of workspaces configuring a permission feature (row-level rules, relation hops, related record paths by depth), labelled by feature.',
      },
      callback: async () =>
        (await this.findConfigurationCounts()).map(
          ({ feature, workspaceCount }) => ({
            value: workspaceCount,
            attributes: { feature },
          }),
        ),
      cacheValue: true,
    });

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_permissions_configured_entities',
      options: {
        description:
          'Number of configured permission entities (row-level rules, relation hop predicates, related record paths by depth), labelled by feature.',
      },
      callback: async () =>
        (await this.findConfigurationCounts()).map(
          ({ feature, entityCount }) => ({
            value: entityCount,
            attributes: { feature },
          }),
        ),
      cacheValue: true,
    });
  }

  private async findConfigurationCounts(): Promise<
    PermissionsConfigurationCount[]
  > {
    const rows: {
      feature: string;
      workspaceCount: string;
      entityCount: string;
    }[] = await this.coreDataSource.query(PERMISSIONS_CONFIGURATION_COUNTS_SQL);

    return rows.map(({ feature, workspaceCount, entityCount }) => ({
      feature,
      workspaceCount: Number(workspaceCount),
      entityCount: Number(entityCount),
    }));
  }
}
