import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';

import { getPrimaryMetadataValidationUserFriendlyMessage } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/get-primary-metadata-validation-user-friendly-message.util';

const buildMinimalFailedValidation = (
  errors: Array<{
    code: string;
    message: string;
    userFriendlyMessage?: string;
  }>,
) => ({
  type: 'test',
  errors,
  flatEntityMinimalInformation: {},
});

describe('getPrimaryMetadataValidationUserFriendlyMessage', () => {
  it('returns undefined when totalErrors is not 1', () => {
    const metadataValidation: MetadataValidationErrorResponse = {
      summary: { totalErrors: 0 },
      errors: {},
    };

    expect(
      getPrimaryMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toBe(undefined);
  });

  it('returns undefined when totalErrors is greater than 1', () => {
    const metadataValidation: MetadataValidationErrorResponse = {
      summary: { totalErrors: 2 },
      errors: {
        role: [
          buildMinimalFailedValidation([
            {
              code: 'ERR',
              message: 'x',
              userFriendlyMessage: 'Only error',
            },
          ]),
        ],
      },
    };

    expect(
      getPrimaryMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toBe(undefined);
  });

  it('returns the first non-empty userFriendlyMessage when totalErrors is 1', () => {
    const metadataValidation: MetadataValidationErrorResponse = {
      summary: { totalErrors: 1 },
      errors: {
        role: [
          buildMinimalFailedValidation([
            {
              code: 'ROLE_ERROR',
              message: 'invalid',
              userFriendlyMessage: 'Role name is invalid',
            },
          ]),
        ],
      },
    };

    expect(
      getPrimaryMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toBe('Role name is invalid');
  });

  it('returns the first userFriendlyMessage in validation error order when earlier entries omit it', () => {
    const metadataValidation: MetadataValidationErrorResponse = {
      summary: { totalErrors: 1 },
      errors: {
        fieldMetadata: [
          buildMinimalFailedValidation([
            {
              code: 'A',
              message: 'first',
            },
            {
              code: 'B',
              message: 'second',
              userFriendlyMessage: 'First friendly message',
            },
            {
              code: 'C',
              message: 'third',
              userFriendlyMessage: 'Would not reach this',
            },
          ]),
        ],
      },
    };

    expect(
      getPrimaryMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toBe('First friendly message');
  });

  it('returns undefined when no validation error has a non-empty userFriendlyMessage', () => {
    const metadataValidation: MetadataValidationErrorResponse = {
      summary: { totalErrors: 1 },
      errors: {
        view: [
          buildMinimalFailedValidation([
            {
              code: 'X',
              message: 'y',
              userFriendlyMessage: '',
            },
            {
              code: 'Z',
              message: 'z',
            },
          ]),
        ],
      },
    };

    expect(
      getPrimaryMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toBe(undefined);
  });

  it('returns the message from the earliest metadata bucket in ALL_METADATA_NAME order', () => {
    const metadataValidation: MetadataValidationErrorResponse = {
      summary: { totalErrors: 1 },
      errors: {
        fieldMetadata: [
          buildMinimalFailedValidation([
            {
              code: 'FM',
              message: 'm',
              userFriendlyMessage: 'Field metadata message',
            },
          ]),
        ],
        role: [
          buildMinimalFailedValidation([
            {
              code: 'R',
              message: 'm',
              userFriendlyMessage: 'Role message',
            },
          ]),
        ],
      },
    };

    expect(
      getPrimaryMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toBe('Field metadata message');
  });
});
