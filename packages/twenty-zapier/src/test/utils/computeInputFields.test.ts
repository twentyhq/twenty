import { FieldMetadataType } from 'twenty-shared';
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
        list: false,
        placeholder: undefined,
      },
      {
        key: 'annualSalary__currencyCode',
        label: 'Annual Salary: Currency Code',
        type: 'string',
        helpText:
          'Annual Salary of the Person: Currency Code. eg: USD, EUR, etc...',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'jobTitle',
        label: 'Job Title',
        type: 'string',
        helpText: 'Contact’s job title',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'updatedAt',
        label: 'Update date',
        type: 'datetime',
        helpText: null,
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'name__firstName',
        label: 'Name: First Name',
        type: 'string',
        helpText: 'Contact’s name: First Name',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'name__lastName',
        label: 'Name: Last Name',
        type: 'string',
        helpText: 'Contact’s name: Last Name',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'recordPosition',
        label: 'RecordPosition',
        type: 'integer',
        helpText: 'Record Position',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'xLink__url',
        label: 'X: Url',
        type: 'string',
        helpText: 'Contact’s X/Twitter account: Link Url',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'xLink__label',
        label: 'X: Label',
        type: 'string',
        helpText: 'Contact’s X/Twitter account: Link Label',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'whatsapp__primaryLinkLabel',
        label: 'Whatsapp: Primary Link Label',
        type: 'string',
        helpText: 'Contact’s Whatsapp account: Primary Link Label',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'whatsapp__primaryLinkUrl',
        label: 'Whatsapp: Primary Link Url',
        type: 'string',
        helpText: 'Contact’s Whatsapp account: Primary Link Url',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'whatsapp__secondaryLinks',
        label: 'Whatsapp: Secondary Links',
        type: 'string',
        helpText: 'Contact’s Whatsapp account: Secondary Links',
        required: false,
        list: true,
        placeholder: '{ url: "", label: "" }',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        helpText: 'Contact’s Email',
        required: false,
        list: false,
        placeholder: undefined,
      },
      {
        key: 'companyId',
        label: 'Company id (foreign key)',
        type: 'string',
        helpText: 'Contact’s company id foreign key',
        required: false,
        list: false,
        placeholder: undefined,
      },
    ];
    const idInputField: InputField = {
      key: 'id',
      label: 'Id',
      type: 'string',
      helpText: null,
      list: false,
      placeholder: undefined,
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
