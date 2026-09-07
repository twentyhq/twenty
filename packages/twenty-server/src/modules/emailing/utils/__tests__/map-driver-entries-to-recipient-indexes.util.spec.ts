import { mapDriverEntriesToRecipientIndexes } from 'src/modules/emailing/utils/map-driver-entries-to-recipient-indexes.util';

const buildRecipient = (email: string) => ({ email, replacements: {} });

describe('mapDriverEntriesToRecipientIndexes', () => {
  it('maps entries onto the recipient indexes they were sent for', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: 'a@example.com', messageId: 'id-a', errorMessage: null },
          { email: 'b@example.com', messageId: 'id-b', errorMessage: null },
        ],
        deliverableRecipients: [
          buildRecipient('a@example.com'),
          buildRecipient('b@example.com'),
        ],
        deliverableRecipientIndexes: [3, 7],
      }),
    ).toEqual([
      { recipientIndex: 3, messageId: 'id-a', errorMessage: null },
      { recipientIndex: 7, messageId: 'id-b', errorMessage: null },
    ]);
  });

  it('follows the address when the driver reorders its entries', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: 'b@example.com', messageId: 'id-b', errorMessage: null },
          { email: 'a@example.com', messageId: 'id-a', errorMessage: null },
        ],
        deliverableRecipients: [
          buildRecipient('a@example.com'),
          buildRecipient('b@example.com'),
        ],
        deliverableRecipientIndexes: [3, 7],
      }),
    ).toEqual([
      { recipientIndex: 7, messageId: 'id-b', errorMessage: null },
      { recipientIndex: 3, messageId: 'id-a', errorMessage: null },
    ]);
  });

  it('leaves a recipient the driver omitted unmapped rather than shifting the rest', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: 'c@example.com', messageId: 'id-c', errorMessage: null },
        ],
        deliverableRecipients: [
          buildRecipient('a@example.com'),
          buildRecipient('b@example.com'),
          buildRecipient('c@example.com'),
        ],
        deliverableRecipientIndexes: [0, 1, 2],
      }),
    ).toEqual([{ recipientIndex: 2, messageId: 'id-c', errorMessage: null }]);
  });

  it('gives two people sharing an address one entry each', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: 'same@example.com', messageId: 'id-1', errorMessage: null },
          { email: 'same@example.com', messageId: 'id-2', errorMessage: null },
        ],
        deliverableRecipients: [
          buildRecipient('same@example.com'),
          buildRecipient('same@example.com'),
        ],
        deliverableRecipientIndexes: [4, 9],
      }),
    ).toEqual([
      { recipientIndex: 4, messageId: 'id-1', errorMessage: null },
      { recipientIndex: 9, messageId: 'id-2', errorMessage: null },
    ]);
  });

  it('matches regardless of address casing and padding', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: ' A@Example.com ', messageId: 'id-a', errorMessage: null },
        ],
        deliverableRecipients: [buildRecipient('a@example.com')],
        deliverableRecipientIndexes: [0],
      }),
    ).toEqual([{ recipientIndex: 0, messageId: 'id-a', errorMessage: null }]);
  });

  it('keeps a per-entry failure attached to its own recipient', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: 'b@example.com', messageId: null, errorMessage: 'rejected' },
          { email: 'a@example.com', messageId: 'id-a', errorMessage: null },
        ],
        deliverableRecipients: [
          buildRecipient('a@example.com'),
          buildRecipient('b@example.com'),
        ],
        deliverableRecipientIndexes: [0, 1],
      }),
    ).toEqual([
      { recipientIndex: 1, messageId: null, errorMessage: 'rejected' },
      { recipientIndex: 0, messageId: 'id-a', errorMessage: null },
    ]);
  });

  it('drops an entry for an address that was never sent to', () => {
    expect(
      mapDriverEntriesToRecipientIndexes({
        entries: [
          { email: 'ghost@example.com', messageId: 'id-x', errorMessage: null },
        ],
        deliverableRecipients: [buildRecipient('a@example.com')],
        deliverableRecipientIndexes: [0],
      }),
    ).toEqual([]);
  });
});
