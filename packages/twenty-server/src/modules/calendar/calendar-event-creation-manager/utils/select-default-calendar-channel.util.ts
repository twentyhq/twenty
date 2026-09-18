import { isDefined } from 'twenty-shared/utils';

import { selectConnectedAccountIdForCaller } from 'src/engine/core-modules/tool/tools/email-tool/utils/select-connected-account-id-for-caller.util';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { getMissingCreateEventScopes } from 'src/modules/calendar/calendar-event-creation-manager/utils/get-missing-create-event-scopes.util';
import { isCalendarCreationSupportedProvider } from 'src/modules/calendar/calendar-event-creation-manager/utils/is-calendar-creation-supported-provider.util';

type SelectableCalendarChannel = Pick<
  CalendarChannelEntity,
  'connectedAccountId'
> & {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    | 'id'
    | 'archivedAt'
    | 'provider'
    | 'scopes'
    | 'visibility'
    | 'userWorkspaceId'
  >;
};

export const selectDefaultCalendarChannel = <
  TCalendarChannel extends SelectableCalendarChannel,
>({
  calendarChannels,
  userWorkspaceId,
}: {
  calendarChannels: TCalendarChannel[];
  userWorkspaceId?: string;
}): TCalendarChannel | undefined => {
  const eligibleCalendarChannels = calendarChannels.filter(
    (calendarChannel) =>
      isDefined(calendarChannel.connectedAccount) &&
      !isDefined(calendarChannel.connectedAccount.archivedAt) &&
      isCalendarCreationSupportedProvider(
        calendarChannel.connectedAccount.provider,
      ) &&
      getMissingCreateEventScopes(calendarChannel.connectedAccount).length ===
        0,
  );

  if (!isDefined(userWorkspaceId)) {
    return eligibleCalendarChannels[0];
  }

  const connectedAccountId = selectConnectedAccountIdForCaller({
    connectedAccounts: eligibleCalendarChannels.map(
      (calendarChannel) => calendarChannel.connectedAccount,
    ),
    userWorkspaceId,
  });

  return eligibleCalendarChannels.find(
    (calendarChannel) =>
      calendarChannel.connectedAccountId === connectedAccountId,
  );
};
