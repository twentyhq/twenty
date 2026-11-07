import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getWorkflowRecordKeysByFieldReference } from 'src/modules/workflow/workflow-executor/utils/get-workflow-record-keys-by-field-reference.util';

const TASK_OBJECT_METADATA_ID = 'task-object-metadata-id';
const PERSON_OBJECT_METADATA_ID = 'person-object-metadata-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';
const MORPH_ID = 'target-morph-id';

const MANY_TO_ONE_SETTINGS = { relationType: RelationType.MANY_TO_ONE };

const titleFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'title-field-metadata-id',
  objectMetadataId: TASK_OBJECT_METADATA_ID,
  universalIdentifier: 'title-field-universal-identifier',
  name: 'title',
  type: FieldMetadataType.TEXT,
});

const assigneeFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'assignee-field-metadata-id',
  objectMetadataId: TASK_OBJECT_METADATA_ID,
  universalIdentifier: 'assignee-field-universal-identifier',
  name: 'assignee',
  type: FieldMetadataType.RELATION,
  settings: MANY_TO_ONE_SETTINGS,
  relationTargetObjectMetadataId: 'workspace-member-object-metadata-id',
});

const targetHeadFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'target-head-field-metadata-id',
  objectMetadataId: TASK_OBJECT_METADATA_ID,
  universalIdentifier: MORPH_ID,
  morphId: MORPH_ID,
  name: 'target',
  type: FieldMetadataType.MORPH_RELATION,
  settings: MANY_TO_ONE_SETTINGS,
  universalSettings: MANY_TO_ONE_SETTINGS,
});

const buildMorphTargetFlatFieldMetadata = ({
  name,
  relationTargetObjectMetadataId,
}: {
  name: string;
  relationTargetObjectMetadataId: string;
}) =>
  getFlatFieldMetadataMock({
    id: `${name}-field-metadata-id`,
    objectMetadataId: TASK_OBJECT_METADATA_ID,
    universalIdentifier: `${name}-field-universal-identifier`,
    morphId: MORPH_ID,
    name,
    type: FieldMetadataType.MORPH_RELATION,
    settings: MANY_TO_ONE_SETTINGS,
    universalSettings: MANY_TO_ONE_SETTINGS,
    relationTargetObjectMetadataId,
  });

const targetPersonFlatFieldMetadata = buildMorphTargetFlatFieldMetadata({
  name: 'targetPerson',
  relationTargetObjectMetadataId: PERSON_OBJECT_METADATA_ID,
});

const targetCompanyFlatFieldMetadata = buildMorphTargetFlatFieldMetadata({
  name: 'targetCompany',
  relationTargetObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
});

const taskFieldFlatMetadatas = [
  titleFlatFieldMetadata,
  assigneeFlatFieldMetadata,
  targetHeadFlatFieldMetadata,
  targetPersonFlatFieldMetadata,
  targetCompanyFlatFieldMetadata,
];

const taskFlatObjectMetadata = getFlatObjectMetadataMock({
  id: TASK_OBJECT_METADATA_ID,
  universalIdentifier: 'task-object-universal-identifier',
  nameSingular: 'task',
  namePlural: 'tasks',
  fieldIds: taskFieldFlatMetadatas.map(({ id }) => id),
});

const objectMetadataInfo: ObjectMetadataInfo = {
  flatObjectMetadata: taskFlatObjectMetadata,
  flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: taskFieldFlatMetadatas,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
  flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [
      taskFlatObjectMetadata,
      getFlatObjectMetadataMock({
        id: PERSON_OBJECT_METADATA_ID,
        universalIdentifier: 'person-object-universal-identifier',
        nameSingular: 'person',
        namePlural: 'people',
      }),
      getFlatObjectMetadataMock({
        id: COMPANY_OBJECT_METADATA_ID,
        universalIdentifier: 'company-object-universal-identifier',
        nameSingular: 'company',
        namePlural: 'companies',
      }),
    ],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
};

describe('getWorkflowRecordKeysByFieldReference', () => {
  const recordKeysByFieldReference =
    getWorkflowRecordKeysByFieldReference(objectMetadataInfo);

  it('maps a many-to-one relation by name or join column to both keys', () => {
    expect(recordKeysByFieldReference.get('assignee')).toEqual([
      'assignee',
      'assigneeId',
    ]);
    expect(recordKeysByFieldReference.get('assigneeId')).toEqual([
      'assignee',
      'assigneeId',
    ]);
  });

  it('maps a morph target by name or join column to its keys and morph name', () => {
    expect(recordKeysByFieldReference.get('targetPerson')).toEqual([
      'target',
      'targetPerson',
      'targetPersonId',
    ]);
    expect(recordKeysByFieldReference.get('targetCompanyId')).toEqual([
      'target',
      'targetCompany',
      'targetCompanyId',
    ]);
  });

  it('maps a morph name to the keys of all its targets', () => {
    expect(recordKeysByFieldReference.get('target')).toEqual([
      'target',
      'targetPerson',
      'targetPersonId',
      'targetCompany',
      'targetCompanyId',
    ]);
  });
});
