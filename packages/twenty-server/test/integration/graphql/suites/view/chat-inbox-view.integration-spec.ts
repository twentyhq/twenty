import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import {
  ViewFilterOperand,
  ViewPresetFilter,
  ViewType,
} from 'twenty-shared/types';

type ChatView = {
  id: string;
  name: string;
  type: ViewType;
  position: number;
  presetFilter: ViewPresetFilter | null;
  viewFilters: { operand: ViewFilterOperand; value: unknown }[];
};

const CHAT_VIEW_GQL_FIELDS = `
  id
  name
  type
  position
  presetFilter
  viewFilters {
    operand
    value
  }
`;

const findChatViews = async (objectMetadataId: string) => {
  const { data } = await findViews<ChatView>({
    objectMetadataId,
    gqlFields: CHAT_VIEW_GQL_FIELDS,
    expectToFail: false,
  });

  return data.getViews;
};

describe('Chat inbox views', () => {
  let chatObjectMetadataId: string;

  beforeAll(async () => {
    chatObjectMetadataId = await findObjectMetadataIdByName('agentChatThread');
  });

  it('should seed the standard inbox views with their presets and saved filters', async () => {
    const chatViews = await findChatViews(chatObjectMetadataId);

    expect(
      chatViews
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
        viewFilters: [{ operand: ViewFilterOperand.IS_NOT_EMPTY, value: '' }],
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

  it('should create, read and destroy a chat view with a preset filter', async () => {
    const { data } = await createOneView({
      input: {
        name: 'My done chats',
        objectMetadataId: chatObjectMetadataId,
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
      (await findChatViews(chatObjectMetadataId)).find(
        (view) => view.id === createdViewId,
      ),
    ).toMatchObject({
      name: 'My done chats',
      type: ViewType.INBOX,
      presetFilter: ViewPresetFilter.INBOX_DONE,
    });

    await destroyOneView({ viewId: createdViewId, expectToFail: false });

    expect(
      (await findChatViews(chatObjectMetadataId)).some(
        (view) => view.id === createdViewId,
      ),
    ).toBe(false);
  });
});
