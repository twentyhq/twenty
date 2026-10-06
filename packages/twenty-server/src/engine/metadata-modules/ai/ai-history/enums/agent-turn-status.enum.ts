import { registerEnumType } from '@nestjs/graphql';

export enum AgentTurnStatus {
  RUNNING = 'running',
  WAITING_FOR_INPUT = 'waiting_for_input',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

registerEnumType(AgentTurnStatus, { name: 'AgentTurnStatus' });
