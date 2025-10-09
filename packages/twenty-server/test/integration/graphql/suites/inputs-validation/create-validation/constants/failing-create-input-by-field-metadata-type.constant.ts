import { type FieldMetadataTypesToTestForCreateInputValidation } from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import { FieldMetadataType } from 'twenty-shared/types';

export const failingCreateInputByFieldMetadataType: {
  [K in FieldMetadataTypesToTestForCreateInputValidation]: {
    gqlInput: any;
    gqlErrorMessage: string;
    restInput: any;
    restErrorMessage: string;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    {
      gqlInput: {
        textField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restInput: {
        textField: null,
      },
      restErrorMessage: 'violates not-null constraint',
    },
    // {
    //   gqlInput: {
    //     textField: {},
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restInput: {
    //     textField: {},
    //   },
    //   restErrorMessage: '',
    // },
    // {
    //   gqlInput: {
    //     textField: [],
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restInput: {
    //     textField: [],
    //   },
    //   restErrorMessage: '',
    // },
    // {
    //   gqlInput: {
    //     textField: true,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restInput: {
    //     textField: true,
    //   },
    //   restErrorMessage: '',
    // },
    // {
    //   gqlInput: {
    //     textField: 1,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    // restInput: {
    //   textField: 1,
    // },
    // restErrorMessage: '',
    // },
  ],
  [FieldMetadataType.NUMBER]: [
    {
      gqlInput: {
        textField: null,
      },
      gqlErrorMessage: 'violates not-null constraint',
      restInput: {
        textField: null,
      },
      restErrorMessage: 'violates not-null constraint',
    },
    // {
    //   gqlInput: {
    //     textField: {},
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restInput: {
    //     textField: {},
    //   },
    //   restErrorMessage: '',
    // },
    // {
    //   gqlInput: {
    //     textField: [],
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restInput: {
    //     textField: [],
    //   },
    //   restErrorMessage: '',
    // },
    // {
    //   gqlInput: {
    //     textField: true,
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   //TODO - to fix, should throw
    //   restInput: {
    //     textField: true,
    //   },
    //   restErrorMessage: '',
    // },
    // {
    //   gqlInput: {
    //     textField: 'string',
    //   },
    //   gqlErrorMessage: 'cannot represent a non string value',
    //   // TODO - to fix, should throw
    //   restInput: {
    //     textField: 'string',
    //   },
    //   restErrorMessage: '',
    // },
  ],
};
