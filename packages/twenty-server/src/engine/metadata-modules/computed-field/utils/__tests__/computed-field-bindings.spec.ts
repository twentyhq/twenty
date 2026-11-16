import {
  type FieldMetadataComputation,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { type ComputedFieldBindableSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-bindable-schema-field.type';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { computeComputedFieldBindings } from 'src/engine/metadata-modules/computed-field/utils/compute-computed-field-bindings.util';
import { renameComputedFieldComputationFields } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-fields.util';

type TestField = ComputedFieldBindableSchemaField & {
  objectName: string;
  relationType?: RelationType;
  targetObjectName?: string;
  inverseFieldUniversalIdentifier?: string;
};

const { NUMBER, TEXT, CURRENCY, RELATION } = FieldMetadataType;

const FIELDS: TestField[] = [
  { objectName: 'project', name: 'budget', type: NUMBER },
  { objectName: 'project', name: 'amount', type: CURRENCY },
  {
    objectName: 'project',
    name: 'company',
    type: RELATION,
    relationType: RelationType.MANY_TO_ONE,
    targetObjectName: 'company',
  },
  {
    objectName: 'project',
    name: 'tasks',
    type: RELATION,
    relationType: RelationType.ONE_TO_MANY,
    targetObjectName: 'task',
    inverseFieldUniversalIdentifier: 'task.project',
  },
  { objectName: 'company', name: 'name', type: TEXT },
  { objectName: 'task', name: 'points', type: NUMBER },
  { objectName: 'task', name: 'status', type: TEXT },
  {
    objectName: 'task',
    name: 'project',
    type: RELATION,
    relationType: RelationType.MANY_TO_ONE,
    targetObjectName: 'project',
  },
  {
    objectName: 'task',
    name: 'assignee',
    type: RELATION,
    relationType: RelationType.MANY_TO_ONE,
    targetObjectName: 'company',
  },
].map((field) => ({
  ...field,
  universalIdentifier: `${field.objectName}.${field.name}`,
}));

const schemaReader: ComputedFieldSchemaReader<string, TestField> = {
  getObjectName: (objectName) => objectName,
  findFieldByName: (objectName, fieldName) =>
    FIELDS.find(
      (field) => field.objectName === objectName && field.name === fieldName,
    ),
  getRelationType: (field) => field.relationType,
  findRelationTargetObject: (field) => field.targetObjectName,
  findRelationInverseField: (field) =>
    FIELDS.find(
      ({ universalIdentifier }) =>
        universalIdentifier === field.inverseFieldUniversalIdentifier,
    ),
};

const FORMULA: FieldMetadataComputation = {
  kind: 'FORMULA',
  expression:
    "if(company.name == 'budget', budget, amount.amountMicros) + round(budget)",
};

const ROLLUP: FieldMetadataComputation = {
  kind: 'ROLLUP',
  relationFieldName: 'tasks',
  operation: 'SUM',
  expression: 'points',
  filter: "status != 'points' and assignee.name == 'Acme'",
};

const bind = (computation: FieldMetadataComputation) =>
  computeComputedFieldBindings({
    computation,
    object: 'project',
    schemaReader,
  });

describe('computeComputedFieldBindings', () => {
  it('binds every path of a formula, and a composite sub-field to its field', () => {
    expect(bind(FORMULA)).toEqual({
      budget: 'project.budget',
      amount: 'project.amount',
      company: 'project.company',
      'company.name': 'company.name',
    });
  });

  it('roots what a rollup reads at the relation of its own object', () => {
    expect(bind(ROLLUP)).toEqual({
      tasks: 'project.tasks',
      'tasks.points': 'task.points',
      'tasks.status': 'task.status',
      'tasks.assignee': 'task.assignee',
      'tasks.assignee.name': 'company.name',
    });
  });

  it.each(['budget + unknown', 'companyId', 'budget +'])(
    'returns nothing for %s',
    (expression) => {
      expect(bind({ kind: 'FORMULA', expression })).toBeUndefined();
    },
  );
});

describe('renameComputedFieldComputationFields', () => {
  it('rewrites a formula and its bindings, leaving texts and functions alone', () => {
    expect(
      renameComputedFieldComputationFields({
        computation: { ...FORMULA, bindings: bind(FORMULA) },
        fieldNameByUniversalIdentifier: new Map([
          ['project.budget', 'cost'],
          ['project.company', 'account'],
          ['company.name', 'label'],
        ]),
      }),
    ).toEqual({
      kind: 'FORMULA',
      expression:
        "if(account.label == 'budget', cost, amount.amountMicros) + round(cost)",
      bindings: {
        cost: 'project.budget',
        amount: 'project.amount',
        account: 'project.company',
        'account.label': 'company.name',
      },
    });
  });

  it('rewrites the relation, expression, filter and bindings of a rollup', () => {
    expect(
      renameComputedFieldComputationFields({
        computation: { ...ROLLUP, bindings: bind(ROLLUP) },
        fieldNameByUniversalIdentifier: new Map([
          ['project.tasks', 'todos'],
          ['task.points', 'effort'],
          ['company.name', 'label'],
          // Not read by the rollup: same name as a field it reads, on another object
          ['project.budget', 'status'],
        ]),
      }),
    ).toEqual({
      kind: 'ROLLUP',
      relationFieldName: 'todos',
      operation: 'SUM',
      expression: 'effort',
      filter: "status != 'points' and assignee.label == 'Acme'",
      bindings: {
        todos: 'project.tasks',
        'todos.effort': 'task.points',
        'todos.status': 'task.status',
        'todos.assignee': 'task.assignee',
        'todos.assignee.label': 'company.name',
      },
    });
  });

  it('leaves a computation without bindings as written', () => {
    expect(
      renameComputedFieldComputationFields({
        computation: FORMULA,
        fieldNameByUniversalIdentifier: new Map([['project.budget', 'cost']]),
      }),
    ).toBe(FORMULA);
  });
});
