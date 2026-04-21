import { Injectable, Logger } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Injectable()
export class CrmExecutionDataAccessService {
  private readonly logger = new Logger(CrmExecutionDataAccessService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async cloneDeal(
    workspaceId: string,
    sourceDealId: string,
    newDealName: string,
    options: {
      cloneCompany: boolean;
      cloneContacts: boolean;
      cloneActivities: boolean;
      cloneNotes: boolean;
      cloneTasks: boolean;
      resetStage: boolean;
      resetCloseDate: boolean;
    },
  ) {
    const workspaceRepository = await this.globalWorkspaceOrmManager.getRepository({
      name: 'opportunity',
      workspaceId,
    });

    const sourceDeal = await workspaceRepository.findOne({
      where: { id: sourceDealId },
    });

    if (!sourceDeal) {
      throw new Error(`Deal ${sourceDealId} not found`);
    }

    const newDealData = {
      name: newDealName,
      amount: sourceDeal.amount,
      stage: options.resetStage ? 'NEW' : sourceDeal.stage,
      closeDate: options.resetCloseDate ? null : sourceDeal.closeDate,
      probability: sourceDeal.probability,
      leadSource: sourceDeal.leadSource,
      companyId: options.cloneCompany ? null : sourceDeal.companyId,
      pointOfContactId: options.cloneContacts ? null : sourceDeal.pointOfContactId,
      pipelineId: sourceDeal.pipelineId,
      ownerId: sourceDeal.ownerId,
      stageChangedAt: options.resetStage ? new Date() : sourceDeal.stageChangedAt,
      daysInStage: options.resetStage ? 0 : sourceDeal.daysInStage,
      weightedAmount: options.resetStage ? 0 : sourceDeal.weightedAmount,
    };

    const clonedDeal = await workspaceRepository.save(newDealData);

    const warnings: string[] = [];
    
    if (options.cloneCompany) {
      warnings.push('Company cloning not implemented - please manually link');
    }
    if (options.cloneContacts) {
      warnings.push('Contact cloning not implemented - please manually link');
    }
    if (options.resetStage) {
      warnings.push('Stage reset to NEW');
    }
    if (options.resetCloseDate) {
      warnings.push('Close date cleared - please set new close date');
    }

    return {
      clonedDealId: clonedDeal.id,
      clonedDealName: clonedDeal.name,
      warnings,
    };
  }

  async buildAccountHierarchy(workspaceId: string) {
    const workspaceRepository = await this.globalWorkspaceOrmManager.getRepository({
      name: 'company',
      workspaceId,
    });

    const accounts = await workspaceRepository.find();

    const accountMap = new Map(
      accounts.map((acc) => [acc.id, { 
        id: acc.id, 
        name: acc.name, 
        parentCompanyId: (acc as any).parentCompanyId || null,
        level: 0,
        children: [] as typeof accounts 
      }]),
    );

    const hierarchies: Array<{
      rootAccountId: string;
      rootAccountName: string;
      level: number;
      children: Array<{ accountId: string; accountName: string; level: number }>;
    }> = [];

    accountMap.forEach((account) => {
      if (!account.parentCompanyId) {
        const buildChildren = (parentId: string, level: number): typeof accounts => {
          const children: typeof accounts = [];
          accountMap.forEach((acc) => {
            if (acc.parentCompanyId === parentId) {
              children.push(acc);
              const nestedChildren = buildChildren(acc.id, level + 1);
              (acc as any).level = level + 1;
            }
          });
          return children;
        };

        const rootChildren = buildChildren(account.id, 1);

        hierarchies.push({
          rootAccountId: account.id,
          rootAccountName: account.name,
          level: 0,
          children: rootChildren.map(c => ({
            accountId: c.id,
            accountName: c.name,
            level: (c as any).level || 1,
          })),
        });
      }
    });

    const depth = Math.max(...Array.from(accountMap.values()).map(a => (a as any).level || 0));

    const flatStructure: Record<string, string[]> = {};
    accountMap.forEach((account, id) => {
      if (!account.parentCompanyId) {
        flatStructure[id] = Array.from(accountMap.entries())
          .filter(([_, acc]) => acc.parentCompanyId === id)
          .map(([accId]) => accId);
      }
    });

    return {
      hierarchies,
      depth,
      flatStructure,
      totalAccounts: accounts.length,
    };
  }

  async trackCompetitors(
    workspaceId: string,
    dealId: string,
    competitors: Array<{
      competitorId: string;
      competitorName: string;
      strength: 'strong' | 'moderate' | 'weak';
      notes?: string;
    }>,
  ) {
    const workspaceRepository = await this.globalWorkspaceOrmManager.getRepository({
      name: 'opportunity',
      workspaceId,
    });

    const deal = await workspaceRepository.findOne({
      where: { id: dealId },
    });

    if (!deal) {
      throw new Error(`Deal ${dealId} not found`);
    }

    const existingCompetitors = (deal as any).competitors || [];
    const allCompetitors = [...existingCompetitors, ...competitors];

    await workspaceRepository.update(dealId, {
      competitors: allCompetitors,
    } as any);

    if (competitors.length === 0) {
      return {
        dealId,
        competitors: [],
        threatLevel: 'low' as const,
        winningProbability: 100,
      };
    }

    const strongCount = competitors.filter((c) => c.strength === 'strong').length;
    const moderateCount = competitors.filter((c) => c.strength === 'moderate').length;

    let threatLevel: 'high' | 'medium' | 'low' = 'low';
    let winningProbability = 80;

    if (strongCount >= 2) {
      threatLevel = 'high';
      winningProbability = 20;
    } else if (strongCount === 1 || moderateCount >= 2) {
      threatLevel = 'medium';
      winningProbability = 45;
    } else if (moderateCount === 1) {
      threatLevel = 'low';
      winningProbability = 65;
    }

    const competitorsWithThreat = competitors.map((competitor, index) => ({
      ...competitor,
      isPrimaryThreat: index === 0 && competitor.strength === 'strong',
    }));

    return {
      dealId,
      competitors: competitorsWithThreat,
      threatLevel,
      winningProbability,
    };
  }

  async calculateExpansionRevenue(
    workspaceId: string,
    accountId: string,
  ) {
    const companyRepository = await this.globalWorkspaceOrmManager.getRepository({
      name: 'company',
      workspaceId,
    });

    const opportunityRepository = await this.globalWorkspaceOrmManager.getRepository({
      name: 'opportunity',
      workspaceId,
    });

    const company = await companyRepository.findOne({
      where: { id: accountId },
    });

    if (!company) {
      throw new Error(`Account ${accountId} not found`);
    }

    const currentMrr = (company as any).annualRevenue || 0;

    const opportunities = await opportunityRepository.find({
      where: { 
        companyId: accountId,
        stage: 'NEW',
      },
    });

    const expansionOpportunities = opportunities.map(opp => ({
      opportunityId: opp.id,
      type: 'upsell' as const,
      description: opp.name,
      probability: opp.probability,
      amount: (opp.amount as any)?.amount || opp.weightedAmount || 0,
      targetDate: opp.closeDate?.toISOString() || new Date().toISOString(),
      weightedValue: ((opp.amount as any)?.amount || opp.weightedAmount || 0) * opp.probability / 100,
    }));

    const totalExpansionRevenue = expansionOpportunities.reduce((sum, opp) => sum + opp.amount, 0);
    const totalWeightedValue = expansionOpportunities.reduce((sum, opp) => sum + opp.weightedValue, 0);

    const projectedMrr = currentMrr + totalExpansionRevenue;
    const expansionRate = currentMrr > 0 ? (totalExpansionRevenue / currentMrr) * 100 : 0;

    let riskAssessment: 'high' | 'medium' | 'low' = 'low';
    const lowProbabilityOpps = expansionOpportunities.filter((opp) => opp.probability < 30);
    if (lowProbabilityOpps.length > 3) {
      riskAssessment = 'high';
    } else if (lowProbabilityOpps.length > 1) {
      riskAssessment = 'medium';
    }

    const recommendedNextSteps: string[] = [];
    if (expansionOpportunities.length > 0) {
      recommendedNextSteps.push('Review open opportunities for expansion');
      recommendedNextSteps.push('Prioritize by weighted value');
      recommendedNextSteps.push('Assign ownership to expansion team');
    }

    return {
      accountId,
      accountName: company.name,
      currentMrr,
      projectedMrr,
      expansionRevenue: totalExpansionRevenue,
      expansionRate,
      opportunities: expansionOpportunities,
      riskAssessment,
      recommendedNextSteps,
    };
  }

  async createBlueprint(
    workspaceId: string,
    data: {
      name: string;
      stages: BlueprintStage[];
      isActive: boolean;
    },
  ) {
    this.logger.warn('Blueprint persistence requires migration - using in-memory only');
    const id = `blueprint_${Date.now()}`;
    return { id, ...data, createdAt: new Date() };
  }

  async getBlueprints(workspaceId: string) {
    this.logger.warn('Blueprint persistence requires migration');
    return [];
  }

  async getBlueprintById(workspaceId: string, id: string) {
    this.logger.warn('Blueprint persistence requires migration');
    return null;
  }

  async deleteBlueprint(workspaceId: string, id: string) {
    this.logger.warn('Blueprint persistence requires migration');
  }

  async createPlaybook(
    workspaceId: string,
    data: {
      name: string;
      triggerType: 'onboarding' | 'health_score' | 'renewal' | 'upsell' | 'custom';
      steps: Array<{
        stepId: string;
        title: string;
        description: string;
        order: number;
        durationDays?: number;
        assignees?: string[];
        completionCriteria?: string;
      }>;
      isActive: boolean;
      estimatedDurationDays: number;
    },
  ) {
    this.logger.warn('Playbook persistence requires migration - using in-memory only');
    const id = `playbook_${Date.now()}`;
    return { id, ...data, createdAt: new Date() };
  }

  async getPlaybooks(workspaceId: string) {
    this.logger.warn('Playbook persistence requires migration');
    return [];
  }

  async getPlaybookById(workspaceId: string, id: string) {
    this.logger.warn('Playbook persistence requires migration');
    return null;
  }

  async saveEarnedRevenue(
    workspaceId: string,
    data: {
      dealId: string;
      startDate: Date;
      milestones: EarnedRevenueMilestone[];
      totalTargetAmount: number;
      totalEarnedAmount: number;
      progress: number;
      projectedCompletionDate: Date;
      riskFlags: string[];
    },
  ) {
    this.logger.warn('EarnedRevenue persistence requires migration - using in-memory only');
    const id = `earned_${Date.now()}`;
    return { id, ...data, createdAt: new Date() };
  }

  async getEarnedRevenueByDeal(workspaceId: string, dealId: string) {
    this.logger.warn('EarnedRevenue persistence requires migration');
    return null;
  }

  async getEarnedRevenueList(workspaceId: string) {
    this.logger.warn('EarnedRevenue persistence requires migration');
    return [];
  }

  async createAuditLog(
    workspaceId: string,
    data: {
      entityType: string;
      entityId: string;
      action: AuditLogAction;
      changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
      userId: string;
      userName: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    },
  ) {
    this.logger.warn('AuditLog persistence requires migration - using in-memory only');
    const id = `audit_${Date.now()}`;
    const checksum = this.generateChecksum(JSON.stringify(data));
    return { id, ...data, checksum, createdAt: new Date() };
  }

  async getAuditLogs(
    workspaceId: string,
    options: {
      entityType?: string;
      entityId?: string;
      userId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    this.logger.warn('AuditLog persistence requires migration');
    return [];
  }

  async verifyAuditLog(workspaceId: string, logId: string) {
    this.logger.warn('AuditLog persistence requires migration');
    return { verified: false, currentChecksum: '' };
  }

  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

interface BlueprintStage {
  stageId: string;
  name: string;
  order: number;
  description?: string;
  requiredFields: string[];
  automations?: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
}

interface EarnedRevenueMilestone {
  milestoneId: string;
  milestoneName: string;
  targetDate: string;
  targetAmount: number;
  actualAmount: number;
  achievedDate?: string;
  status: 'on_track' | 'at_risk' | 'achieved' | 'missed';
}

type AuditLogAction = 'create' | 'update' | 'delete' | 'read' | 'export';
