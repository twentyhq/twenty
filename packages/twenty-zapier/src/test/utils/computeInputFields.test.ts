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
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: 'CURRENCY',
              name: 'annualSalary',
              label: 'Annual Salary',
              description: 'Annual Salary of the Person',
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
              isNullable: true,
              defaultValue: null,
            },
          },
        ],
      },
    };
    const baseExpectedResult: InputField[] = [
      {
        key: 'annualSalary__amountMicros',
        label: 'Annual Salary: Amount Micros',
        type: 'integer',
        helpText:
          'Annual Salary of the Person: Amount Micros. eg: set 3210000 for 3.21$',
        required: false,
      },
      {
        key: 'annualSalary__currencyCode',
        label: 'Annual Salary: Currency Code',
        type: 'string',
        helpText:
          'Annual Salary of the Person: Currency Code. eg: USD, EUR, etc...',
        required: false,
      },
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
        key: 'name__firstName',
        label: 'Name: First Name',
        type: 'string',
        helpText: 'Contact’s name: First Name',
        required: false,
      },
      {
        key: 'name__lastName',
        label: 'Name: Last Name',
        type: 'string',
        helpText: 'Contact’s name: Last Name',
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
        label: 'X: Url',
        type: 'string',
        helpText: 'Contact’s X/Twitter account: Link Url',
        required: false,
      },
      {
        key: 'xLink__label',
        label: 'X: Label',
        type: 'string',
        helpText: 'Contact’s X/Twitter account: Link Label',
        required: false,
      },
      {
        key: 'linkedinLink__url',
        label: 'Linkedin: Url',
        type: 'string',
        helpText: 'Contact’s Linkedin account: Link Url',
        required: false,
      },
      {
        key: 'linkedinLink__label',
        label: 'Linkedin: Label',
        type: 'string',
        helpText: 'Contact’s Linkedin account: Link Label',
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
