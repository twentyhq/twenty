import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';
import { getMetadataValidationUserFriendlyMessage } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/build-metadata-validation-error-payload.util';

const buildMinimalFailedValidation = (
  errors: Array<{
    code: string;
    message: string;
    userFriendlyMessage?: MessageDescriptor;
  }>,
): any => ({
  type: 'create',
  errors,
  flatEntityMinimalInformation: {},
});

describe('getMetadataValidationUserFriendlyMessage', () => {
  it('returns the generic "Many validation errors" descriptor when totalErrors is greater than 1', () => {
    const metadataValidation: MetadataValidationErrorResponseDescriptor = {
      summary: { totalErrors: 2 },
      errors: {
        role: [
          buildMinimalFailedValidation([
            {
              code: 'ERR',
              message: 'x',
              userFriendlyMessage: msg`Only error`,
            },
          ]),
        ],
      },
    };

    expect(
      getMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toEqual(msg`Many validation errors`);
  });

  it('returns the fallback descriptor when totalErrors is 0', () => {
    const metadataValidation: MetadataValidationErrorResponseDescriptor = {
      summary: { totalErrors: 0 },
      errors: {},
    };

    expect(
      getMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toEqual(msg`Metadata validation failed`);
  });

  it('returns the first descriptor when totalErrors is 1', () => {
    const userFriendlyMessage = msg`Role name is invalid`;
    const metadataValidation: MetadataValidationErrorResponseDescriptor = {
      summary: { totalErrors: 1 },
      errors: {
        role: [
          buildMinimalFailedValidation([
            {
              code: 'ROLE_ERROR',
              message: 'invalid',
              userFriendlyMessage,
            },
          ]),
        ],
      },
    };

    expect(getMetadataValidationUserFriendlyMessage(metadataValidation)).toBe(
      userFriendlyMessage,
    );
  });

  it('skips earlier validation errors that do not provide a userFriendlyMessage', () => {
    const userFriendlyMessage = msg`First friendly message`;
    const metadataValidation: MetadataValidationErrorResponseDescriptor = {
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
              userFriendlyMessage,
            },
            {
              code: 'C',
              message: 'third',
              userFriendlyMessage: msg`Would not reach this`,
            },
          ]),
        ],
      },
    };

    expect(getMetadataValidationUserFriendlyMessage(metadataValidation)).toBe(
      userFriendlyMessage,
    );
  });

  it('returns the fallback descriptor when no validation error has a userFriendlyMessage', () => {
    const metadataValidation: MetadataValidationErrorResponseDescriptor = {
      summary: { totalErrors: 1 },
      errors: {
        view: [
          buildMinimalFailedValidation([
            {
              code: 'X',
              message: 'y',
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
      getMetadataValidationUserFriendlyMessage(metadataValidation),
    ).toEqual(msg`Metadata validation failed`);
  });

  it('returns the descriptor from the earliest metadata bucket in ALL_METADATA_NAME order', () => {
    const fieldMetadataMessage = msg`Field metadata message`;
    const metadataValidation: MetadataValidationErrorResponseDescriptor = {
      summary: { totalErrors: 1 },
      errors: {
        fieldMetadata: [
          buildMinimalFailedValidation([
            {
              code: 'FM',
              message: 'm',
              userFriendlyMessage: fieldMetadataMessage,
            },
          ]),
        ],
        role: [
          buildMinimalFailedValidation([
            {
              code: 'R',
              message: 'm',
              userFriendlyMessage: msg`Role message`,
            },
          ]),
        ],
      },
    };

    expect(getMetadataValidationUserFriendlyMessage(metadataValidation)).toBe(
      fieldMetadataMessage,
    );
  });
});
