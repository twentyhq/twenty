import { type MessageDescriptor } from '@lingui/core';

import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CreateCalendarEventInput } from 'src/modules/calendar/calendar-event-creation-manager/dtos/create-calendar-event.input';
import {
  CalendarEventCreationException,
  CalendarEventCreationExceptionCode,
} from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { CreateCalendarEventResolver } from 'src/modules/calendar/calendar-event-creation-manager/resolvers/create-calendar-event.resolver';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const USER_WORKSPACE_ID = '66666666-6666-4666-8666-666666666666';

describe('CreateCalendarEventResolver errors', () => {
  const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;
  const context: I18nContext = { req: { locale: 'fr-FR' } };
  const input = {
    connectedAccountId: 'connected-account-id',
    title: 'Kickoff',
    startsAt: '2026-07-01T15:00:00Z',
    endsAt: '2026-07-01T16:00:00Z',
  } as CreateCalendarEventInput;

  const buildResolver = ({
    composeCalendarEvent,
    createComposedCalendarEvent = jest.fn(),
  }: {
    composeCalendarEvent: jest.Mock;
    createComposedCalendarEvent?: jest.Mock;
  }) => {
    const i18nService = {
      getI18nInstance: jest.fn((locale: string) => ({
        _: (descriptor: MessageDescriptor) => `${locale}:${descriptor.message}`,
      })),
    };

    return new CreateCalendarEventResolver(
      { verifyUsableByCaller: jest.fn() } as never,
      { composeCalendarEvent } as never,
      { createComposedCalendarEvent } as never,
      i18nService as never,
    );
  };

  it('translates a composition failure for the request locale', async () => {
    const resolver = buildResolver({
      composeCalendarEvent: jest.fn().mockResolvedValue({
        success: false,
        error: { id: 'title-required', message: 'A title is required' },
      }),
    });

    const result = await resolver.createCalendarEvent(
      input,
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toEqual({
      success: false,
      error: 'fr-FR:A title is required',
    });
  });

  it('returns the translated user-friendly message of a provider failure', async () => {
    const exception = new CalendarEventCreationException(
      'Google Calendar API returned 403: insufficientPermissions',
      CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED,
    );
    const resolver = buildResolver({
      composeCalendarEvent: jest
        .fn()
        .mockResolvedValue({ success: true, data: {} }),
      createComposedCalendarEvent: jest.fn().mockRejectedValue(exception),
    });

    const result = await resolver.createCalendarEvent(
      input,
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toEqual({
      success: false,
      error: `fr-FR:${exception.userFriendlyMessage.message}`,
    });
  });

  it('returns no error text for an unexpected error so the client shows its fallback', async () => {
    const resolver = buildResolver({
      composeCalendarEvent: jest
        .fn()
        .mockResolvedValue({ success: true, data: {} }),
      createComposedCalendarEvent: jest
        .fn()
        .mockRejectedValue(new Error('socket hang up')),
    });

    const result = await resolver.createCalendarEvent(
      input,
      workspace,
      USER_WORKSPACE_ID,
      context,
    );

    expect(result).toStrictEqual({ success: false });
  });
});
