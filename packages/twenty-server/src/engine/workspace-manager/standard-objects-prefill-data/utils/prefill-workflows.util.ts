import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';
import { getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionIds } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflow-code-step-logic-functions.util';

export const QUICK_LEAD_WORKFLOW_ID = '8b213cac-a68b-4ffe-817a-3ec994e9932d';
export const QUICK_LEAD_WORKFLOW_VERSION_ID =
  'ac67974f-c524-4288-9d88-af8515400b68';
export const CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_ID =
  '887c6c06-fbc5-4b45-8d6b-f7b6b0f40b12';
export const CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_VERSION_ID =
  '0f276d7e-a950-41ab-ad98-35e80753dc58';
export const CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_AUTOMATED_TRIGGER_ID =
  'c54f5990-13a3-4c3b-b75d-df09e7843036';

export const prefillWorkflows = async (
  entityManager: EntityManager,
  workspaceId: string,
  schemaName: string,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) => {
  const {
    extractDomainLogicFunctionId,
    findMatchingCompanyByDomainLogicFunctionId,
    isPersonalEmailLogicFunctionId,
  } = getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionIds(workspaceId);

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

  const companyObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: companyObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const personObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: personObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(companyObjectMetadata) || !isDefined(personObjectMetadata)) {
    throw new Error('Company or person object metadata not found');
  }

  const companyDomainNameFieldMetadata = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).find(
    (fieldMetadata) =>
      fieldMetadata?.objectMetadataId === companyObjectMetadataId &&
      fieldMetadata?.name === 'domainName',
  );

  if (!isDefined(companyDomainNameFieldMetadata)) {
    throw new Error('Company domainName field metadata not found');
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
      {
        id: CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_ID,
        name: 'Create company when adding a new person',
        lastPublishedVersionId:
          CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_VERSION_ID,
        statuses: ['ACTIVE'],
        position: 2,
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
                  companyId: '{{0715b6cd-7cc1-4b98-971b-00f54dfe643b.id}}',
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
      {
        id: CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_VERSION_ID,
        name: 'v1',
        trigger: JSON.stringify({
          name: 'Record is created or updated',
          type: 'DATABASE_EVENT',
          settings: {
            eventName: 'person.upserted',
            fields: ['emails'],
            outputSchema: generateFakeObjectRecordEvent(
              {
                flatObjectMetadata: personObjectMetadata,
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
              },
              DatabaseEventAction.UPSERTED,
            ),
          },
          nextStepIds: ['c30d7cbe-00e0-4966-bc1a-99b0a11a2cca'],
        }),
        steps: JSON.stringify([
          {
            id: 'c30d7cbe-00e0-4966-bc1a-99b0a11a2cca',
            name: 'Is this a personal email?',
            type: 'CODE',
            valid: false,
            position: {
              x: 227.25,
              y: 130,
            },
            settings: {
              input: {
                logicFunctionId: isPersonalEmailLogicFunctionId,
                logicFunctionInput: {
                  primaryEmail:
                    '{{trigger.properties.after.emails.primaryEmail}}',
                },
              },
              outputSchema: {
                isPersonal: {
                  type: 'boolean',
                  label: 'isPersonal',
                  value: true,
                  isLeaf: true,
                },
              },
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['01f3db05-aae5-4e4b-b361-96684f09c704'],
          },
          {
            id: '01f3db05-aae5-4e4b-b361-96684f09c704',
            name: 'If business email',
            type: 'FILTER',
            valid: false,
            position: {
              x: 249.25,
              y: 260,
            },
            settings: {
              input: {
                stepFilters: [
                  {
                    id: '0e595385-9e18-4869-abfd-cf72952b124c',
                    type: 'boolean',
                    value: 'false',
                    operand: 'IS',
                    isFullRecord: false,
                    stepOutputKey:
                      '{{c30d7cbe-00e0-4966-bc1a-99b0a11a2cca.isPersonal}}',
                    stepFilterGroupId: '5204d5f5-7b23-428c-9f84-c37971d497d3',
                    positionInStepFilterGroup: 0,
                  },
                ],
                stepFilterGroups: [
                  {
                    id: '5204d5f5-7b23-428c-9f84-c37971d497d3',
                    logicalOperator: 'AND',
                  },
                ],
              },
              outputSchema: {},
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['1b01193b-8300-4d79-940b-44464bf45505'],
          },
          {
            id: '1b01193b-8300-4d79-940b-44464bf45505',
            name: 'Extract domain from email',
            type: 'CODE',
            valid: false,
            position: {
              x: 219.75,
              y: 390,
            },
            settings: {
              input: {
                logicFunctionId: extractDomainLogicFunctionId,
                logicFunctionInput: {
                  email: '{{trigger.properties.after.emails.primaryEmail}}',
                },
              },
              outputSchema: {
                url: {
                  icon: 'IconVariable',
                  type: 'string',
                  label: 'url',
                  value: 'https://twenty.com',
                  isLeaf: true,
                },
                domain: {
                  icon: 'IconVariable',
                  type: 'string',
                  label: 'domain',
                  value: 'twenty.com',
                  isLeaf: true,
                },
              },
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['becb3acf-79bb-4672-8a42-3696e94957b5'],
          },
          {
            id: 'becb3acf-79bb-4672-8a42-3696e94957b5',
            name: 'Search Company',
            type: 'FIND_RECORDS',
            valid: false,
            position: {
              x: 247.75,
              y: 520,
            },
            settings: {
              input: {
                limit: 25,
                filter: {
                  recordFilters: [
                    {
                      id: 'a9b917a0-5c4c-4e8f-bf91-160d0b888693',
                      type: 'LINKS',
                      label: 'Domain Name',
                      value: '{{1b01193b-8300-4d79-940b-44464bf45505.domain}}',
                      operand: 'CONTAINS',
                      displayValue:
                        '{{1b01193b-8300-4d79-940b-44464bf45505.domain}}',
                      subFieldName: 'primaryLinkUrl',
                      fieldMetadataId: companyDomainNameFieldMetadata.id,
                      recordFilterGroupId:
                        '194e151c-cf46-4e8f-a48b-649c36082dfa',
                    },
                  ],
                  recordFilterGroups: [
                    {
                      id: '194e151c-cf46-4e8f-a48b-649c36082dfa',
                      logicalOperator: 'AND',
                    },
                  ],
                },
                objectName: 'company',
              },
              outputSchema: {},
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['9d0b6ef2-aad2-4853-92e1-95f2abf10d5b'],
          },
          {
            id: '9d0b6ef2-aad2-4853-92e1-95f2abf10d5b',
            name: 'Find exact company match',
            type: 'CODE',
            valid: false,
            position: {
              x: 247.75,
              y: 650,
            },
            settings: {
              input: {
                logicFunctionId: findMatchingCompanyByDomainLogicFunctionId,
                logicFunctionInput: {
                  companies: '{{becb3acf-79bb-4672-8a42-3696e94957b5.all}}',
                  domain: '{{1b01193b-8300-4d79-940b-44464bf45505.domain}}',
                },
              },
              outputSchema: {
                companyId: {
                  type: 'string',
                  label: 'companyId',
                  value: '00000000-0000-0000-0000-000000000000',
                  isLeaf: true,
                },
                hasMatch: {
                  type: 'boolean',
                  label: 'hasMatch',
                  value: true,
                  isLeaf: true,
                },
              },
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['0c99a900-656a-40e8-977e-5a7357be33b9'],
          },
          {
            id: '0c99a900-656a-40e8-977e-5a7357be33b9',
            name: 'If a company already exists',
            type: 'IF_ELSE',
            valid: false,
            position: {
              x: 216.25,
              y: 780,
            },
            settings: {
              input: {
                branches: [
                  {
                    id: '1344c151-15ff-40e2-a1a3-925fabaf5b1c',
                    nextStepIds: ['ffdd4271-75d4-4805-b1f8-2167a113c3b2'],
                    filterGroupId: 'f5c41047-2a6e-49fb-968a-fa7789a90ee5',
                  },
                  {
                    id: 'fe6dd152-1103-4324-af51-3ff994d1f8a7',
                    nextStepIds: ['ddafb9db-a94f-40b9-a5c9-becce857edf7'],
                  },
                ],
                stepFilters: [
                  {
                    id: '290cc6a3-08fd-4be5-b42e-966d0bb90ff7',
                    type: 'boolean',
                    value: 'true',
                    operand: 'IS',
                    isFullRecord: false,
                    stepOutputKey:
                      '{{9d0b6ef2-aad2-4853-92e1-95f2abf10d5b.hasMatch}}',
                    stepFilterGroupId: 'f5c41047-2a6e-49fb-968a-fa7789a90ee5',
                    positionInStepFilterGroup: 0,
                  },
                ],
                stepFilterGroups: [
                  {
                    id: 'f5c41047-2a6e-49fb-968a-fa7789a90ee5',
                    logicalOperator: 'AND',
                  },
                ],
              },
              outputSchema: {},
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
          },
          {
            id: 'ffdd4271-75d4-4805-b1f8-2167a113c3b2',
            name: 'Attach person to existing company',
            type: 'UPDATE_RECORD',
            valid: false,
            position: {
              x: 0,
              y: 910,
            },
            settings: {
              input: {
                objectName: 'person',
                objectRecord: {
                  companyId:
                    '{{9d0b6ef2-aad2-4853-92e1-95f2abf10d5b.companyId}}',
                },
                fieldsToUpdate: ['companyId'],
                objectRecordId: '{{trigger.properties.after.id}}',
              },
              outputSchema: {},
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
          },
          {
            id: 'ddafb9db-a94f-40b9-a5c9-becce857edf7',
            name: 'Create a new company',
            type: 'CREATE_RECORD',
            valid: false,
            position: {
              x: 440,
              y: 910,
            },
            settings: {
              input: {
                objectName: 'company',
                objectRecord: {
                  name: '{{1b01193b-8300-4d79-940b-44464bf45505.domain}}',
                  domainName: {
                    primaryLinkUrl:
                      '{{1b01193b-8300-4d79-940b-44464bf45505.url}}',
                    primaryLinkLabel:
                      '{{1b01193b-8300-4d79-940b-44464bf45505.domain}}',
                  },
                },
              },
              outputSchema: {},
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
            nextStepIds: ['d5d5d6e1-391f-4142-83c1-670f7087f079'],
          },
          {
            id: 'd5d5d6e1-391f-4142-83c1-670f7087f079',
            name: 'Attach person to this company',
            type: 'UPDATE_RECORD',
            valid: false,
            position: {
              x: 420.5,
              y: 1040,
            },
            settings: {
              input: {
                objectName: 'person',
                objectRecord: {
                  companyId: '{{ddafb9db-a94f-40b9-a5c9-becce857edf7.id}}',
                },
                fieldsToUpdate: ['companyId'],
                objectRecordId: '{{trigger.properties.after.id}}',
              },
              outputSchema: {},
              errorHandlingOptions: {
                retryOnFailure: {
                  value: false,
                },
                continueOnFailure: {
                  value: false,
                },
              },
            },
            __typename: 'WorkflowAction',
          },
        ]),
        status: 'ACTIVE',
        position: 2,
        workflowId: CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_ID,
      },
    ])
    .returning('*')
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflowAutomatedTrigger`, [
      'id',
      'workflowId',
      'type',
      'settings',
    ])
    .orIgnore()
    .values([
      {
        id: CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_AUTOMATED_TRIGGER_ID,
        workflowId: CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_WORKFLOW_ID,
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'person.upserted',
          fields: ['emails'],
        },
      },
    ])
    .execute();
};
