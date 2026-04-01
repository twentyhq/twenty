import { registerEnumType } from '@nestjs/graphql';

export enum AutomationTriggerType {
  STAGE_CHANGED = 'STAGE_CHANGED',
  DEAL_CREATED = 'DEAL_CREATED',
  DEAL_UPDATED = 'DEAL_UPDATED',
  DEAL_ASSIGNED = 'DEAL_ASSIGNED',
  DEAL_WON = 'DEAL_WON',
  DEAL_LOST = 'DEAL_LOST',
  STAGE_INACTIVITY = 'STAGE_INACTIVITY',
}

registerEnumType(AutomationTriggerType, {
  name: 'AutomationTriggerType',
  description: 'Trigger type for automation',
});
