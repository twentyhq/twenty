import { type EmailingDomainBatchRecipient } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-batch-recipient.type';
import { type EmailingDomainSendEmailBatchResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-batch-result.type';
import { type CampaignBatchSendOutcome } from 'src/modules/emailing/types/campaign-batch-send-outcome.type';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// Drivers are not required to return one entry per recipient in the order they
// were given. Pairing by position would hand a provider message id to the wrong
// person as soon as one entry is missing or reordered, and mark someone who was
// actually mailed as failed. Entries are matched on the address instead, and
// duplicates of one address are consumed in order so two people sharing a
// mailbox still settle one entry each. A recipient no entry claims is left out,
// which settles it as an explicit failure.
export const mapDriverEntriesToRecipientIndexes = ({
  entries,
  deliverableRecipients,
  deliverableRecipientIndexes,
}: {
  entries: EmailingDomainSendEmailBatchResult['entries'];
  deliverableRecipients: EmailingDomainBatchRecipient[];
  deliverableRecipientIndexes: number[];
}): CampaignBatchSendOutcome['entries'] => {
  const unclaimedIndexesByEmail = new Map<string, number[]>();

  deliverableRecipients.forEach((recipient, deliverableIndex) => {
    const email = normalizeEmail(recipient.email);
    const unclaimedIndexes = unclaimedIndexesByEmail.get(email);
    const recipientIndex = deliverableRecipientIndexes[deliverableIndex];

    if (unclaimedIndexes === undefined) {
      unclaimedIndexesByEmail.set(email, [recipientIndex]);

      return;
    }

    unclaimedIndexes.push(recipientIndex);
  });

  return entries.flatMap((entry) => {
    const recipientIndex = unclaimedIndexesByEmail
      .get(normalizeEmail(entry.email))
      ?.shift();

    if (recipientIndex === undefined) {
      return [];
    }

    return [
      {
        recipientIndex,
        messageId: entry.messageId,
        errorMessage: entry.errorMessage,
      },
    ];
  });
};
