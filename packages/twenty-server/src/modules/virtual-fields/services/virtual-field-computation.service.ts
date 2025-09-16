import { Injectable } from '@nestjs/common';

import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { VirtualFieldDiscoveryService } from 'src/modules/virtual-fields/services/virtual-field-discovery.service';
import {
  VirtualFieldPathEvaluator,
  type PathEvaluatorResult,
} from 'src/modules/virtual-fields/services/virtual-field-path-evaluator.service';
import { PrimitiveValue } from 'src/modules/virtual-fields/types/PrimitiveValue';
import {
  ConditionalField,
  PathBasedField,
  VirtualField,
} from 'src/modules/virtual-fields/types/VirtualField';
import { evaluateConditionalField } from 'src/modules/virtual-fields/utils/evaluate-virtual-field-conditions.util';

type FieldComputationResult = PathEvaluatorResult;

type EntityRecord = Record<string, PrimitiveValue>;

@Injectable()
export class VirtualFieldComputationService {
  constructor(
    private readonly virtualFieldDiscoveryService: VirtualFieldDiscoveryService,
    private readonly pathEvaluatorService: VirtualFieldPathEvaluator,
  ) {}

  async computeFieldValue(params: {
    virtualField: VirtualField;
    entityData: EntityRecord;
    workspaceId: string;
    objectMetadataMaps: ObjectMetadataMaps;
  }): Promise<FieldComputationResult> {
    const { virtualField, entityData, workspaceId, objectMetadataMaps } =
      params;

    if ('when' in virtualField && 'default' in virtualField) {
      return this.computeConditionalField(
        virtualField as ConditionalField,
        entityData,
        objectMetadataMaps,
      );
    }

    return await this.computePathBasedField(
      virtualField,
      entityData.id as string,
      workspaceId,
      objectMetadataMaps,
    );
  }

  extractStorableValue(computedResult: FieldComputationResult): PrimitiveValue {
    if (
      computedResult.isEntityResult &&
      computedResult.value &&
      typeof computedResult.value === 'object'
    ) {
      return (computedResult.value as EntityRecord).id || null;
    }

    return computedResult.value as PrimitiveValue;
  }

  private computeConditionalField(
    virtualField: ConditionalField,
    entityData: EntityRecord,
    objectMetadataMaps: ObjectMetadataMaps,
  ): FieldComputationResult {
    const value = evaluateConditionalField(
      virtualField,
      entityData,
      objectMetadataMaps,
    );

    return { value, isEntityResult: false };
  }

  private async computePathBasedField(
    virtualField: VirtualField,
    entityId: string,
    workspaceId: string,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<FieldComputationResult> {
    const entityName =
      this.virtualFieldDiscoveryService.getEntityNameFromTarget(
        virtualField.objectMetadataId,
      );

    return await this.pathEvaluatorService.evaluatePathBasedField(
      virtualField as PathBasedField,
      entityId,
      entityName,
      workspaceId,
      objectMetadataMaps,
    );
  }
}
