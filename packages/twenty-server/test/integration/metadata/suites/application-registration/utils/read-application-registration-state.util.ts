import { type ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type ApplicationRegistrationState = {
  registration:
    | Pick<
        ApplicationRegistrationEntity,
        'name' | 'oAuthRedirectUris' | 'oAuthScopes' | 'oAuthClientSecretHash'
      >
    | undefined;
  variables: Pick<
    ApplicationRegistrationVariableEntity,
    'id' | 'key' | 'encryptedValue' | 'description'
  >[];
};

export const readApplicationRegistrationState = async (
  applicationRegistrationId: string,
): Promise<ApplicationRegistrationState> => {
  const [registration] = await globalThis.testDataSource.query(
    `SELECT name, "oAuthRedirectUris", "oAuthScopes", "oAuthClientSecretHash"
     FROM core."applicationRegistration" WHERE id = $1`,
    [applicationRegistrationId],
  );

  const variables = await globalThis.testDataSource.query(
    `SELECT id, key, "encryptedValue", description
     FROM core."applicationRegistrationVariable"
     WHERE "applicationRegistrationId" = $1
     ORDER BY key`,
    [applicationRegistrationId],
  );

  return { registration, variables };
};
