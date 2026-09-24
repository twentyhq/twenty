import { MessageChannelType } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';
import { MessageChannelResolver } from 'src/engine/metadata-modules/message-channel/resolvers/message-channel.resolver';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const APPLICATION_ID = '44444444-4444-4444-8444-444444444444';
const CONNECTED_ACCOUNT_ID = '55555555-5555-4555-8555-555555555555';
const USER_WORKSPACE_ID = '66666666-6666-4666-8666-666666666666';

describe('MessageChannelResolver connectedAccount', () => {
  const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;
  const application = { id: APPLICATION_ID } as FlatApplication;

  const anAppChannel = (): MessageChannelDTO =>
    ({
      id: 'channel-id',
      type: MessageChannelType.APP,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    }) as MessageChannelDTO;

  const buildResolver = ({
    reachableConnectedAccount = null,
  }: {
    reachableConnectedAccount?: Partial<ConnectedAccountEntity> | null;
  } = {}) => {
    const connectedAccountMetadataService = {
      findById: jest.fn().mockResolvedValue({ id: CONNECTED_ACCOUNT_ID }),
      findByIdAndUserWorkspaceId: jest
        .fn()
        .mockResolvedValue({ id: CONNECTED_ACCOUNT_ID }),
    };
    const applicationMessageChannelsService = {
      findReachableConnectedAccount: jest
        .fn()
        .mockResolvedValue(reachableConnectedAccount),
    };

    const resolver = new MessageChannelResolver(
      {} as never,
      connectedAccountMetadataService as never,
      applicationMessageChannelsService as never,
      {} as never,
      {} as never,
    );

    return {
      resolver,
      connectedAccountMetadataService,
      applicationMessageChannelsService,
    };
  };

  // Before this branch existed the decorator threw for a run with no user —
  // telling an app that "API keys are not supported", which is not even the
  // right diagnosis — so a cron, webhook or install hook could not read the
  // connection behind a channel its own application owns.
  it('resolves an app-owned connection for a run with nobody behind it', async () => {
    const { resolver, applicationMessageChannelsService } = buildResolver({
      reachableConnectedAccount: { id: CONNECTED_ACCOUNT_ID },
    });

    const account = await resolver.connectedAccount(
      anAppChannel(),
      workspace,
      undefined,
      application,
    );

    expect(account).toMatchObject({ id: CONNECTED_ACCOUNT_ID });
    expect(
      applicationMessageChannelsService.findReachableConnectedAccount,
    ).toHaveBeenCalledTimes(1);
    expect(
      applicationMessageChannelsService.findReachableConnectedAccount,
    ).toHaveBeenCalledWith({
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      requestUserWorkspaceId: null,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });
  });

  // Reachability is the app-facing predicate's answer, not this resolver's:
  // it already refuses a connection owned by another application, and one
  // that is private to a different member than the caller.
  it('returns null when the predicate says the caller cannot reach it', async () => {
    const { resolver } = buildResolver({ reachableConnectedAccount: null });

    expect(
      await resolver.connectedAccount(
        anAppChannel(),
        workspace,
        USER_WORKSPACE_ID,
        application,
      ),
    ).toBeNull();
  });

  // The user behind an APPLICATION_ACCESS token still has to be honoured, so
  // it is forwarded rather than dropped once an application is present.
  it('forwards the request user when a member triggered the run', async () => {
    const { resolver, applicationMessageChannelsService } = buildResolver({
      reachableConnectedAccount: { id: CONNECTED_ACCOUNT_ID },
    });

    await resolver.connectedAccount(
      anAppChannel(),
      workspace,
      USER_WORKSPACE_ID,
      application,
    );

    expect(
      applicationMessageChannelsService.findReachableConnectedAccount,
    ).toHaveBeenCalledTimes(1);
    expect(
      applicationMessageChannelsService.findReachableConnectedAccount,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ requestUserWorkspaceId: USER_WORKSPACE_ID }),
    );
  });

  // An APPLICATION_ACCESS token can carry a user, and such a request can be
  // handed an EMAIL channel. Claiming those here sent the member's own mailbox
  // through a predicate that only matches APP connections, so a connection
  // they are entitled to see came back null.
  it('leaves an email channel on user ownership even in an application context', async () => {
    const {
      resolver,
      connectedAccountMetadataService,
      applicationMessageChannelsService,
    } = buildResolver();

    const account = await resolver.connectedAccount(
      {
        ...anAppChannel(),
        type: MessageChannelType.EMAIL,
      } as MessageChannelDTO,
      workspace,
      USER_WORKSPACE_ID,
      application,
    );

    expect(account).toMatchObject({ id: CONNECTED_ACCOUNT_ID });
    expect(
      applicationMessageChannelsService.findReachableConnectedAccount,
    ).not.toHaveBeenCalled();
    expect(
      connectedAccountMetadataService.findByIdAndUserWorkspaceId,
    ).toHaveBeenCalledTimes(1);
  });

  it('leaves the email path on user ownership when no application is calling', async () => {
    const {
      resolver,
      connectedAccountMetadataService,
      applicationMessageChannelsService,
    } = buildResolver();

    await resolver.connectedAccount(
      {
        ...anAppChannel(),
        type: MessageChannelType.EMAIL,
      } as MessageChannelDTO,
      workspace,
      USER_WORKSPACE_ID,
      undefined,
    );

    expect(
      connectedAccountMetadataService.findByIdAndUserWorkspaceId,
    ).toHaveBeenCalledTimes(1);
    expect(
      connectedAccountMetadataService.findByIdAndUserWorkspaceId,
    ).toHaveBeenCalledWith({
      id: CONNECTED_ACCOUNT_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(
      applicationMessageChannelsService.findReachableConnectedAccount,
    ).not.toHaveBeenCalled();
  });

  it('leaves the EMAIL_GROUP bypass alone', async () => {
    const { resolver, connectedAccountMetadataService } = buildResolver();

    await resolver.connectedAccount(
      {
        ...anAppChannel(),
        type: MessageChannelType.EMAIL_GROUP,
      } as MessageChannelDTO,
      workspace,
      USER_WORKSPACE_ID,
      undefined,
    );

    expect(connectedAccountMetadataService.findById).toHaveBeenCalledTimes(1);
    expect(connectedAccountMetadataService.findById).toHaveBeenCalledWith({
      id: CONNECTED_ACCOUNT_ID,
      workspaceId: WORKSPACE_ID,
    });
  });
});
