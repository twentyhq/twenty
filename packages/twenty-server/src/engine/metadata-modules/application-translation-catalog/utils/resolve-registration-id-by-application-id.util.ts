import { isDefined } from 'twenty-shared/utils';

type ApplicationRegistrationLookup = {
  byId: Record<
    string,
    { applicationRegistrationId?: string | null } | undefined
  >;
};

// The standard application is skipped: its strings live in the server's own
// lingui catalog, not in applicationTranslation.
export const resolveRegistrationIdByApplicationId = ({
  applicationIds,
  flatApplicationMaps,
  standardApplicationId,
}: {
  applicationIds: (string | undefined)[];
  flatApplicationMaps: ApplicationRegistrationLookup;
  standardApplicationId: string;
}): Map<string, string> => {
  const registrationIdByApplicationId = new Map<string, string>();

  for (const applicationId of new Set(applicationIds)) {
    if (!isDefined(applicationId) || applicationId === standardApplicationId) {
      continue;
    }

    const applicationRegistrationId =
      flatApplicationMaps.byId[applicationId]?.applicationRegistrationId;

    if (isDefined(applicationRegistrationId)) {
      registrationIdByApplicationId.set(
        applicationId,
        applicationRegistrationId,
      );
    }
  }

  return registrationIdByApplicationId;
};
