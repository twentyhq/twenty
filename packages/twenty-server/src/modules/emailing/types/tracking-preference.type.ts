import { type MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';

export type TrackingPreference = {
  decision: MessageTrackingConsentDecision | null;
};
