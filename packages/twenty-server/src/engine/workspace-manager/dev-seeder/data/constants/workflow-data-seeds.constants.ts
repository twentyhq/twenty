import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type WorkflowDataSeed = {
  id: string;
  name: string;
  lastPublishedVersionId: string;
  statuses: WorkflowStatus[];
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  createdByContext: object;
};

type WorkflowVersionDataSeed = {
  id: string;
  name: string;
  trigger: string;
  steps: string;
  status: WorkflowVersionStatus;
  position: number;
  workflowId: string;
};

export const WORKFLOW_DATA_SEED_COLUMNS: (keyof WorkflowDataSeed)[] = [
  'id',
  'name',
  'lastPublishedVersionId',
  'statuses',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'createdByContext',
];

export const WORKFLOW_VERSION_DATA_SEED_COLUMNS: (keyof WorkflowVersionDataSeed)[] =
  ['id', 'name', 'trigger', 'steps', 'status', 'position', 'workflowId'];

export const WORKFLOW_DATA_SEED_IDS = {
  ID_1: '20202020-8532-47bd-a4fe-2c1e5c4aeed3',
};

export const WORKFLOW_VERSION_DATA_SEED_IDS = {
  ID_1: '20202020-9cd5-44a8-8b2f-1160b01f06dd',
};

export const WORKFLOW_DATA_SEEDS: WorkflowDataSeed[] = [
  {
    id: WORKFLOW_DATA_SEED_IDS.ID_1,
    name: 'Quick Lead',
    lastPublishedVersionId: WORKFLOW_VERSION_DATA_SEED_IDS.ID_1,
    statuses: [WorkflowStatus.ACTIVE],
    position: 1,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
    createdByContext: {},
  },
];

export const WORKFLOW_VERSION_DATA_SEEDS: WorkflowVersionDataSeed[] = [
  {
    id: WORKFLOW_VERSION_DATA_SEED_IDS.ID_1,
    name: 'v1',
    trigger: JSON.stringify({
      name: 'Launch manually',
      type: 'MANUAL',
      position: {
        x: 0,
        y: 0,
      },
      settings: { outputSchema: {} },
      nextStepIds: ['6e089bc9-aabd-435f-865f-f31c01c8f4a7'],
    }),
    steps: JSON.stringify([
      {
        id: '6e089bc9-aabd-435f-865f-f31c01c8f4a7',
        name: 'Quick Lead Form',
        type: 'FORM',
        valid: false,
        position: {
          x: 0,
          y: 141,
        },
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
        position: {
          x: 0.5,
          y: 282,
        },
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
            fields: {
              id: {
                icon: 'Icon123',
                type: 'UUID',
                label: 'Id',
                value: '123e4567-e89b-12d3-a456-426614174000',
                isLeaf: true,
              },
              name: {
                icon: 'IconBuildingSkyscraper',
                type: 'TEXT',
                label: 'Name',
                value: 'My text',
                isLeaf: true,
              },
              xLink: {
                icon: 'IconBrandX',
                label: 'X',
                value: {
                  primaryLinkUrl: {
                    type: 'TEXT',
                    label: ' Primary Link Url',
                    value: 'My text',
                    isLeaf: true,
                  },
                  secondaryLinks: {
                    type: 'RAW_JSON',
                    label: ' Secondary Links',
                    value: null,
                    isLeaf: true,
                  },
                  primaryLinkLabel: {
                    type: 'TEXT',
                    label: ' Primary Link Label',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              address: {
                icon: 'IconMap',
                label: 'Address',
                value: {
                  addressLat: {
                    type: 'NUMERIC',
                    label: ' Address Lat',
                    value: null,
                    isLeaf: true,
                  },
                  addressLng: {
                    type: 'NUMERIC',
                    label: ' Address Lng',
                    value: null,
                    isLeaf: true,
                  },
                  addressCity: {
                    type: 'TEXT',
                    label: ' Address City',
                    value: 'My text',
                    isLeaf: true,
                  },
                  addressState: {
                    type: 'TEXT',
                    label: ' Address State',
                    value: 'My text',
                    isLeaf: true,
                  },
                  addressCountry: {
                    type: 'TEXT',
                    label: ' Address Country',
                    value: 'My text',
                    isLeaf: true,
                  },
                  addressStreet1: {
                    type: 'TEXT',
                    label: ' Address Street1',
                    value: 'My text',
                    isLeaf: true,
                  },
                  addressStreet2: {
                    type: 'TEXT',
                    label: ' Address Street2',
                    value: 'My text',
                    isLeaf: true,
                  },
                  addressPostcode: {
                    type: 'TEXT',
                    label: ' Address Postcode',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              createdAt: {
                icon: 'IconCalendar',
                type: 'DATE_TIME',
                label: 'Creation date',
                value: '01/23/2025 15:16',
                isLeaf: true,
              },
              createdBy: {
                icon: 'IconCreativeCommonsSa',
                label: 'Created by',
                value: {
                  name: {
                    type: 'TEXT',
                    label: ' Name',
                    value: 'My text',
                    isLeaf: true,
                  },
                  source: {
                    type: 'SELECT',
                    label: ' Source',
                    value: null,
                    isLeaf: true,
                  },
                  context: {
                    type: 'RAW_JSON',
                    label: ' Context',
                    value: null,
                    isLeaf: true,
                  },
                  workspaceMemberId: {
                    type: 'UUID',
                    label: ' Workspace Member Id',
                    value: '123e4567-e89b-12d3-a456-426614174000',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              deletedAt: {
                icon: 'IconCalendarMinus',
                type: 'DATE_TIME',
                label: 'Deleted at',
                value: '01/23/2025 15:16',
                isLeaf: true,
              },
              employees: {
                icon: 'IconUsers',
                type: 'NUMBER',
                label: 'Employees',
                value: 20,
                isLeaf: true,
              },
              updatedAt: {
                icon: 'IconCalendarClock',
                type: 'DATE_TIME',
                label: 'Last update',
                value: '01/23/2025 15:16',
                isLeaf: true,
              },
              domainName: {
                icon: 'IconLink',
                label: 'Domain Name',
                value: {
                  primaryLinkUrl: {
                    type: 'TEXT',
                    label: ' Primary Link Url',
                    value: 'My text',
                    isLeaf: true,
                  },
                  secondaryLinks: {
                    type: 'RAW_JSON',
                    label: ' Secondary Links',
                    value: null,
                    isLeaf: true,
                  },
                  primaryLinkLabel: {
                    type: 'TEXT',
                    label: ' Primary Link Label',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              accountOwner: {
                icon: 'IconUserCircle',
                label: 'Account Owner',
                value: {
                  id: {
                    icon: 'Icon123',
                    type: 'UUID',
                    label: 'Id',
                    value: '123e4567-e89b-12d3-a456-426614174000',
                    isLeaf: true,
                  },
                  name: {
                    icon: 'IconCircleUser',
                    label: 'Name',
                    value: {
                      lastName: {
                        type: 'TEXT',
                        label: ' Last Name',
                        value: 'My text',
                        isLeaf: true,
                      },
                      firstName: {
                        type: 'TEXT',
                        label: ' First Name',
                        value: 'My text',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                  createdAt: {
                    icon: 'IconCalendar',
                    type: 'DATE_TIME',
                    label: 'Creation date',
                    value: '01/23/2025 15:16',
                    isLeaf: true,
                  },
                  deletedAt: {
                    icon: 'IconCalendarMinus',
                    type: 'DATE_TIME',
                    label: 'Deleted at',
                    value: '01/23/2025 15:16',
                    isLeaf: true,
                  },
                  updatedAt: {
                    icon: 'IconCalendarClock',
                    type: 'DATE_TIME',
                    label: 'Last update',
                    value: '01/23/2025 15:16',
                    isLeaf: true,
                  },
                  userEmail: {
                    icon: 'IconMail',
                    type: 'TEXT',
                    label: 'User Email',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              linkedinLink: {
                icon: 'IconBrandLinkedin',
                label: 'Linkedin',
                value: {
                  primaryLinkUrl: {
                    type: 'TEXT',
                    label: ' Primary Link Url',
                    value: 'My text',
                    isLeaf: true,
                  },
                  secondaryLinks: {
                    type: 'RAW_JSON',
                    label: ' Secondary Links',
                    value: null,
                    isLeaf: true,
                  },
                  primaryLinkLabel: {
                    type: 'TEXT',
                    label: ' Primary Link Label',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              idealCustomerProfile: {
                icon: 'IconTarget',
                type: 'BOOLEAN',
                label: 'ICP',
                value: true,
                isLeaf: true,
              },
              annualRecurringRevenue: {
                icon: 'IconMoneybag',
                label: 'ARR',
                value: {
                  amountMicros: {
                    type: 'NUMERIC',
                    label: ' Amount Micros',
                    value: null,
                    isLeaf: true,
                  },
                  currencyCode: {
                    type: 'TEXT',
                    label: ' Currency Code',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
            },
            object: {
              icon: 'IconBuildingSkyscraper',
              label: 'Company',
              value: 'A company',
              isLeaf: true,
              fieldIdName: 'id',
              nameSingular: 'company',
            },
            _outputSchemaType: 'RECORD',
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
        position: {
          x: 8.5,
          y: 423,
        },
        settings: {
          input: {
            objectName: 'person',
            objectRecord: {
              name: {
                lastName: '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.lastName}}',
                firstName: '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.firstName}}',
              },
              emails: {
                primaryEmail: '{{6e089bc9-aabd-435f-865f-f31c01c8f4a7.email}}',
                additionalEmails: [],
              },
              company: {
                id: '{{0715b6cd-7cc1-4b98-971b-00f54dfe643b.id}}',
              },
            },
          },
          outputSchema: {
            fields: {
              id: {
                icon: 'Icon123',
                type: 'UUID',
                label: 'Id',
                value: '123e4567-e89b-12d3-a456-426614174000',
                isLeaf: true,
              },
              city: {
                icon: 'IconMap',
                type: 'TEXT',
                label: 'City',
                value: 'My text',
                isLeaf: true,
              },
              name: {
                icon: 'IconUser',
                label: 'Name',
                value: {
                  lastName: {
                    type: 'TEXT',
                    label: ' Last Name',
                    value: 'My text',
                    isLeaf: true,
                  },
                  firstName: {
                    type: 'TEXT',
                    label: ' First Name',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              xLink: {
                icon: 'IconBrandX',
                label: 'X',
                value: {
                  primaryLinkUrl: {
                    type: 'TEXT',
                    label: ' Primary Link Url',
                    value: 'My text',
                    isLeaf: true,
                  },
                  secondaryLinks: {
                    type: 'RAW_JSON',
                    label: ' Secondary Links',
                    value: null,
                    isLeaf: true,
                  },
                  primaryLinkLabel: {
                    type: 'TEXT',
                    label: ' Primary Link Label',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              emails: {
                icon: 'IconMail',
                label: 'Emails',
                value: {
                  primaryEmail: {
                    type: 'TEXT',
                    label: ' Primary Email',
                    value: 'My text',
                    isLeaf: true,
                  },
                  additionalEmails: {
                    type: 'RAW_JSON',
                    label: ' Additional Emails',
                    value: null,
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              phones: {
                icon: 'IconPhone',
                label: 'Phones',
                value: {
                  additionalPhones: {
                    type: 'RAW_JSON',
                    label: ' Additional Phones',
                    value: null,
                    isLeaf: true,
                  },
                  primaryPhoneNumber: {
                    type: 'TEXT',
                    label: ' Primary Phone Number',
                    value: 'My text',
                    isLeaf: true,
                  },
                  primaryPhoneCallingCode: {
                    type: 'TEXT',
                    label: ' Primary Phone Calling Code',
                    value: 'My text',
                    isLeaf: true,
                  },
                  primaryPhoneCountryCode: {
                    type: 'TEXT',
                    label: ' Primary Phone Country Code',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              company: {
                icon: 'IconBuildingSkyscraper',
                label: 'Company',
                value: {
                  id: {
                    icon: 'Icon123',
                    type: 'UUID',
                    label: 'Id',
                    value: '123e4567-e89b-12d3-a456-426614174000',
                    isLeaf: true,
                  },
                  name: {
                    icon: 'IconBuildingSkyscraper',
                    type: 'TEXT',
                    label: 'Name',
                    value: 'My text',
                    isLeaf: true,
                  },
                  xLink: {
                    icon: 'IconBrandX',
                    label: 'X',
                    value: {
                      primaryLinkUrl: {
                        type: 'TEXT',
                        label: ' Primary Link Url',
                        value: 'My text',
                        isLeaf: true,
                      },
                      secondaryLinks: {
                        type: 'RAW_JSON',
                        label: ' Secondary Links',
                        value: null,
                        isLeaf: true,
                      },
                      primaryLinkLabel: {
                        type: 'TEXT',
                        label: ' Primary Link Label',
                        value: 'My text',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                  address: {
                    icon: 'IconMap',
                    label: 'Address',
                    value: {
                      addressLat: {
                        type: 'NUMERIC',
                        label: ' Address Lat',
                        value: null,
                        isLeaf: true,
                      },
                      addressLng: {
                        type: 'NUMERIC',
                        label: ' Address Lng',
                        value: null,
                        isLeaf: true,
                      },
                      addressCity: {
                        type: 'TEXT',
                        label: ' Address City',
                        value: 'My text',
                        isLeaf: true,
                      },
                      addressState: {
                        type: 'TEXT',
                        label: ' Address State',
                        value: 'My text',
                        isLeaf: true,
                      },
                      addressCountry: {
                        type: 'TEXT',
                        label: ' Address Country',
                        value: 'My text',
                        isLeaf: true,
                      },
                      addressStreet1: {
                        type: 'TEXT',
                        label: ' Address Street1',
                        value: 'My text',
                        isLeaf: true,
                      },
                      addressStreet2: {
                        type: 'TEXT',
                        label: ' Address Street2',
                        value: 'My text',
                        isLeaf: true,
                      },
                      addressPostcode: {
                        type: 'TEXT',
                        label: ' Address Postcode',
                        value: 'My text',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                  createdAt: {
                    icon: 'IconCalendar',
                    type: 'DATE_TIME',
                    label: 'Creation date',
                    value: '01/23/2025 15:16',
                    isLeaf: true,
                  },
                  createdBy: {
                    icon: 'IconCreativeCommonsSa',
                    label: 'Created by',
                    value: {
                      name: {
                        type: 'TEXT',
                        label: ' Name',
                        value: 'My text',
                        isLeaf: true,
                      },
                      source: {
                        type: 'SELECT',
                        label: ' Source',
                        value: null,
                        isLeaf: true,
                      },
                      context: {
                        type: 'RAW_JSON',
                        label: ' Context',
                        value: null,
                        isLeaf: true,
                      },
                      workspaceMemberId: {
                        type: 'UUID',
                        label: ' Workspace Member Id',
                        value: '123e4567-e89b-12d3-a456-426614174000',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                  deletedAt: {
                    icon: 'IconCalendarMinus',
                    type: 'DATE_TIME',
                    label: 'Deleted at',
                    value: '01/23/2025 15:16',
                    isLeaf: true,
                  },
                  employees: {
                    icon: 'IconUsers',
                    type: 'NUMBER',
                    label: 'Employees',
                    value: 20,
                    isLeaf: true,
                  },
                  updatedAt: {
                    icon: 'IconCalendarClock',
                    type: 'DATE_TIME',
                    label: 'Last update',
                    value: '01/23/2025 15:16',
                    isLeaf: true,
                  },
                  domainName: {
                    icon: 'IconLink',
                    label: 'Domain Name',
                    value: {
                      primaryLinkUrl: {
                        type: 'TEXT',
                        label: ' Primary Link Url',
                        value: 'My text',
                        isLeaf: true,
                      },
                      secondaryLinks: {
                        type: 'RAW_JSON',
                        label: ' Secondary Links',
                        value: null,
                        isLeaf: true,
                      },
                      primaryLinkLabel: {
                        type: 'TEXT',
                        label: ' Primary Link Label',
                        value: 'My text',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                  linkedinLink: {
                    icon: 'IconBrandLinkedin',
                    label: 'Linkedin',
                    value: {
                      primaryLinkUrl: {
                        type: 'TEXT',
                        label: ' Primary Link Url',
                        value: 'My text',
                        isLeaf: true,
                      },
                      secondaryLinks: {
                        type: 'RAW_JSON',
                        label: ' Secondary Links',
                        value: null,
                        isLeaf: true,
                      },
                      primaryLinkLabel: {
                        type: 'TEXT',
                        label: ' Primary Link Label',
                        value: 'My text',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                  idealCustomerProfile: {
                    icon: 'IconTarget',
                    type: 'BOOLEAN',
                    label: 'ICP',
                    value: true,
                    isLeaf: true,
                  },
                  annualRecurringRevenue: {
                    icon: 'IconMoneybag',
                    label: 'ARR',
                    value: {
                      amountMicros: {
                        type: 'NUMERIC',
                        label: ' Amount Micros',
                        value: null,
                        isLeaf: true,
                      },
                      currencyCode: {
                        type: 'TEXT',
                        label: ' Currency Code',
                        value: 'My text',
                        isLeaf: true,
                      },
                    },
                    isLeaf: false,
                  },
                },
                isLeaf: false,
              },
              jobTitle: {
                icon: 'IconBriefcase',
                type: 'TEXT',
                label: 'Job Title',
                value: 'My text',
                isLeaf: true,
              },
              createdAt: {
                icon: 'IconCalendar',
                type: 'DATE_TIME',
                label: 'Creation date',
                value: '01/23/2025 15:16',
                isLeaf: true,
              },
              createdBy: {
                icon: 'IconCreativeCommonsSa',
                label: 'Created by',
                value: {
                  name: {
                    type: 'TEXT',
                    label: ' Name',
                    value: 'My text',
                    isLeaf: true,
                  },
                  source: {
                    type: 'SELECT',
                    label: ' Source',
                    value: null,
                    isLeaf: true,
                  },
                  context: {
                    type: 'RAW_JSON',
                    label: ' Context',
                    value: null,
                    isLeaf: true,
                  },
                  workspaceMemberId: {
                    type: 'UUID',
                    label: ' Workspace Member Id',
                    value: '123e4567-e89b-12d3-a456-426614174000',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
              deletedAt: {
                icon: 'IconCalendarMinus',
                type: 'DATE_TIME',
                label: 'Deleted at',
                value: '01/23/2025 15:16',
                isLeaf: true,
              },
              updatedAt: {
                icon: 'IconCalendarClock',
                type: 'DATE_TIME',
                label: 'Last update',
                value: '01/23/2025 15:16',
                isLeaf: true,
              },
              linkedinLink: {
                icon: 'IconBrandLinkedin',
                label: 'Linkedin',
                value: {
                  primaryLinkUrl: {
                    type: 'TEXT',
                    label: ' Primary Link Url',
                    value: 'My text',
                    isLeaf: true,
                  },
                  secondaryLinks: {
                    type: 'RAW_JSON',
                    label: ' Secondary Links',
                    value: null,
                    isLeaf: true,
                  },
                  primaryLinkLabel: {
                    type: 'TEXT',
                    label: ' Primary Link Label',
                    value: 'My text',
                    isLeaf: true,
                  },
                },
                isLeaf: false,
              },
            },
            object: {
              icon: 'IconUser',
              label: 'Person',
              value: 'A person',
              isLeaf: true,
              fieldIdName: 'id',
              nameSingular: 'person',
            },
            _outputSchemaType: 'RECORD',
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
    status: WorkflowVersionStatus.ACTIVE,
    position: 1,
    workflowId: WORKFLOW_DATA_SEED_IDS.ID_1,
  },
];
