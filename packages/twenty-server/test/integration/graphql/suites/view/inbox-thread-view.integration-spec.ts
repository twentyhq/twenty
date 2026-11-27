import {
  CREATE_CHANNEL,
  DELETE_CHANNEL,
  listChannels,
} from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import {
  ViewFilterOperand,
  ViewPresetFilter,
  ViewType,
} from 'twenty-shared/types';

type InboxThreadView = {
  id: string;
  name: string;
  type: ViewType;
  position: number;
  isCompact: boolean;
  listPinnedFieldMetadataId: string | null;
  presetFilter: ViewPresetFilter | null;
  viewFields: {
    fieldMetadataId: string;
    position: number;
    isVisible: boolean;
  }[];
  viewFilters: {
    fieldMetadataId: string;
    operand: ViewFilterOperand;
    value: string;
  }[];
};

const INBOX_THREAD_VIEW_GQL_FIELDS = `
  id
  name
  type
  position
  isCompact
  listPinnedFieldMetadataId
  presetFilter
  viewFields {
    fieldMetadataId
    position
    isVisible
  }
  viewFilters {
    fieldMetadataId
    operand
    value
  }
`;

const findInboxThreadViews = async (objectMetadataId: string) => {
  const { data } = await findViews<InboxThreadView>({
    objectMetadataId,
    gqlFields: INBOX_THREAD_VIEW_GQL_FIELDS,
    expectToFail: false,
  });

  return data.getViews;
};

const INBOX_THREAD_VIEW_FIELDS = [
  { fieldName: 'title', isVisible: true },
  { fieldName: 'channelId', isVisible: true },
  { fieldName: 'lastMessageSenderWorkspaceMemberId', isVisible: true },
  { fieldName: 'lastMessageText', isVisible: true },
  { fieldName: 'assignee', isVisible: false },
  { fieldName: 'createdAt', isVisible: false },
];

const toInboxThreadViewListSettings = ({
  type,
  isCompact,
  listPinnedFieldMetadataId,
  viewFields,
}: Pick<
  InboxThreadView,
  'type' | 'isCompact' | 'listPinnedFieldMetadataId' | 'viewFields'
>) => ({
  type,
  isCompact,
  listPinnedFieldMetadataId,
  viewFields: [...viewFields]
    .sort((viewFieldA, viewFieldB) => viewFieldA.position - viewFieldB.position)
    .map(({ fieldMetadataId, isVisible }) => ({ fieldMetadataId, isVisible })),
});

const findInboxChannelViews = async ({
  objectMetadataId,
  channelId,
}: {
  objectMetadataId: string;
  channelId: string;
}) =>
  (await findInboxThreadViews(objectMetadataId))
    .filter(({ viewFilters }) =>
      viewFilters.some(
        ({ operand, value }) =>
          operand === ViewFilterOperand.IS &&
          value === JSON.stringify([channelId]),
      ),
    )
    .sort((viewA, viewB) => viewA.position - viewB.position)
    .map((view) => ({
      name: view.name,
      presetFilter: view.presetFilter,
      ...toInboxThreadViewListSettings(view),
    }));

const INBOX_CHANNEL_VIEWS = [
  { name: 'Open', presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN },
  { name: 'Mentions', presetFilter: ViewPresetFilter.INBOX_MENTIONS },
  { name: 'Snoozed', presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED },
  { name: 'Done', presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE },
];

describe('Inbox thread views', () => {
  let inboxThreadObjectMetadataId: string;
  let expectedInboxThreadViewListSettings: ReturnType<
    typeof toInboxThreadViewListSettings
  >;
  let expectedInboxChannelViews: Awaited<
    ReturnType<typeof findInboxChannelViews>
  >;

  beforeAll(async () => {
    inboxThreadObjectMetadataId =
      await findObjectMetadataIdByName('agentChatThread');

    const findInboxThreadFieldMetadataId = (fieldName: string) =>
      findFieldMetadataIdByName({
        objectMetadataId: inboxThreadObjectMetadataId,
        fieldName,
      });

    expectedInboxThreadViewListSettings = {
      type: ViewType.LIST,
      isCompact: false,
      listPinnedFieldMetadataId:
        await findInboxThreadFieldMetadataId('lastActivityAt'),
      viewFields: await Promise.all(
        INBOX_THREAD_VIEW_FIELDS.map(async ({ fieldName, isVisible }) => ({
          fieldMetadataId: await findInboxThreadFieldMetadataId(fieldName),
          isVisible,
        })),
      ),
    };

    expectedInboxChannelViews = INBOX_CHANNEL_VIEWS.map((channelView) => ({
      ...channelView,
      ...expectedInboxThreadViewListSettings,
    }));
  });

  it('should seed the standard inbox views with their presets and saved filters', async () => {
    const inboxThreadViews = await findInboxThreadViews(
      inboxThreadObjectMetadataId,
    );
    const pendingQuestionMessageIdFieldMetadataId =
      await findFieldMetadataIdByName({
        objectMetadataId: inboxThreadObjectMetadataId,
        fieldName: 'pendingQuestionMessageId',
      });
    const assigneeFieldMetadataId = await findFieldMetadataIdByName({
      objectMetadataId: inboxThreadObjectMetadataId,
      fieldName: 'assignee',
    });
    const channelFieldMetadataId = await findFieldMetadataIdByName({
      objectMetadataId: inboxThreadObjectMetadataId,
      fieldName: 'channelId',
    });

    expect(
      inboxThreadViews
        .filter(
          ({ viewFilters }) =>
            !viewFilters.some(
              ({ fieldMetadataId }) =>
                fieldMetadataId === channelFieldMetadataId,
            ),
        )
        .sort((viewA, viewB) => viewA.position - viewB.position)
        .map((view) => ({
          name: view.name,
          presetFilter: view.presetFilter,
          viewFilters: view.viewFilters,
          ...toInboxThreadViewListSettings(view),
        })),
    ).toEqual(
      [
        {
          name: 'Open',
          presetFilter: ViewPresetFilter.INBOX_OPEN,
          viewFilters: [],
        },
        {
          name: 'Needs input',
          presetFilter: ViewPresetFilter.INBOX_OPEN,
          viewFilters: [
            {
              fieldMetadataId: pendingQuestionMessageIdFieldMetadataId,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
        {
          name: 'Mentions',
          presetFilter: ViewPresetFilter.INBOX_MENTIONS,
          viewFilters: [],
        },
        {
          name: 'Assigned to me',
          presetFilter: ViewPresetFilter.INBOX_OPEN,
          viewFilters: [
            {
              fieldMetadataId: assigneeFieldMetadataId,
              operand: ViewFilterOperand.IS,
              value: JSON.stringify({
                isCurrentWorkspaceMemberSelected: true,
                selectedRecordIds: [],
              }),
            },
          ],
        },
        {
          name: 'Snoozed',
          presetFilter: ViewPresetFilter.INBOX_SNOOZED,
          viewFilters: [],
        },
        {
          name: 'Done',
          presetFilter: ViewPresetFilter.INBOX_DONE,
          viewFilters: [],
        },
      ].map((standardView) => ({
        ...standardView,
        ...expectedInboxThreadViewListSettings,
      })),
    );
  });

  it('should refuse the inbox view type on a new view and on an existing one', async () => {
    const { errors: createErrors } = await createOneView({
      input: {
        name: 'Inbox typed view',
        objectMetadataId: inboxThreadObjectMetadataId,
        icon: 'IconInbox',
        type: ViewType.INBOX,
      },
      gqlFields: 'id',
      expectToFail: true,
    });

    expect(createErrors).toBeDefined();

    const [inboxThreadView] = await findInboxThreadViews(
      inboxThreadObjectMetadataId,
    );

    const { errors: updateErrors } = await updateOneView({
      viewId: inboxThreadView.id,
      input: { id: inboxThreadView.id, type: ViewType.INBOX },
      gqlFields: 'id',
      expectToFail: true,
    });

    expect(updateErrors).toBeDefined();
    expect(
      (await findInboxThreadViews(inboxThreadObjectMetadataId)).some(
        ({ type }) => type === ViewType.INBOX,
      ),
    ).toBe(false);
  });

  it('should create, read and destroy an inbox thread view with a preset filter', async () => {
    const { data } = await createOneView({
      input: {
        name: 'My done threads',
        objectMetadataId: inboxThreadObjectMetadataId,
        icon: 'IconCircleCheck',
        type: ViewType.LIST,
        presetFilter: ViewPresetFilter.INBOX_DONE,
      },
      gqlFields: 'id presetFilter',
      expectToFail: false,
    });

    const createdViewId = data.createView.id;

    expect(data.createView.presetFilter).toBe(ViewPresetFilter.INBOX_DONE);
    expect(
      (await findInboxThreadViews(inboxThreadObjectMetadataId)).find(
        (view) => view.id === createdViewId,
      ),
    ).toMatchObject({
      name: 'My done threads',
      type: ViewType.LIST,
      presetFilter: ViewPresetFilter.INBOX_DONE,
    });

    await destroyOneView({ viewId: createdViewId, expectToFail: false });

    expect(
      (await findInboxThreadViews(inboxThreadObjectMetadataId)).some(
        (view) => view.id === createdViewId,
      ),
    ).toBe(false);
  });

  it('should give an inbox channel its views and remove them with the channel', async () => {
    const generalChannel = (await listChannels()).find(
      ({ isCustom }) => !isCustom,
    );

    expect(
      await findInboxChannelViews({
        objectMetadataId: inboxThreadObjectMetadataId,
        channelId: generalChannel?.id ?? '',
      }),
    ).toEqual(expectedInboxChannelViews);

    const createChannelResponse = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: 'Inbox channel views', roleIds: [] } },
    });

    assertGraphQLSuccessfulResponse(createChannelResponse);

    const channelId: string =
      createChannelResponse.body.data.createAgentChatChannel.id;

    expect(
      await findInboxChannelViews({
        objectMetadataId: inboxThreadObjectMetadataId,
        channelId,
      }),
    ).toEqual(expectedInboxChannelViews);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId: null },
      }),
    );

    expect(
      await findInboxChannelViews({
        objectMetadataId: inboxThreadObjectMetadataId,
        channelId,
      }),
    ).toEqual([]);
  });
});
