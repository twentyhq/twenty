import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const opportunitiesAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  const opportunityMetadata =
    objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.opportunity];

  if (!opportunityMetadata) {
    throw new Error(
      `Opportunity metadata not found for standard ID ${STANDARD_OBJECT_IDS.opportunity}`,
    );
  }

  const getFieldId = (fieldStandardId: string) => {
    const fieldId = opportunityMetadata.fields[fieldStandardId];

    if (!fieldId) {
      throw new Error(
        `Field metadata not found for standard ID ${fieldStandardId}`,
      );
    }

    return fieldId;
  };

  return {
    name: 'All',
    objectMetadataId: opportunityMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.name),
        position: 0,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(
          OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
        ),
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.createdBy),
        position: 2,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.closeDate),
        position: 3,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.min,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.company),
        position: 4,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.stage),
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.produto),
        position: 6,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.valorBruto),
        position: 7,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      },
      {
        fieldMetadataId: getFieldId(
          OPPORTUNITY_STANDARD_FIELD_IDS.valorLiquido,
        ),
        position: 8,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.prazo),
        position: 9,
        isVisible: true,
        size: 100,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.parcela),
        position: 10,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      },
      {
        fieldMetadataId: getFieldId(
          OPPORTUNITY_STANDARD_FIELD_IDS.totalEmprestimo,
        ),
        position: 11,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.ade),
        position: 12,
        isVisible: true,
        size: 100,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.promotora),
        position: 13,
        isVisible: true,
        size: 150,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.percentual),
        position: 15,
        isVisible: true,
        size: 100,
        aggregateOperation: AGGREGATE_OPERATIONS.avg,
      },
      {
        fieldMetadataId: getFieldId(OPPORTUNITY_STANDARD_FIELD_IDS.comissao),
        position: 16,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      },
      {
        fieldMetadataId: getFieldId(
          OPPORTUNITY_STANDARD_FIELD_IDS.statusOpportunity,
        ),
        position: 17,
        isVisible: true,
        size: 100,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(
          OPPORTUNITY_STANDARD_FIELD_IDS.observacoesOpportunity,
        ),
        position: 18,
        isVisible: true,
        size: 200,
        aggregateOperation: undefined,
      },
      {
        fieldMetadataId: getFieldId(
          OPPORTUNITY_STANDARD_FIELD_IDS.pagoComissao,
        ),
        position: 19,
        isVisible: true,
        size: 100,
        aggregateOperation: undefined,
      },
    ],
  };
};
