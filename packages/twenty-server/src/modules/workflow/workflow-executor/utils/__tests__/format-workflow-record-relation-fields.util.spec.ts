import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { formatWorkflowRecordRelationFields } from 'src/modules/workflow/workflow-executor/utils/format-workflow-record-relation-fields.util';

const RELATION_FIELD_NAMES = ['assignee'];
const TEXT_FIELD_NAMES = ['title'];

const buildObjectMetadataInfo = (): ObjectMetadataInfo => {
  const fieldNames = [...RELATION_FIELD_NAMES, ...TEXT_FIELD_NAMES];

  const buildField = (name: string) =>
    RELATION_FIELD_NAMES.includes(name)
      ? {
          id: `field-${name}`,
          universalIdentifier: `field-uid-${name}`,
          name,
          type: FieldMetadataType.RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
          relationTargetObjectMetadataId: 'target-object-id',
        }
      : {
          id: `field-${name}`,
          universalIdentifier: `field-uid-${name}`,
          name,
          type: FieldMetadataType.TEXT,
          settings: {},
        };

  return {
    flatObjectMetadata: {
      id: 'object-id',
      universalIdentifier: 'object-uid',
      nameSingular: 'task',
      namePlural: 'tasks',
      fieldIds: fieldNames.map((name) => `field-${name}`),
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        fieldNames.map((name) => [`field-uid-${name}`, buildField(name)]),
      ),
      universalIdentifierById: Object.fromEntries(
        fieldNames.map((name) => [`field-${name}`, `field-uid-${name}`]),
      ),
      universalIdentifiersByApplicationId: {},
    },
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
  } as unknown as ObjectMetadataInfo;
};

const format = (record: Record<string, unknown>) =>
  formatWorkflowRecordRelationFields(record, buildObjectMetadataInfo())
    .formattedRecord;

describe('formatWorkflowRecordRelationFields', () => {
  it('maps a legacy relation object to its join column', () => {
    expect(
      format({ assignee: { id: 'e1c3f8a0-0000-4000-8000-000000000000' } }),
    ).toEqual({
      assigneeId: 'e1c3f8a0-0000-4000-8000-000000000000',
    });
  });

  it.each([[null], [{ id: null }], [{ id: undefined }], [{ id: '' }]])(
    'nullifies the join column when the relation resolves to %p',
    (value) => {
      expect(format({ title: 'Follow up', assignee: value })).toEqual({
        title: 'Follow up',
        assigneeId: null,
      });
    },
  );

  it('keeps an explicitly provided join column over an empty relation', () => {
    expect(
      format({
        assignee: { id: null },
        assigneeId: 'e1c3f8a0-0000-4000-8000-000000000000',
      }),
    ).toEqual({ assigneeId: 'e1c3f8a0-0000-4000-8000-000000000000' });
  });

  it('leaves nested relation operations untouched', () => {
    const record = {
      assignee: {
        connect: { where: { id: 'e1c3f8a0-0000-4000-8000-000000000000' } },
      },
    };

    expect(format(record)).toEqual(record);
  });

  it('leaves non-relation fields untouched', () => {
    expect(format({ title: null })).toEqual({ title: null });
  });
});
