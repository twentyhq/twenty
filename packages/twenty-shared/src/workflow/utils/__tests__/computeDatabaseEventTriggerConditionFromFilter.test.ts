import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { StepLogicalOperator } from '@/types/StepFilters';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { computeDatabaseEventTriggerConditionFromFilter } from '@/workflow/utils/computeDatabaseEventTriggerConditionFromFilter';

const FIELDS = [
  { name: 'name', type: FieldMetadataType.TEXT, universalIdentifier: 'name' },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      { name: 'id', type: FieldMetadataType.UUID, universalIdentifier: 'id' },
      {
        name: 'name',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'company-name',
      },
    ],
  },
];

const buildFilter = ({
  type,
  operand,
  value,
  path,
}: {
  type: string;
  operand: ViewFilterOperand;
  value: string;
  path: string;
}) => ({
  stepFilterGroups: [{ id: 'root', logicalOperator: StepLogicalOperator.AND }],
  stepFilters: [
    {
      id: 'filter',
      type,
      operand,
      value,
      stepOutputKey: `{{trigger.properties.after.${path}}}`,
      stepFilterGroupId: 'root',
    },
  ],
});

describe('computeDatabaseEventTriggerConditionFromFilter', () => {
  it('returns the expression of a filter it converts exactly', () => {
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'company.created',
        filter: buildFilter({
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          value: 'Acme',
          path: 'name',
        }),
        fields: FIELDS,
      }),
    ).toBe("name == 'Acme'");
  });

  it('keeps the legacy filter when the expression reads a field the object lacks', () => {
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'company.created',
        filter: buildFilter({
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          value: 'Acme',
          path: 'domainName',
        }),
        fields: FIELDS,
      }),
    ).toBeUndefined();
  });

  it('keeps the legacy filter when the expression reads a related record', () => {
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'person.created',
        filter: buildFilter({
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          value: 'Acme',
          path: 'company.name',
        }),
        fields: FIELDS,
      }),
    ).toBeUndefined();
  });

  it('keeps the legacy filter when the expression reads a relation id', () => {
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'person.created',
        filter: buildFilter({
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          value: 'company-1',
          path: 'company.id',
        }),
        fields: FIELDS,
      }),
    ).toBeUndefined();
  });

  it('keeps the legacy filter when the filter does not convert', () => {
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'company.created',
        filter: buildFilter({
          type: 'RAW_JSON',
          operand: ViewFilterOperand.IS,
          value: '{}',
          path: 'name',
        }),
        fields: FIELDS,
      }),
    ).toBeUndefined();
  });

  it('has no condition without filters or with an unknown event', () => {
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'company.created',
        filter: { stepFilterGroups: [], stepFilters: [] },
        fields: FIELDS,
      }),
    ).toBeUndefined();
    expect(
      computeDatabaseEventTriggerConditionFromFilter({
        eventName: 'company',
        filter: buildFilter({
          type: 'TEXT',
          operand: ViewFilterOperand.IS,
          value: 'Acme',
          path: 'name',
        }),
        fields: FIELDS,
      }),
    ).toBeUndefined();
  });
});
