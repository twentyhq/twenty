import { ViewType } from 'twenty-shared/types';

import { validateFlatViewTypeIsNotInbox } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-type-is-not-inbox.util';

const INBOX_VIEW_TYPE_ERROR_MESSAGES = [
  'Inbox view type is no longer available',
];

describe('validateFlatViewTypeIsNotInbox', () => {
  it('accepts a list view and an update that leaves the type alone', () => {
    expect(
      validateFlatViewTypeIsNotInbox({
        type: ViewType.LIST,
        universalOverrides: null,
      }),
    ).toEqual([]);
    expect(validateFlatViewTypeIsNotInbox({})).toEqual([]);
  });

  it('rejects the inbox view type', () => {
    expect(
      validateFlatViewTypeIsNotInbox({ type: ViewType.INBOX }).map(
        ({ message }) => message,
      ),
    ).toEqual(INBOX_VIEW_TYPE_ERROR_MESSAGES);
  });

  it('rejects the inbox view type set through an override', () => {
    expect(
      validateFlatViewTypeIsNotInbox({
        type: ViewType.TABLE,
        universalOverrides: {
          'workspace-custom-application': { type: ViewType.INBOX },
        },
      }).map(({ message }) => message),
    ).toEqual(INBOX_VIEW_TYPE_ERROR_MESSAGES);
  });
});
