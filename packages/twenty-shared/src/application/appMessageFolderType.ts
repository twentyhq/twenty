export type AppMessageFolder = {
  id: string;
  // The provider's id for the folder (a Front inbox id, a Slack channel id), unique within its channel.
  externalId: string;
  name: string;
  // Which folders a member chose to import. Advisory: the app reads it and skips unsynced folders itself.
  isSynced: boolean;
  messageChannelId: string;
};
