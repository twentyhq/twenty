import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { formatWorkflowRecordRelationFields } from 'src/modules/workflow/workflow-executor/utils/format-workflow-record-relation-fields.util';

const ASSIGNEE_ID = 'e1c3f8a0-0000-4000-8000-000000000000';

const TASK_OBJECT_METADATA_ID = 'task-object-metadata-id';

const assigneeFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'assignee-field-metadata-id',
  objectMetadataId: TASK_OBJECT_METADATA_ID,
  universalIdentifier: 'assignee-field-universal-identifier',
  name: 'assignee',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: 'workspace-member-object-metadata-id',
});

const titleFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'title-field-metadata-id',
  objectMetadataId: TASK_OBJECT_METADATA_ID,
  universalIdentifier: 'title-field-universal-identifier',
  name: 'title',
  type: FieldMetadataType.TEXT,
});

const taskFlatObjectMetadata = getFlatObjectMetadataMock({
  id: TASK_OBJECT_METADATA_ID,
  universalIdentifier: 'task-object-universal-identifier',
  nameSingular: 'task',
  namePlural: 'tasks',
  fieldIds: [assigneeFlatFieldMetadata.id, titleFlatFieldMetadata.id],
});

const objectMetadataInfo: ObjectMetadataInfo = {
  flatObjectMetadata: taskFlatObjectMetadata,
  flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [assigneeFlatFieldMetadata, titleFlatFieldMetadata],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
  flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [taskFlatObjectMetadata],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
};

const format = (record: Record<string, unknown>) =>
  formatWorkflowRecordRelationFields(record, objectMetadataInfo)
    .formattedRecord;

describe('formatWorkflowRecordRelationFields', () => {
  it('maps a relation wrapped as an id object to its join column', () => {
    expect(format({ assignee: { id: ASSIGNEE_ID } })).toEqual({
      assigneeId: ASSIGNEE_ID,
    });
  });

  it.each([[null], [{ id: null }], [{ id: null, name: 'Unassigned' }]])(
    'nullifies the join column when the relation resolves to %p',
    (value) => {
      expect(format({ title: 'Follow up', assignee: value })).toEqual({
        title: 'Follow up',
        assigneeId: null,
      });
    },
  );

  it('keeps an explicitly provided join column over a null relation', () => {
    expect(format({ assignee: { id: null }, assigneeId: ASSIGNEE_ID })).toEqual(
      {
        assigneeId: ASSIGNEE_ID,
      },
    );
  });

  it('writes no join column when the relation id is undefined', () => {
    expect(Object.keys(format({ assignee: { id: undefined } }))).toEqual([
      'assignee',
    ]);
  });

  it('keeps an empty id so it is rejected downstream', () => {
    expect(format({ assignee: { id: '' } })).toEqual({ assigneeId: '' });
  });

  it('leaves nested relation operations untouched', () => {
    const record = { assignee: { connect: { where: { id: ASSIGNEE_ID } } } };

    expect(format(record)).toEqual(record);
  });

  it('leaves non-relation fields untouched', () => {
    expect(format({ title: null })).toEqual({ title: null });
  });
});
