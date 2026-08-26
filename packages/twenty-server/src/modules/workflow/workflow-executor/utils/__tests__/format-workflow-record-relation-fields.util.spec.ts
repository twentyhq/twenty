import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { formatWorkflowRecordRelationFields } from 'src/modules/workflow/workflow-executor/utils/format-workflow-record-relation-fields.util';

const TITLE_FIELD_ID = '20202020-0000-4000-8000-000000000001';
const ASSIGNEE_FIELD_ID = '20202020-0000-4000-8000-000000000002';
const TASK_OBJECT_ID = '20202020-0000-4000-8000-000000000003';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000004';

const titleField = getFlatFieldMetadataMock({
  universalIdentifier: 'task-title',
  objectMetadataId: TASK_OBJECT_ID,
  id: TITLE_FIELD_ID,
  name: 'title',
  type: FieldMetadataType.TEXT,
});

const assigneeField = getFlatFieldMetadataMock<FieldMetadataType.RELATION>({
  universalIdentifier: 'task-assignee',
  objectMetadataId: TASK_OBJECT_ID,
  id: ASSIGNEE_FIELD_ID,
  name: 'assignee',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const taskObject = getFlatObjectMetadataMock({
  universalIdentifier: 'task',
  id: TASK_OBJECT_ID,
  nameSingular: 'task',
  namePlural: 'tasks',
  fieldIds: [TITLE_FIELD_ID, ASSIGNEE_FIELD_ID],
});

const buildFlatFieldMetadataMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier: Record<string, FlatFieldMetadata> = {};
  const universalIdentifierById: Record<string, string> = {};

  for (const field of fields) {
    byUniversalIdentifier[field.universalIdentifier] = field;
    universalIdentifierById[field.id] = field.universalIdentifier;
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById,
    universalIdentifiersByApplicationId: {},
  };
};

const objectMetadataInfo: ObjectMetadataInfo = {
  flatObjectMetadata: taskObject,
  flatObjectMetadataMaps:
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
    titleField,
    assigneeField,
  ]),
};

const format = (record: Record<string, unknown>) =>
  formatWorkflowRecordRelationFields(record, objectMetadataInfo)
    .formattedRecord;

describe('formatWorkflowRecordRelationFields', () => {
  it('maps a relation wrapper to its join column', () => {
    expect(
      format({ title: 'Follow up', assignee: { id: WORKSPACE_MEMBER_ID } }),
    ).toEqual({
      title: 'Follow up',
      assigneeId: WORKSPACE_MEMBER_ID,
    });
  });

  it.each([
    ['a null relation', null],
    ['a wrapper whose variable resolved to null', { id: null }],
    ['a wrapper whose variable resolved to nothing', { id: undefined }],
  ])('clears the join column for %s', (_, assignee) => {
    expect(format({ title: 'Follow up', assignee })).toEqual({
      title: 'Follow up',
      assigneeId: null,
    });
  });

  it('keeps an explicit join column over an empty relation wrapper', () => {
    expect(
      format({ assignee: { id: null }, assigneeId: WORKSPACE_MEMBER_ID }),
    ).toEqual({ assigneeId: WORKSPACE_MEMBER_ID });
  });

  it('leaves a value that is not a relation wrapper untouched', () => {
    expect(format({ assignee: { connect: { where: { id: '1' } } } })).toEqual({
      assignee: { connect: { where: { id: '1' } } },
    });
  });

  it('leaves a non-relation field holding null untouched', () => {
    expect(format({ title: null })).toEqual({ title: null });
  });
});
