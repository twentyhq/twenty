import { computeInputFields } from '../../utils/computeInputFields';
import { FieldMetadataType, InputField } from '../../utils/data.types';

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
              type: FieldMetadataType.RELATION,
              name: 'favorites',
              label: 'Favorites',
              description: 'Favorites linked to the contact',
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.CURRENCY,
              name: 'annualSalary',
              label: 'Annual Salary',
              description: 'Annual Salary of the Person',
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.TEXT,
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
              type: FieldMetadataType.DATE_TIME,
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
              type: FieldMetadataType.FULL_NAME,
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
              type: FieldMetadataType.UUID,
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
              type: FieldMetadataType.NUMBER,
              name: 'recordPosition',
              label: 'RecordPosition',
              description: 'Record Position',
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.LINK,
              name: 'xLink',
              label: 'X',
              description: 'Contact’s X/Twitter account',
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.LINKS,
              name: 'whatsapp',
              label: 'Whatsapp',
              description: 'Contact’s Whatsapp account',
              isNullable: true,
              defaultValue: null,
            },
          },
          {
            node: {
              type: FieldMetadataType.EMAIL,
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
              type: FieldMetadataType.UUID,
              name: 'companyId',
              label: 'Company id (foreign key)',
              description: 'Contact’s company id foreign key',
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
        key: 'whatsapp__url',
        label: 'Whatsapp: Url',
        type: 'string',
        helpText: 'Contact’s Whatsapp account: Link Url',
        required: false,
      },
      {
        key: 'whatsapp__label',
        label: 'Whatsapp: Label',
        type: 'string',
        helpText: 'Contact’s Whatsapp account: Link Label',
        required: false,
      },
      {
        key: 'whatsapp__secondaryLinks',
        label: 'Whatsapp: Secondary Lings',
        type: 'string',
        helpText: 'Contact’s Whatsapp account: Link Label',
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
