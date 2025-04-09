import { messagingGetMessagesServiceGetMessages } from 'src/modules/messaging/message-import-manager/utils/__mocks__/messages';
import { filterEmails } from 'src/modules/messaging/message-import-manager/utils/filter-emails.util';

describe('filterEmails', () => {
  it('Should not filter at all if primary handle is a personal email', () => {
    const primaryHandle = 'guillim@gmail.com';
    const messages = messagingGetMessagesServiceGetMessages;

    const filteredMessages = filterEmails(primaryHandle, [], messages, []);

    expect(filteredMessages).toEqual(messages);
  });

  it('Should not filter out if at least one email is from a different domain', () => {
    const primaryHandle = 'guillim@acme.com';
    const messages = messagingGetMessagesServiceGetMessages.filter(
      (message) => message.externalId === 'AA-work-emails-external',
    );

    const filteredMessages = filterEmails(primaryHandle, [], messages, []);

    expect(filteredMessages).toEqual(messages);
  });

  it('Should filter out same domain emails', () => {
    const primaryHandle = 'guillim@acme.com';
    const messages = messagingGetMessagesServiceGetMessages.filter(
      (message) => message.externalId === 'AA-work-emails-internal',
    );

    const filteredMessages = filterEmails(primaryHandle, [], messages, []);

    expect(filteredMessages).toEqual([]);
  });

  it('Should filter messages with participant from the blocklist', () => {
    const primaryHandle = 'guillim@acme.com';
    const messages = messagingGetMessagesServiceGetMessages.filter(
      (message) => message.externalId === 'AA-work-emails-internal',
    );
    const blocklist = ['to@acme.com'];
    const filteredMessages = filterEmails(
      primaryHandle,
      [],
      messages,
      blocklist,
    );

    expect(filteredMessages).toEqual([]);
  });
});
