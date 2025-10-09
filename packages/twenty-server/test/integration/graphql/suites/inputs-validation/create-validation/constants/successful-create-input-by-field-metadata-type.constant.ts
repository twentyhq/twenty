import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { FieldMetadataType } from 'twenty-shared/types';

export const successfulCreateInputByFieldMetadataType: {
  [K in FieldMetadataTypesToTestForCreateInputValidation]: {
    gqlInput: any;
    restInput: any;
    validateInput: (record: Record<string, any>) => boolean;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    {
      gqlInput: {
        textField: 'test',
      },
      restInput: {
        textField: 'test',
      },
      validateInput: (record: Record<string, any>) => {
        return record.textField === 'test';
      },
    },
    {
      gqlInput: {
        textField: '',
      },
      restInput: {
        textField: '',
      },
      validateInput: (record: Record<string, any>) => {
        return record.textField === '';
      },
    },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      gqlInput: {
        numberField: 1,
      },
      restInput: {
        numberField: 1,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === 1;
      },
    },
    {
      gqlInput: {
        numberField: 0,
      },
      restInput: {
        numberField: 0,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === 0;
      },
    },
    {
      gqlInput: {
        numberField: -1.1,
      },
      restInput: {
        numberField: -1.1,
      },
      validateInput: (record: Record<string, any>) => {
        return record.numberField === -1.1;
      },
    },
  ],
};
