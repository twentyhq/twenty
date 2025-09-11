import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type PrimitiveValue } from 'src/modules/virtual-fields/types/PrimitiveValue';
import {
  type Condition,
  type PathBasedField,
} from 'src/modules/virtual-fields/types/VirtualField';
import { resolveField } from 'src/modules/virtual-fields/utils/metadata-resolver.util';

type ResolvedPathStep = {
  objectName: string;
  fieldName: string;
};

export type PathEvaluatorResult = {
  value: PrimitiveValue | ObjectLiteral;
  isEntityResult: boolean;
};

@Injectable()
export class VirtualFieldPathEvaluator {
  private readonly logger = new Logger(VirtualFieldPathEvaluator.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async evaluatePathBasedField(
    pathField: PathBasedField,
    entityId: string,
    targetObjectName: string,
    workspaceId: string,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<PathEvaluatorResult> {
    const resolvedPath = this.resolveFieldPath(
      pathField.path,
      objectMetadataMaps,
    );
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        targetObjectName,
        { shouldBypassPermissionChecks: true },
      );

    const queryBuilder = repository.createQueryBuilder('root');
    const pathAlias = this.buildPathJoins(queryBuilder, resolvedPath);
    const isEntityResult = resolvedPath.length === 1;

    if (pathField.where || pathField.rankBy) {
      this.applyFiltersAndOrdering(
        queryBuilder,
        pathField,
        pathAlias,
        objectMetadataMaps,
      );
    }

    queryBuilder.andWhere('root.id = :entityId', { entityId });

    return isEntityResult
      ? this.executeEntityQuery(queryBuilder, pathAlias, objectMetadataMaps)
      : this.executeAggregateQuery(
          queryBuilder,
          pathField.calculation,
          resolvedPath,
          pathAlias,
        );
  }

  private resolveFieldPath(
    fieldPath: string[],
    objectMetadataMaps: ObjectMetadataMaps,
  ): ResolvedPathStep[] {
    const resolvedPath = fieldPath
      .map((fieldId) => resolveField(fieldId, objectMetadataMaps))
      .filter(isDefined);

    if (resolvedPath.length !== fieldPath.length) {
      throw new Error(
        `Could not resolve field path: ${fieldPath.join(' -> ')}`,
      );
    }

    return resolvedPath;
  }

  private buildPathJoins(
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    resolvedPath: ResolvedPathStep[],
  ): string {
    if (resolvedPath.length <= 1) {
      return 'root';
    }

    let currentAlias = 'root';

    for (let i = 0; i < resolvedPath.length - 1; i++) {
      const step = resolvedPath[i];
      const nextAlias = resolvedPath[i + 1].objectName;

      queryBuilder.leftJoin(`${currentAlias}.${step.fieldName}`, nextAlias);
      currentAlias = nextAlias;
    }

    return currentAlias;
  }

  private applyFiltersAndOrdering(
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    pathField: PathBasedField,
    pathAlias: string,
    objectMetadataMaps: ObjectMetadataMaps,
  ): void {
    const objectMetadata = this.getObjectMetadataForAlias(
      pathAlias,
      objectMetadataMaps,
    );

    if (!objectMetadata) return;

    const queryParser = new GraphqlQueryParser(
      objectMetadata,
      objectMetadataMaps,
    );

    if (pathField.where) {
      try {
        const resolvedFilter = this.transformConditionToFilter(
          pathField.where,
          objectMetadataMaps,
        );

        queryParser.applyFilterToBuilder(
          queryBuilder,
          pathAlias,
          resolvedFilter,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to apply filter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    if (pathField.rankBy) {
      try {
        const orderByDirection = this.convertDirectionToOrderBy(
          pathField.rankBy.direction,
        );
        const orderBy = pathField.rankBy.field
          ? [{ [pathField.rankBy.field]: orderByDirection }]
          : [{ id: orderByDirection }];

        queryParser.applyOrderToBuilder(queryBuilder, orderBy, pathAlias, true);

        if (pathField.rankBy.limit) {
          queryBuilder.limit(pathField.rankBy.limit);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to apply ordering: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  private async executeEntityQuery(
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    pathAlias: string,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<PathEvaluatorResult> {
    const objectMetadata = this.getObjectMetadataForAlias(
      pathAlias,
      objectMetadataMaps,
    );

    if (objectMetadata) {
      const columnsToSelect = buildColumnsToSelect({
        select: {},
        relations: {},
        objectMetadataItemWithFieldMaps: objectMetadata,
        objectMetadataMaps,
      });

      queryBuilder.setFindOptions({ select: columnsToSelect });
    }

    const entities = await queryBuilder.getMany();

    return {
      value: entities.length > 0 ? entities[0] : null,
      isEntityResult: true,
    };
  }

  private async executeAggregateQuery(
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    calculation: string,
    resolvedPath: ResolvedPathStep[],
    pathAlias: string,
  ): Promise<PathEvaluatorResult> {
    const targetField = resolvedPath[resolvedPath.length - 1];
    const targetColumnRef = `${pathAlias}.${targetField.fieldName}`;

    queryBuilder.select(
      `${calculation.toUpperCase()}(${targetColumnRef})`,
      'aggregate_result',
    );

    const result = await queryBuilder.getRawOne();

    return {
      value: result?.aggregate_result || null,
      isEntityResult: false,
    };
  }

  private getObjectMetadataForAlias(
    alias: string,
    objectMetadataMaps: ObjectMetadataMaps,
  ): ObjectMetadataItemWithFieldMaps | null {
    return alias === 'root'
      ? null
      : getObjectMetadataMapItemByNameSingular(objectMetadataMaps, alias) ||
          null;
  }

  private transformConditionToFilter(
    condition: Condition,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Record<string, unknown> {
    if ('field' in condition) {
      const resolvedField = resolveField(condition.field, objectMetadataMaps);

      if (!resolvedField) {
        this.logger.warn(
          `Cannot resolve field: ${condition.field} in available metadata maps`,
        );

        return {};
      }

      return {
        [resolvedField.fieldName]: { [condition.operator]: condition.value },
      };
    }

    if ('and' in condition && condition.and) {
      const resolvedConditions = condition.and
        .map((sub) => this.transformConditionToFilter(sub, objectMetadataMaps))
        .filter((filter) => Object.keys(filter).length > 0);

      return resolvedConditions.length > 0 ? { and: resolvedConditions } : {};
    }

    if ('or' in condition && condition.or) {
      const resolvedConditions = condition.or
        .map((sub) => this.transformConditionToFilter(sub, objectMetadataMaps))
        .filter((filter) => Object.keys(filter).length > 0);

      return resolvedConditions.length > 0 ? { or: resolvedConditions } : {};
    }

    if ('not' in condition && condition.not) {
      const resolvedCondition = this.transformConditionToFilter(
        condition.not,
        objectMetadataMaps,
      );

      return Object.keys(resolvedCondition).length > 0
        ? { not: resolvedCondition }
        : {};
    }

    return {};
  }

  private convertDirectionToOrderBy(direction: string): OrderByDirection {
    return direction === 'ASC'
      ? OrderByDirection.AscNullsFirst
      : OrderByDirection.DescNullsLast;
  }
}
