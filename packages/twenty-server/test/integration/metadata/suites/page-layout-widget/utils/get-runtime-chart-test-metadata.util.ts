import { FieldMetadataType } from 'twenty-shared/types';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  buildChartTestConfigs,
  type ChartTestConfigMap,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';

const NUMERIC_FIELD_METADATA_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.NUMBER,
  FieldMetadataType.NUMERIC,
]);

type SelectedChartFieldMetadata = {
  aggregateField: Pick<FieldMetadataDTO, 'id' | 'name' | 'type'>;
  primaryGroupByField: Pick<FieldMetadataDTO, 'id' | 'name' | 'type'>;
  secondaryGroupByField: Pick<FieldMetadataDTO, 'id' | 'name' | 'type'>;
  gaugeMinimalAggregateField: Pick<FieldMetadataDTO, 'id' | 'name' | 'type'>;
  gaugeMinimalAggregateOperation: AggregateOperations;
};

export type RuntimeChartTestMetadata = {
  objectMetadataId: string;
  chartConfigs: ChartTestConfigMap;
  selectedFieldMetadata: SelectedChartFieldMetadata;
};

const describeField = (field: Pick<FieldMetadataDTO, 'name' | 'type'>): string =>
  `${field.name}:${field.type}`;

const sortFieldsByNameAndId = (
  fields: FieldMetadataDTO[],
): FieldMetadataDTO[] => {
  return [...fields].sort((leftField, rightField) => {
    const nameComparison = leftField.name.localeCompare(rightField.name);

    if (nameComparison !== 0) {
      return nameComparison;
    }

    return leftField.id.localeCompare(rightField.id);
  });
};

export const getRuntimeChartTestMetadata =
  async (): Promise<RuntimeChartTestMetadata> => {
    const { objects } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: {
          first: 1000,
        },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
          type
          isActive
        }
      `,
      expectToFail: false,
    });

    const companyObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    );

    if (!companyObject?.id) {
      throw new Error('Expected company object metadata but none was found.');
    }

    if (!companyObject.fieldsList || companyObject.fieldsList.length === 0) {
      throw new Error(
        `Expected company object metadata (${companyObject.id}) to include fieldsList.`,
      );
    }

    const simpleActiveFields = sortFieldsByNameAndId(
      companyObject.fieldsList.filter(
        (fieldMetadata) =>
          fieldMetadata.isActive !== false &&
          !isCompositeFieldMetadataType(fieldMetadata.type) &&
          fieldMetadata.type !== FieldMetadataType.RELATION &&
          fieldMetadata.type !== FieldMetadataType.MORPH_RELATION,
      ),
    );

    if (simpleActiveFields.length < 3) {
      throw new Error(
        `Expected at least 3 simple active company fields for chart tests. Found ${simpleActiveFields.length}.`,
      );
    }

    const preferredNumericAggregateField = simpleActiveFields.find(
      (fieldMetadata) => NUMERIC_FIELD_METADATA_TYPES.has(fieldMetadata.type),
    );
    const aggregateField =
      preferredNumericAggregateField ?? simpleActiveFields[0];

    const groupByFields = simpleActiveFields.filter(
      (fieldMetadata) => fieldMetadata.id !== aggregateField.id,
    );

    if (groupByFields.length < 2) {
      throw new Error(
        `Expected at least 2 distinct group-by fields after choosing aggregate field "${describeField(aggregateField)}". Found ${groupByFields.length}.`,
      );
    }

    const primaryGroupByField = groupByFields[0];
    const secondaryGroupByField = groupByFields[1];

    const booleanField = simpleActiveFields.find(
      (fieldMetadata) => fieldMetadata.type === FieldMetadataType.BOOLEAN,
    );
    const gaugeMinimalAggregateField = booleanField ?? aggregateField;
    const gaugeMinimalAggregateOperation = booleanField
      ? AggregateOperations.COUNT_TRUE
      : AggregateOperations.COUNT;

    const chartConfigs = buildChartTestConfigs({
      aggregateFieldMetadataId: aggregateField.id,
      groupByFieldMetadataIdPrimary: primaryGroupByField.id,
      groupByFieldMetadataIdSecondary: secondaryGroupByField.id,
      gaugeMinimalAggregateFieldMetadataId: gaugeMinimalAggregateField.id,
      gaugeMinimalAggregateOperation,
    });

    return {
      objectMetadataId: companyObject.id,
      chartConfigs,
      selectedFieldMetadata: {
        aggregateField,
        primaryGroupByField,
        secondaryGroupByField,
        gaugeMinimalAggregateField,
        gaugeMinimalAggregateOperation,
      },
    };
  };
