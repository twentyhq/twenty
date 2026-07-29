import { FieldMetadataType } from 'twenty-shared/types';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { stripSecretFromApplicationVariables } from 'src/engine/metadata-modules/front-component/utils/strip-secret-from-application-variables';

const makeFlatVariable = (
  overrides: Partial<FlatApplicationVariable>,
): FlatApplicationVariable => ({
  id: '1',
  key: 'KEY',
  value: 'value' as EncryptedString,
  description: '',
  isSecret: false,
  type: FieldMetadataType.TEXT,
  options: null,
  applicationId: 'app-1',
  workspaceId: '00000000-0000-0000-0000-000000000000',
  universalIdentifier: '00000000-0000-0000-0000-000000000000',
  applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000000',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('stripSecretFromApplicationVariables', () => {
  const decryptVersionedOrThrow = jest.fn();
  const secretEncryptionService = {
    decryptVersionedOrThrow,
  } as unknown as SecretEncryptionService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty object for empty array', () => {
    expect(
      stripSecretFromApplicationVariables([], secretEncryptionService),
    ).toEqual({});
  });

  it('should include non-secret variables', () => {
    const variables = [
      makeFlatVariable({
        key: 'PUBLIC_URL',
        value: 'https://example.com' as EncryptedString,
      }),
      makeFlatVariable({
        id: '2',
        key: 'DEBUG',
        value: 'true' as EncryptedString,
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({ PUBLIC_URL: 'https://example.com', DEBUG: 'true' });
  });

  it('should exclude secret variables', () => {
    const variables = [
      makeFlatVariable({
        key: 'PUBLIC_URL',
        value: 'https://example.com' as EncryptedString,
      }),
      makeFlatVariable({
        id: '2',
        key: 'API_SECRET',
        value: 'enc:v2:key-id:secret-payload' as EncryptedString,
        isSecret: true,
      }),
      makeFlatVariable({
        id: '3',
        key: 'DEBUG',
        value: 'true' as EncryptedString,
      }),
    ];

    const result = stripSecretFromApplicationVariables(
      variables,
      secretEncryptionService,
    );

    expect(result).toEqual({
      PUBLIC_URL: 'https://example.com',
      DEBUG: 'true',
    });
    expect(result).not.toHaveProperty('API_SECRET');
    expect(decryptVersionedOrThrow).not.toHaveBeenCalled();
  });

  it('should handle null and undefined values', () => {
    const variables = [
      makeFlatVariable({
        key: 'NULL_VALUE',
        value: null as unknown as EncryptedString | '',
      }),
      makeFlatVariable({
        id: '2',
        key: 'UNDEFINED_VALUE',
        value: undefined as unknown as EncryptedString | '',
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({ NULL_VALUE: '', UNDEFINED_VALUE: '' });
  });

  it('should convert non-string values to strings', () => {
    const variables = [
      makeFlatVariable({
        key: 'NUMBER_VALUE',
        value: 123 as unknown as EncryptedString | '',
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({ NUMBER_VALUE: '123' });
  });

  it('should return empty object when all variables are secret', () => {
    const variables = [
      makeFlatVariable({
        key: 'SECRET_1',
        value: 'val1' as EncryptedString,
        isSecret: true,
      }),
      makeFlatVariable({
        id: '2',
        key: 'SECRET_2',
        value: 'val2' as EncryptedString,
        isSecret: true,
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({});
    expect(decryptVersionedOrThrow).not.toHaveBeenCalled();
  });

  it('should decrypt non-secret encrypted variables', () => {
    const encryptedValue = 'enc:v2:key-id:payload' as EncryptedString;

    decryptVersionedOrThrow.mockReturnValue('pk.mapbox-token');

    expect(
      stripSecretFromApplicationVariables(
        [
          makeFlatVariable({
            key: 'MAPBOX_PUBLIC_ACCESS_TOKEN',
            value: encryptedValue,
          }),
        ],
        secretEncryptionService,
      ),
    ).toEqual({ MAPBOX_PUBLIC_ACCESS_TOKEN: 'pk.mapbox-token' });
    expect(decryptVersionedOrThrow).toHaveBeenCalledWith(encryptedValue, {
      workspaceId: '00000000-0000-0000-0000-000000000000',
    });
  });
});
