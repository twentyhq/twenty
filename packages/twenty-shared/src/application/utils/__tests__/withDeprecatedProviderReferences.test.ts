import { withDeprecatedConnectionProviderReferences } from '@/application/utils/withDeprecatedConnectionProviderReferences';
import { withDeprecatedMessagingProviderReferences } from '@/application/utils/withDeprecatedMessagingProviderReferences';

const CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER =
  '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e02';
const AUTHORIZE_UNIVERSAL_IDENTIFIER = '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e03';
const CALLBACK_UNIVERSAL_IDENTIFIER = '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e04';

describe('withDeprecatedMessagingProviderReferences', () => {
  it('should add the deprecated form to a reference written as a universal identifier', () => {
    expect(
      withDeprecatedMessagingProviderReferences({
        universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e01',
        name: 'linkedin-messaging',
        displayName: 'LinkedIn Messages',
        connectionProviderUniversalIdentifier:
          CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual({
      universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e01',
      name: 'linkedin-messaging',
      displayName: 'LinkedIn Messages',
      connectionProviderUniversalIdentifier:
        CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      connectionProvider: {
        universalIdentifier: CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
  });
});

describe('withDeprecatedConnectionProviderReferences', () => {
  it('should write both forms of the custom references when only the deprecated form is declared', () => {
    expect(
      withDeprecatedConnectionProviderReferences({
        universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e05',
        name: 'linkedin',
        displayName: 'LinkedIn',
        type: 'custom',
        custom: {
          authorizeLogicFunction: {
            universalIdentifier: AUTHORIZE_UNIVERSAL_IDENTIFIER,
          },
          callbackLogicFunction: {
            universalIdentifier: CALLBACK_UNIVERSAL_IDENTIFIER,
          },
        },
      }),
    ).toMatchObject({
      custom: {
        authorizeLogicFunctionUniversalIdentifier:
          AUTHORIZE_UNIVERSAL_IDENTIFIER,
        authorizeLogicFunction: {
          universalIdentifier: AUTHORIZE_UNIVERSAL_IDENTIFIER,
        },
        callbackLogicFunctionUniversalIdentifier: CALLBACK_UNIVERSAL_IDENTIFIER,
        callbackLogicFunction: {
          universalIdentifier: CALLBACK_UNIVERSAL_IDENTIFIER,
        },
      },
    });
  });
});
