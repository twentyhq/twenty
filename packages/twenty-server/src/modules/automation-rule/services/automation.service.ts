import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AutomationRuleWorkspaceEntity } from 'src/modules/automation-rule/standard-objects/automation-rule.workspace-entity';
import { AutomationTriggerType } from 'src/modules/automation-rule/enums/automation-trigger-type.enum';
import { AutomationActionType } from 'src/modules/automation-rule/enums/automation-action-type.enum';

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

  constructor(
    @InjectRepository(AutomationRuleWorkspaceEntity, 'core')
    private readonly automationRepository: Repository<AutomationRuleWorkspaceEntity>,
  ) {}

  async executeStageChangeAutomation(context: AutomationContext): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];
    const rules = await this.automationRepository.find({
      where: { isActive: true, triggerType: AutomationTriggerType.STAGE_CHANGED },
    });

    for (const rule of rules) {
      try {
        const actions = await this.executeRule(rule, context);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          actionsExecuted: actions,
        });
      } catch (error) {
        this.logger.error(`Error executing rule ${rule.name}: ${error}`);
      }
    }

    return results;
  }

  private async executeRule(
    rule: AutomationRuleWorkspaceEntity,
    context: AutomationContext,
  ): Promise<string[]> {
    const executedActions: string[] = [];
    const triggerConditions = rule.triggerConditions
      ? JSON.parse(rule.triggerConditions)
      : {};

    if (triggerConditions.stage === context.newStage) {
      const actionConfig = rule.actionConfig
        ? JSON.parse(rule.actionConfig)
        : {};

      switch (rule.actionType) {
        case AutomationActionType.CREATE_TASK:
          executedActions.push('create_task');
          break;
        case AutomationActionType.SEND_EMAIL:
          executedActions.push('send_email');
          break;
        case AutomationActionType.NOTIFY_OWNER:
          executedActions.push('notify_owner');
          break;
        case AutomationActionType.UPDATE_FIELD:
          executedActions.push('update_field');
          break;
        default:
          break;
      }
    }

    return executedActions;
  }

  async checkInactivityAlerts(
    deals: Array<{ id: string; stage: string; daysInStage: number; ownerId: string }>,
  ): Promise<Array<{ dealId: string; alertType: string }>> {
    const alerts: Array<{ dealId: string; alertType: string }> = [];
    const rules = await this.automationRepository.find({
      where: { isActive: true, triggerType: AutomationTriggerType.STAGE_INACTIVITY },
    });

    for (const deal of deals) {
      for (const rule of rules) {
        const conditions = rule.triggerConditions
          ? JSON.parse(rule.triggerConditions)
          : {};

        if (deal.daysInStage >= conditions.maxDays && deal.stage === conditions.stage) {
          alerts.push({
            dealId: deal.id,
            alertType: 'STAGE_INACTIVITY',
          });
        }
      }
    }

    return alerts;
  }
}
