import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';

export const resolvePersonEmailTrackingConsent = ({
  emailAddresses,
  decisionByEmailAddress,
}: {
  emailAddresses: string[];
  decisionByEmailAddress: Map<string, MessageTrackingConsentDecision>;
}): MessageTrackingConsentDecision | null => {
  const decisions = emailAddresses.flatMap((emailAddress) => {
    const decision = decisionByEmailAddress.get(emailAddress);

    return decision === undefined ? [] : [decision];
  });

  if (decisions.includes(MessageTrackingConsentDecision.DENIED)) {
    return MessageTrackingConsentDecision.DENIED;
  }

  if (decisions.includes(MessageTrackingConsentDecision.GRANTED)) {
    return MessageTrackingConsentDecision.GRANTED;
  }

  return null;
};
