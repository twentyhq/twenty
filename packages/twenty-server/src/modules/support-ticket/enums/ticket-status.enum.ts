import { registerEnumType } from '@nestjs/graphql';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

registerEnumType(TicketStatus, {
  name: 'TicketStatus',
  description: 'Ticket status',
});
