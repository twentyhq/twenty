import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { stripSecretFromApplicationVariables } from 'src/engine/metadata-modules/front-component/utils/strip-secret-from-application-variables';

const makeFlatVariable = (
  overrides: Partial<FlatApplicationVariable>,
): FlatApplicationVariable => ({
  id: '1',
  key: 'KEY',
  value: 'value',
  description: '',
  isSecret: false,
  applicationId: 'app-1',
  workspaceId: '00000000-0000-0000-0000-000000000000',
  universalIdentifier: '00000000-0000-0000-0000-000000000000',
  applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000000',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const decryptVersioned = jest.fn();
const secretEncryptionService = {
  decryptVersioned,
} as unknown as SecretEncryptionService;

describe('stripSecretFromApplicationVariables', () => {
  beforeEach(() => {
    decryptVersioned.mockReset();
  });

  it('should return empty object for empty array', () => {
    expect(
      stripSecretFromApplicationVariables([], secretEncryptionService),
    ).toEqual({});
  });

  it('should include non-secret variables', () => {
    const variables = [
      makeFlatVariable({ key: 'PUBLIC_URL', value: 'https://example.com' }),
      makeFlatVariable({ id: '2', key: 'DEBUG', value: 'true' }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({
      PUBLIC_URL: 'https://example.com',
      DEBUG: 'true',
    });
  });

  it('should decrypt encrypted non-secret variables', () => {
    const encryptedValue = 'enc:v2:deadbeef:encrypted-value';
    decryptVersioned.mockReturnValue('https://example.com');

    const variables = [
      makeFlatVariable({
        key: 'PUBLIC_URL',
        value: encryptedValue,
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({
      PUBLIC_URL: 'https://example.com',
    });
    expect(decryptVersioned).toHaveBeenCalledWith(encryptedValue, {
      workspaceId: variables[0].workspaceId,
    });
  });

  it('should exclude secret variables', () => {
    const variables = [
      makeFlatVariable({ key: 'PUBLIC_URL', value: 'https://example.com' }),
      makeFlatVariable({
        id: '2',
        key: 'API_SECRET',
        value: 'encrypted_secret',
        isSecret: true,
      }),
      makeFlatVariable({ id: '3', key: 'DEBUG', value: 'true' }),
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
    expect(decryptVersioned).not.toHaveBeenCalled();
  });

  it('should handle null and undefined values', () => {
    const variables = [
      makeFlatVariable({
        key: 'NULL_VALUE',
        value: null as unknown as string,
      }),
      makeFlatVariable({
        id: '2',
        key: 'UNDEFINED_VALUE',
        value: undefined as unknown as string,
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({
      NULL_VALUE: '',
      UNDEFINED_VALUE: '',
    });
  });

  it('should convert non-string values to strings', () => {
    const variables = [
      makeFlatVariable({
        key: 'NUMBER_VALUE',
        value: 123 as unknown as string,
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({
      NUMBER_VALUE: '123',
    });
  });

  it('should return empty object when all variables are secret', () => {
    const variables = [
      makeFlatVariable({ key: 'SECRET_1', value: 'val1', isSecret: true }),
      makeFlatVariable({
        id: '2',
        key: 'SECRET_2',
        value: 'val2',
        isSecret: true,
      }),
    ];

    expect(
      stripSecretFromApplicationVariables(variables, secretEncryptionService),
    ).toEqual({});
  });
});
