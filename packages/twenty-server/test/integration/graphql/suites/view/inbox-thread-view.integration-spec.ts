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
  presetFilter: ViewPresetFilter | null;
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
  presetFilter
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

const INBOX_CHANNEL_PRESET_FILTERS: (ViewPresetFilter | null)[] = [
  ViewPresetFilter.INBOX_CHANNEL_OPEN,
  ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
  ViewPresetFilter.INBOX_CHANNEL_DONE,
];

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
    .map(({ name, type, presetFilter }) => ({ name, type, presetFilter }));

const EXPECTED_INBOX_CHANNEL_VIEWS = [
  {
    name: 'Open',
    type: ViewType.INBOX,
    presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
  },
  {
    name: 'Snoozed',
    type: ViewType.INBOX,
    presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
  },
  {
    name: 'Done',
    type: ViewType.INBOX,
    presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
  },
];

describe('Inbox thread views', () => {
  let inboxThreadObjectMetadataId: string;

  beforeAll(async () => {
    inboxThreadObjectMetadataId =
      await findObjectMetadataIdByName('agentChatThread');
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

    expect(
      inboxThreadViews
        .filter(
          ({ presetFilter }) =>
            !INBOX_CHANNEL_PRESET_FILTERS.includes(presetFilter),
        )
        .sort((viewA, viewB) => viewA.position - viewB.position)
        .map(({ name, type, presetFilter, viewFilters }) => ({
          name,
          type,
          presetFilter,
          viewFilters,
        })),
    ).toEqual([
      {
        name: 'Open',
        type: ViewType.INBOX,
        presetFilter: ViewPresetFilter.INBOX_OPEN,
        viewFilters: [],
      },
      {
        name: 'Needs input',
        type: ViewType.INBOX,
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
        type: ViewType.INBOX,
        presetFilter: ViewPresetFilter.INBOX_MENTIONS,
        viewFilters: [],
      },
      {
        name: 'Assigned to me',
        type: ViewType.INBOX,
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
        type: ViewType.INBOX,
        presetFilter: ViewPresetFilter.INBOX_SNOOZED,
        viewFilters: [],
      },
      {
        name: 'Done',
        type: ViewType.INBOX,
        presetFilter: ViewPresetFilter.INBOX_DONE,
        viewFilters: [],
      },
    ]);
  });

  it('should create, read and destroy an inbox thread view with a preset filter', async () => {
    const { data } = await createOneView({
      input: {
        name: 'My done threads',
        objectMetadataId: inboxThreadObjectMetadataId,
        icon: 'IconCircleCheck',
        type: ViewType.INBOX,
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
      type: ViewType.INBOX,
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
    ).toEqual(EXPECTED_INBOX_CHANNEL_VIEWS);

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
    ).toEqual(EXPECTED_INBOX_CHANNEL_VIEWS);

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
