import { Injectable, Logger } from '@nestjs/common';

import { AutomationActionType } from 'src/modules/automation-rule/enums/automation-action-type.enum';
import { AutomationTriggerType } from 'src/modules/automation-rule/enums/automation-trigger-type.enum';

export interface AutomationContext {
  opportunityId: string;
  oldStage?: string;
  newStage: string;
  ownerId?: string;
}

export interface AutomationResult {
  ruleId: string;
  ruleName: string;
  actionsExecuted: string[];
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  async executeStageChangeAutomation(context: AutomationContext): Promise<AutomationResult[]> {
    this.logger.log(
      `Executing stage change automation for opportunity ${context.opportunityId}: ${context.oldStage} -> ${context.newStage}`,
    );
    return [];
  }

  async checkInactivityAlerts(
    deals: Array<{ id: string; stage: string; daysInStage: number; ownerId: string }>,
  ): Promise<Array<{ dealId: string; alertType: string }>> {
    this.logger.log(`Checking inactivity alerts for ${deals.length} deals`);
    return [];
  }

  getActionTypes(): string[] {
    return Object.values(AutomationActionType);
  }

  getTriggerTypes(): string[] {
    return Object.values(AutomationTriggerType);
  }
}
