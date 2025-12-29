import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

const QUICK_LEAD_WORKFLOW_ID = '8b213cac-a68b-4ffe-817a-3ec994e9932d';
const QUICK_LEAD_WORKFLOW_VERSION_ID = 'ac67974f-c524-4288-9d88-af8515400b68';

export const prefillWorkflows = async (
  entityManager: EntityManager,
  schemaName: string,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) => {
  const { idByNameSingular: objectIdByNameSingular } = buildObjectIdByNameMaps(
    flatObjectMetadataMaps,
  );

  const companyObjectMetadataId = objectIdByNameSingular['company'];
  const personObjectMetadataId = objectIdByNameSingular['person'];

  if (
    !isDefined(companyObjectMetadataId) ||
    !isDefined(personObjectMetadataId)
  ) {
    throw new Error('Company or person object metadata not found');
  }

  const companyObjectMetadata =
    flatObjectMetadataMaps.byId[companyObjectMetadataId];

  const personObjectMetadata =
    flatObjectMetadataMaps.byId[personObjectMetadataId];

  if (!isDefined(companyObjectMetadata) || !isDefined(personObjectMetadata)) {
    throw new Error('Company or person object metadata not found');
  }

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflow`, [
      'id',
      'name',
      'lastPublishedVersionId',
      'statuses',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'createdByContext',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
    ])
    .orIgnore()
    .values([
      {
        id: QUICK_LEAD_WORKFLOW_ID,
        name: 'Quick Lead',
        lastPublishedVersionId: QUICK_LEAD_WORKFLOW_VERSION_ID,
        statuses: ['ACTIVE'],
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        createdByContext: {},
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
    ])
    .returning('*')
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflowVersion`, [
      'id',
      'name',
      'trigger',
      'steps',
      'status',
      'position',
      'workflowId',
    ])
    .orIgnore()
    .values([
      {
        id: QUICK_LEAD_WORKFLOW_VERSION_ID,
        name: 'v1',
        trigger: JSON.stringify({
          name: 'Launch manually',
          type: 'MANUAL',
          settings: {
            outputSchema: {},
            icon: 'IconUserPlus',
            availability: { type: 'GLOBAL', locations: undefined },
          },
          nextStepIds: ['6e089bc9-aabd-435f-865f-f31c01c8f4a7'],
        }),
        steps: JSON.stringify([
          {
            id: '6e089bc9-aabd-435f-865f-f31c01c8f4a7',
            name: 'Quick Lead Form',
            type: 'FORM',
            valid: false,
            settings: {
              input: [
                {
                  id: '14d669f0-5249-4fa4-b0bb-f8bd408328d5',
                  name: 'firstName',
                  type: 'TEXT',
                  label: 'First name',
                  placeholder: 'Tim',
                },
                {
                  id: '4eb6ce85-d231-4aef-9837-744490c026d0',
                  name: 'lastName',
                  type: 'TEXT',
                  label: 'Last Name',
                  placeholder: 'Apple',
                },
                {
                  id: 'adbf0e9f-1427-49be-b4fb-092b34d97350',
                  name: 'email',
                  type: 'TEXT',
                  label: 'Email',
                  placeholder: 'timapple@apple.com',
                },
                {
                  id: '4ffc7992-9e65-4a4d-9baf-b52e62f2c273',
                  name: 'jobTitle',
                  type: 'TEXT',
                  label: 'Job title',
                  placeholder: 'CEO',
                },
                {
                  id: '42f11926-04ea-4924-94a4-2293cc748362',
                  name: 'companyName',
                  type: 'TEXT',
                  label: 'Company name',
                  placeholder: 'Apple',
                },
                {
                  id: 'd6ca80ee-26cd-466d-91bf-984d7205451c',
                  name: 'companyDomain',
                  type: 'TEXT',
                  label: 'Company domain',
                  placeholder: 'https://www.apple.com',
                },
              ],
              outputSchema: {
                email: {
                  type: 'TEXT',
                  label: 'Email',
                  value: 'My text',
                  isLeaf: true,
                },
                jobTitle: {
                  type: 'TEXT',
                  label: 'Job title',
                  value: 'My text',
                  isLeaf: true,
                },
                lastName: {
                  type: 'TEXT',
                  label: 'Last Name',
                  value: 'My text',
                  isLeaf: true,
                },
                firstName: {
                  type: 'TEXT',
                  label: 'First name',
                  value: 'My text',
                  isLeaf: true,
                },
                companyName: {
                  type: 'TEXT',
                  label: 'Company name',
                  value: 'My text',
                  isLeaf: true,
                },
                companyDomain: {
                  type: 'TEXT',
                  label: 'Company domain',
                  value: 'My text',
                  isLeaf: true,
                },
              },
              errorHandlingOptions: {
                retryOnFailure: { value: false },
                continueOnFailure: { value: false },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['0715b6cd-7cc1-4b98-971b-00f54dfe643b'],
          },
          {
            id: '0715b6cd-7cc1-4b98-971b-00f54dfe643b',
            name: 'Create Company',
            type: 'CREATE_RECORD',
            valid: false,
            settings: {
              input: {
                objectName: 'company',
                objectRecord: {
                  name: '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.companyName}}',
                  domainName: {
                    primaryLinkUrl:
                      '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.companyDomain}}',
                    primaryLinkLabel: '',
                  },
                },
              },
              outputSchema: {
                object: {
                  icon: 'IconBuildingSkyscraper',
                  label: 'Company',
                  value: 'A company',
                  isLeaf: true,
                  fieldIdName: 'id',
                  nameSingular: 'company',
                },
                _outputSchemaType: 'RECORD',
                fields: generateObjectRecordFields({
                  objectMetadataInfo: {
                    flatObjectMetadata: companyObjectMetadata,
                    flatObjectMetadataMaps,
                    flatFieldMetadataMaps,
                  },
                }),
              },
              errorHandlingOptions: {
                retryOnFailure: { value: false },
                continueOnFailure: { value: false },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['6f553ea7-b00e-4371-9d88-d8298568a246'],
          },
          {
            id: '6f553ea7-b00e-4371-9d88-d8298568a246',
            name: 'Create Person',
            type: 'CREATE_RECORD',
            valid: false,
            settings: {
              input: {
                objectName: 'person',
                objectRecord: {
                  name: {
                    lastName:
                      '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.lastName}}',
                    firstName:
                      '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.firstName}}',
                  },
                  emails: {
                    primaryEmail:
                      '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.email}}',
                    additionalEmails: [],
                  },
                  company: {
                    id: '{{0715b6cd-7cc1-4b98-971b-00f54dfe643b.id}}',
                  },
                },
              },
              outputSchema: {
                fields: generateObjectRecordFields({
                  objectMetadataInfo: {
                    flatObjectMetadata: personObjectMetadata,
                    flatObjectMetadataMaps,
                    flatFieldMetadataMaps,
                  },
                }),
              },
              errorHandlingOptions: {
                retryOnFailure: { value: false },
                continueOnFailure: { value: false },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: null,
          },
        ]),
        status: 'ACTIVE',
        position: 1,
        workflowId: QUICK_LEAD_WORKFLOW_ID,
      },
    ])
    .returning('*')
    .execute();
};
