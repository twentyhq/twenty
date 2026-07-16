export const SUPPORTED_EVENT_VERSION = 1;

export const INBOUND_EVENT_TYPES = [
  'executive.created',
  'executive.updated',
  'executive_board_experience.updated',
  'executive_board_preferences.updated',
  'application.submitted',
  'application.updated',
  'application.withdrawn',
  'candidate_file.added',
  'information_request.answered',
  'availability.submitted',
  'interview.confirmed',
  'interview.cancelled',
  'reference_request.state_changed',
  'reference_submission.created',
  'ai_consent.changed',
  'ai_contest.submitted',
  'privacy.dnc_changed',
  'retention.action',
] as const;

export const OUTBOUND_EVENT_TYPES = [
  'company.projection_updated',
  'opportunity.published',
  'opportunity.updated',
  'opportunity.paused',
  'opportunity.closed',
  'candidate_status.visible_changed',
  'information_request.created',
  'availability_poll.created',
  'interview.created',
  'interview.updated',
  'interview.cancelled',
  'reference_request.initiated',
  'placement.outcome',
  'dossier.published',
] as const;

export const ALL_KNOWN_EVENT_TYPES = [
  ...INBOUND_EVENT_TYPES,
  ...OUTBOUND_EVENT_TYPES,
] as const;
