import { computeInputFields } from '../../utils/computeInputFields';
import { InputField } from '../../utils/data.types';

describe('computeInputFields', () => {
  test('should create Person input fields properly', () => {
    const personNode = {
      nameSingular: 'person',
      namePlural: 'people',
      labelSingular: 'Person',
      fields: {
        edges: [
          {
            node: {
              type: 'RELATION',
              name: 'favorites',
              label: 'Favorites',
              description: 'Favorites linked to the contact',
              targetColumnMap: {},
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'TEXT',
              name: 'jobTitle',
              label: 'Job Title',
              description: 'Contact’s job title',
              targetColumnMap: {
                value: 'jobTitle',
              },
              isNullable: false,
              defaultValue: {
                value: '',
              },
            },
          },
          {
            node: {
              type: 'RELATION',
              name: 'company',
              label: 'Company',
              description: 'Contact’s company',
              targetColumnMap: {},
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'DATE_TIME',
              name: 'updatedAt',
              label: 'Update date',
              description: null,
              targetColumnMap: {
                value: 'updatedAt',
              },
              isNullable: false,
              defaultValue: {
                type: 'now',
              },
            },
          },
          {
            node: {
              type: 'FULL_NAME',
              name: 'name',
              label: 'Name',
              description: 'Contact’s name',
              targetColumnMap: {
                lastName: 'nameLastName',
                firstName: 'nameFirstName',
              },
              isNullable: true,
              defaultValue: {
                lastName: '',
                firstName: '',
              },
            },
          },
          {
            node: {
              type: 'UUID',
              name: 'id',
              label: 'Id',
              description: null,
              icon: null,
              targetColumnMap: {
                value: 'id',
              },
              isNullable: false,
              defaultValue: {
                type: 'uuid',
              },
            },
          },
          {
            node: {
              type: 'TEXT',
              name: 'city',
              label: 'City',
              description: 'Contact’s city',
              targetColumnMap: {
                value: 'city',
              },
              isNullable: false,
              defaultValue: {
                value: '',
              },
            },
          },
          {
            node: {
              type: 'NUMBER',
              name: 'recordPosition',
              label: 'RecordPosition',
              description: 'Record Position',
              targetColumnMap: {
                value: 'recordPosition',
              },
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'LINK',
              name: 'xLink',
              label: 'X',
              description: 'Contact’s X/Twitter account',
              targetColumnMap: {
                url: 'xLinkUrl',
                label: 'xLinkLabel',
              },
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'LINK',
              name: 'linkedinLink',
              label: 'Linkedin',
              description: 'Contact’s Linkedin account',
              targetColumnMap: {
                url: 'linkedinLinkUrl',
                label: 'linkedinLinkLabel',
              },
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'TEXT',
              name: 'avatarUrl',
              label: 'Avatar',
              description: 'Contact’s avatar',
              targetColumnMap: {
                value: 'avatarUrl',
              },
              isNullable: false,
              defaultValue: {
                value: '',
              },
            },
          },
          {
            node: {
              type: 'EMAIL',
              name: 'email',
              label: 'Email',
              description: 'Contact’s Email',
              targetColumnMap: {
                value: 'email',
              },
              isNullable: false,
              defaultValue: {
                value: '',
              },
            },
          },
          {
            node: {
              type: 'UUID',
              name: 'companyId',
              label: 'Company id (foreign key)',
              description: 'Contact’s company id foreign key',
              targetColumnMap: {
                value: 'companyId',
              },
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'RELATION',
              name: 'attachments',
              label: 'Attachments',
              description: 'Attachments linked to the contact.',
              targetColumnMap: {},
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'RELATION',
              name: 'activityTargets',
              label: 'Activities',
              description: 'Activities tied to the contact',
              targetColumnMap: {},
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'DATE_TIME',
              name: 'createdAt',
              label: 'Creation date',
              description: null,
              targetColumnMap: {
                value: 'createdAt',
              },
              isNullable: false,
              defaultValue: {
                type: 'now',
              },
            },
          },
          {
            node: {
              type: 'TEXT',
              name: 'phone',
              label: 'Phone',
              description: 'Contact’s phone number',
              targetColumnMap: {
                value: 'phone',
              },
              isNullable: false,
              defaultValue: {
                value: '',
              },
            },
          },
          {
            node: {
              type: 'RELATION',
              name: 'pointOfContactForOpportunities',
              label: 'POC for Opportunities',
              description: 'Point of Contact for Opportunities',
              targetColumnMap: {},
              isNullable: true,
              defaultValue: null,
            },
          },
        ],
      },
    };
    const baseExpectedResult: InputField[] = [
      {
        key: 'jobTitle',
        label: 'Job Title',
        type: 'string',
        helpText: 'Contact’s job title',
        required: false,
      },
      {
        key: 'updatedAt',
        label: 'Update date',
        type: 'datetime',
        helpText: null,
        required: false,
      },
      {
        key: 'name__lastName',
        label: 'Name (LastName)',
        type: 'string',
        helpText: 'Contact’s name (lastName)',
        required: false,
      },
      {
        key: 'name__firstName',
        label: 'Name (FirstName)',
        type: 'string',
        helpText: 'Contact’s name (firstName)',
        required: false,
      },
      {
        key: 'city',
        label: 'City',
        type: 'string',
        helpText: 'Contact’s city',
        required: false,
      },
      {
        key: 'recordPosition',
        label: 'RecordPosition',
        type: 'integer',
        helpText: 'Record Position',
        required: false,
      },
      {
        key: 'xLink__url',
        label: 'X (Url)',
        type: 'string',
        helpText: 'Contact’s X/Twitter account (url)',
        required: false,
      },
      {
        key: 'xLink__label',
        label: 'X (Label)',
        type: 'string',
        helpText: 'Contact’s X/Twitter account (label)',
        required: false,
      },
      {
        key: 'linkedinLink__url',
        label: 'Linkedin (Url)',
        type: 'string',
        helpText: 'Contact’s Linkedin account (url)',
        required: false,
      },
      {
        key: 'linkedinLink__label',
        label: 'Linkedin (Label)',
        type: 'string',
        helpText: 'Contact’s Linkedin account (label)',
        required: false,
      },
      {
        key: 'avatarUrl',
        label: 'Avatar',
        type: 'string',
        helpText: 'Contact’s avatar',
        required: false,
      },
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        helpText: 'Contact’s Email',
        required: false,
      },
      {
        key: 'companyId',
        label: 'Company id (foreign key)',
        type: 'string',
        helpText: 'Contact’s company id foreign key',
        required: false,
      },
      {
        key: 'createdAt',
        label: 'Creation date',
        type: 'datetime',
        helpText: null,
        required: false,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'string',
        helpText: 'Contact’s phone number',
        required: false,
      },
    ];
    const idInputField: InputField = {
      key: 'id',
      label: 'Id',
      type: 'string',
      helpText: null,
      required: false,
    };
    const expectedResult = [idInputField].concat(baseExpectedResult);
    expect(computeInputFields(personNode)).toEqual(expectedResult);
    idInputField.required = true;
    const idRequiredExpectedResult = [idInputField].concat(baseExpectedResult);
    expect(computeInputFields(personNode, true)).toEqual(
      idRequiredExpectedResult,
    );
  });
});
