import { MessageParticipantRole } from 'twenty-shared/types';

export const BLOCKLISTED_PARTICIPANT_ROLES = [
  MessageParticipantRole.FROM,
  MessageParticipantRole.TO,
] as const;
