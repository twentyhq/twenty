import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';

import { FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CrmAccelerationPersistenceService } from 'src/modules/crm-acceleration/services/crm-acceleration-persistence.service';
import { CustomerSuccessService } from 'src/modules/crm-acceleration/services/customer-success.service';
import { DataQualityCommandCenterService } from 'src/modules/crm-acceleration/services/data-quality-command-center.service';
import { EngagementAutomationService } from 'src/modules/crm-acceleration/services/engagement-automation.service';
import { ExecutiveScorecardService } from 'src/modules/crm-acceleration/services/executive-scorecard.service';
import { FeatureRegistryService } from 'src/modules/crm-acceleration/services/feature-registry.service';
import { FieldRbacService } from 'src/modules/crm-acceleration/services/field-rbac.service';
import { McpExtensionPointsService } from 'src/modules/crm-acceleration/services/mcp-extension-points.service';
import { PipelineExecutionService } from 'src/modules/crm-acceleration/services/pipeline-execution.service';
import { SalesExecutionService } from 'src/modules/crm-acceleration/services/sales-execution.service';
import { CrmExecutionDataAccessService } from 'src/modules/crm-acceleration/services/crm-execution-data-access.service';
import {
  GamificationService,
} from 'src/modules/gamification/services/gamification.service';
import {
  LeadScoringService,
} from 'src/modules/lead-scoring/services/lead-scoring.service';
import {
  GamificationAchievementsRequestDto,
  GamificationLeaderboardRequestDto,
} from 'src/modules/gamification/dtos/gamification-request.dto';
import {
  LeadBatchScoreRequestDto,
  LeadScoreInputDto,
} from 'src/modules/lead-scoring/dtos/lead-scoring-request.dto';
import { type CrmFeatureId } from 'src/modules/crm-acceleration/types/crm-acceleration.types';

const REQUEST_VALIDATION_PIPE = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});

@Controller('rest/crm-acceleration')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class CrmAccelerationController {
  constructor(
    private readonly featureRegistryService: FeatureRegistryService,
    private readonly crmAccelerationPersistenceService: CrmAccelerationPersistenceService,
    private readonly pipelineExecutionService: PipelineExecutionService,
    private readonly executiveScorecardService: ExecutiveScorecardService,
    private readonly customerSuccessService: CustomerSuccessService,
    private readonly engagementAutomationService: EngagementAutomationService,
    private readonly dataQualityCommandCenterService: DataQualityCommandCenterService,
    private readonly fieldRbacService: FieldRbacService,
    private readonly mcpExtensionPointsService: McpExtensionPointsService,
    private readonly leadScoringService: LeadScoringService,
    private readonly gamificationService: GamificationService,
    private readonly salesExecutionService: SalesExecutionService,
    private readonly dataAccessService: CrmExecutionDataAccessService,
  ) {}

  private parseFeatureId(featureId: string): CrmFeatureId {
    if (/^B[1-9]\d*$/.test(featureId)) {
      return featureId as CrmFeatureId;
    }

    const numericId = Number(featureId);

    if (!Number.isNaN(numericId) && Number.isInteger(numericId)) {
      return numericId;
    }

    throw new BadRequestException(`Invalid feature id: ${featureId}`);
  }

  private async executeAndPersist<TResult>({
    workspaceId,
    featureId,
    route,
    payload,
    execute,
  }: {
    workspaceId: string;
    featureId: CrmFeatureId;
    route: string;
    payload: unknown;
    execute: () => TResult | Promise<TResult>;
  }) {
    const result = await execute();

    const state = await this.crmAccelerationPersistenceService.saveFeatureExecution({
      workspaceId,
      featureId,
      route,
      payload,
      result,
    });

    return {
      featureId,
      result,
      persisted: true,
      persistedAt: state.latest?.executedAt ?? new Date().toISOString(),
      historyCount: state.history.length,
    };
  }

  @Get('features')
  getAllFeatures() {
    return this.featureRegistryService.getAllFeatures();
  }

  @Get('features/implemented')
  getImplementedFeatures() {
    return this.featureRegistryService.getImplementedFeatures();
  }

  @Get('features/pending-structure')
  getPendingStructure() {
    return this.featureRegistryService.getPendingStructure();
  }

  @Get('features/states')
  async getFeatureStates(@AuthWorkspace() workspace: FlatWorkspace) {
    const implementedFeatureIds = this.featureRegistryService
      .getImplementedFeatures()
      .map((feature) => feature.id);

    return this.crmAccelerationPersistenceService.getFeatureStates(
      workspace.id,
      implementedFeatureIds,
    );
  }

  @Get('features/:featureId/state')
  async getFeatureState(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Param('featureId') featureId: string,
  ) {
    return this.crmAccelerationPersistenceService.getFeatureState(
      workspace.id,
      this.parseFeatureId(featureId),
    );
  }

  @Post('pipeline/multi-support')
  getMultiPipelineSupportSummary(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      deals: Array<{
        id: string;
        pipelineId: string;
        stage: string;
        amount: number;
        createdAt: string;
        stageChangedAt?: string | null;
        closedAt?: string | null;
        status?: 'OPEN' | 'WON' | 'LOST';
      }>;
      pipelines: Array<{ id: string; name: string; stages: string[] }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 49,
      route: 'pipeline/multi-support',
      payload: body,
      execute: () => this.pipelineExecutionService.getMultiPipelineSupportSummary(body),
    });
  }

  @Post('pipeline/rotting')
  getDealRotationWarnings(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      deals: Array<{
        id: string;
        pipelineId: string;
        stage: string;
        amount: number;
        createdAt: string;
        stageChangedAt?: string | null;
        closedAt?: string | null;
        status?: 'OPEN' | 'WON' | 'LOST';
      }>;
      thresholdByStage?: Record<string, number>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 50,
      route: 'pipeline/rotting',
      payload: body,
      execute: () => this.pipelineExecutionService.getDealRotationWarnings(body),
    });
  }

  @Post('pipeline/velocity')
  getPipelineVelocityMetrics(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      deals: Array<{
        id: string;
        pipelineId: string;
        stage: string;
        amount: number;
        createdAt: string;
        stageChangedAt?: string | null;
        closedAt?: string | null;
        status?: 'OPEN' | 'WON' | 'LOST';
      }>;
      stageOrder: string[];
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 33,
      route: 'pipeline/velocity',
      payload: body,
      execute: () => this.pipelineExecutionService.getVelocityMetrics(body),
    });
  }

  @Post('executive/scorecard')
  buildExecutiveScorecard(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      metrics: Array<{
        key: string;
        label: string;
        value: number;
        target?: number;
        warningThreshold?: number;
      }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 40,
      route: 'executive/scorecard',
      payload: body,
      execute: () => this.executiveScorecardService.buildScorecard(body),
    });
  }

  @Post('customer-health/score')
  calculateCustomerHealth(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      accounts: Array<{
        accountId: string;
        accountName: string;
        productUsageScore: number;
        supportLoadScore: number;
        paymentBehaviorScore: number;
        relationshipScore: number;
      }>;
      weights?: {
        productUsageScore: number;
        supportLoadScore: number;
        paymentBehaviorScore: number;
        relationshipScore: number;
      };
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 59,
      route: 'customer-health/score',
      payload: body,
      execute: () => this.customerSuccessService.calculateCustomerHealth(body),
    });
  }

  @Post('surveys/plan')
  buildSurveyAutomationPlan(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      triggers: Array<{
        accountId: string;
        eventType:
          | 'onboarding_completed'
          | 'ticket_closed'
          | 'qbr_completed'
          | 'renewal_completed';
        eventDate: string;
        preferredChannel: 'email' | 'whatsapp' | 'sms';
      }>;
      cooldownDays?: number;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 61,
      route: 'surveys/plan',
      payload: body,
      execute: () => this.customerSuccessService.buildNpsCsatAutomationPlan(body),
    });
  }

  @Post('renewals/plan')
  buildRenewalPlan(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      contracts: Array<{
        accountId: string;
        contractId: string;
        renewalDate: string;
        ownerId: string;
        mrr: number;
      }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 62,
      route: 'renewals/plan',
      payload: body,
      execute: () => this.customerSuccessService.buildRenewalPlan(body),
    });
  }

  @Post('email-sequences/simulate')
  simulateEmailSequence(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      sequenceId: string;
      startDate: string;
      steps: Array<{
        id: string;
        delayDays: number;
        subject: string;
        body: string;
      }>;
      contacts: Array<{
        contactId: string;
        email: string;
        timezone?: string;
        replied: boolean;
        unsubscribed: boolean;
      }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 23,
      route: 'email-sequences/simulate',
      payload: body,
      execute: () => this.engagementAutomationService.simulateEmailSequence(body),
    });
  }

  @Post('meeting-scheduler/slots')
  buildMeetingSlots(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      durationMinutes: number;
      teamMembers: Array<{
        memberId: string;
        memberName: string;
        load: number;
        slots: Array<{ startAt: string; endAt: string }>;
      }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 25,
      route: 'meeting-scheduler/slots',
      payload: body,
      execute: () => this.engagementAutomationService.buildMeetingSlots(body),
    });
  }

  @Post('data-quality/analyze')
  analyzeDataQuality(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      records: Array<{
        id: string;
        name?: string | null;
        email?: string | null;
        company?: string | null;
        updatedAt?: string | null;
        [key: string]: unknown;
      }>;
      requiredFields?: string[];
      staleAfterDays?: number;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 11,
      route: 'data-quality/analyze',
      payload: body,
      execute: () => this.dataQualityCommandCenterService.analyze(body),
    });
  }

  @Post('lead-scoring/score')
  @UsePipes(REQUEST_VALIDATION_PIPE)
  calculateLeadScore(@AuthWorkspace() workspace: FlatWorkspace, @Body() body: LeadScoreInputDto) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 1,
      route: 'lead-scoring/score',
      payload: body,
      execute: () => this.leadScoringService.calculateScore(body),
    });
  }

  @Post('lead-scoring/batch')
  @UsePipes(REQUEST_VALIDATION_PIPE)
  calculateLeadScores(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body() body: LeadBatchScoreRequestDto,
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 1,
      route: 'lead-scoring/batch',
      payload: body,
      execute: () => this.leadScoringService.batchScore(body.leads),
    });
  }

  @Post('gamification/leaderboard')
  @UsePipes(REQUEST_VALIDATION_PIPE)
  buildGamificationLeaderboard(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body() body: GamificationLeaderboardRequestDto,
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 56,
      route: 'gamification/leaderboard',
      payload: body,
      execute: () => this.gamificationService.calculateLeaderboard(body.users),
    });
  }

  @Post('gamification/achievements')
  @UsePipes(REQUEST_VALIDATION_PIPE)
  evaluateGamificationAchievements(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body() body: GamificationAchievementsRequestDto,
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 56,
      route: 'gamification/achievements',
      payload: body,
      execute: () => this.gamificationService.checkAchievements(body.userStats, body.badges),
    });
  }

  @Post('rbac/field-evaluate')
  evaluateFieldRbac(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      roleIds: string[];
      objectName: string;
      fieldName: string;
      action: 'read' | 'update';
      permissions: Array<{
        roleId: string;
        objectName: string;
        fieldName: string;
        canRead: boolean | null;
        canUpdate: boolean | null;
      }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 94,
      route: 'rbac/field-evaluate',
      payload: body,
      execute: () => this.fieldRbacService.evaluateFieldAccess(body),
    });
  }

  @Get('mcp/readiness')
  getMcpReadiness(@AuthWorkspace() workspace: FlatWorkspace) {
    void workspace;
    return this.mcpExtensionPointsService.getReadiness();
  }

  @Post('mcp/extension-points')
  buildMcpExtensionPoints(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      objectNames: string[];
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 85,
      route: 'mcp/extension-points',
      payload: body,
      execute: () => this.mcpExtensionPointsService.buildObjectExtensionPoints(body),
    });
  }

  @Post('deal/clone')
  async cloneDeal(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      sourceDealId: string;
      newDealName: string;
      options?: {
        cloneCompany: boolean;
        cloneContacts: boolean;
        cloneActivities: boolean;
        cloneNotes: boolean;
        cloneTasks: boolean;
        resetStage: boolean;
        resetCloseDate: boolean;
      };
    },
  ) {
    const opts = body.options || {
      cloneCompany: true,
      cloneContacts: true,
      cloneActivities: false,
      cloneNotes: false,
      cloneTasks: false,
      resetStage: true,
      resetCloseDate: true,
    };

    const cloned = await this.dataAccessService.cloneDeal(
      workspace.id,
      body.sourceDealId,
      body.newDealName,
      opts,
    );

    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 57,
      route: 'deal/clone',
      payload: body,
      execute: () => Promise.resolve(cloned),
    });
  }

  @Post('account/hierarchy')
  async buildAccountHierarchy(@AuthWorkspace() workspace: FlatWorkspace) {
    const result = await this.dataAccessService.buildAccountHierarchy(workspace.id);

    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 53,
      route: 'account/hierarchy',
      payload: {},
      execute: () => Promise.resolve(result),
    });
  }

  @Post('competitor/track')
  async trackCompetitors(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      dealId: string;
      competitors: Array<{
        competitorId: string;
        competitorName: string;
        strength: 'strong' | 'moderate' | 'weak';
        notes?: string;
      }>;
    },
  ) {
    const result = await this.dataAccessService.trackCompetitors(
      workspace.id,
      body.dealId,
      body.competitors,
    );

    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 54,
      route: 'competitor/track',
      payload: body,
      execute: () => Promise.resolve(result),
    });
  }

  @Post('revenue/earned')
  async trackEarnedRevenue(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      dealId: string;
      startDate: string;
      milestones: Array<{
        milestoneId: string;
        milestoneName: string;
        targetDate: string;
        targetAmount: number;
        achievedDate?: string;
        actualAmount?: number;
      }>;
    },
  ) {
    const calculated = this.salesExecutionService.trackEarnedRevenue(body);
    
    const saved = await this.dataAccessService.saveEarnedRevenue(workspace.id, {
      dealId: body.dealId,
      startDate: new Date(body.startDate),
      milestones: body.milestones.map(m => ({
        ...m,
        actualAmount: m.actualAmount ?? 0,
        status: calculated.milestones.find(cm => cm.milestoneId === m.milestoneId)?.status || 'on_track',
      })),
      totalTargetAmount: calculated.totalTargetAmount,
      totalEarnedAmount: calculated.totalEarnedAmount,
      progress: calculated.progress,
      projectedCompletionDate: new Date(calculated.projectedCompletionDate),
      riskFlags: calculated.riskFlags,
    });
    
    return {
      featureId: 58,
      result: { ...calculated, id: saved.id },
      persisted: true,
      persistedAt: saved.createdAt?.toISOString(),
    };
  }

  @Get('revenue/earned')
  getEarnedRevenueList(@AuthWorkspace() workspace: FlatWorkspace) {
    return this.dataAccessService.getEarnedRevenueList(workspace.id);
  }

  @Get('revenue/earned/deal/:dealId')
  getEarnedRevenueByDeal(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Param('dealId') dealId: string,
  ) {
    return this.dataAccessService.getEarnedRevenueByDeal(workspace.id, dealId);
  }

  @Post('blueprint/create')
  async createBlueprint(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      blueprintId: string;
      name: string;
      stages: Array<{
        stageId: string;
        name: string;
        order: number;
        description?: string;
        requiredFields: string[];
        automations?: Array<{
          type: string;
          config: Record<string, unknown>;
        }>;
      }>;
      isActive: boolean;
    },
  ) {
    const validated = this.salesExecutionService.createBlueprint(body);
    
    if (validated.isValid) {
      const saved = await this.dataAccessService.createBlueprint(workspace.id, {
        name: body.name,
        stages: body.stages,
        isActive: body.isActive,
      });
      
      return {
        featureId: 52,
        result: { ...validated, id: saved.id },
        persisted: true,
        persistedAt: saved.createdAt.toISOString(),
      };
    }
    
    return {
      featureId: 52,
      result: validated,
      persisted: false,
    };
  }

  @Get('blueprint')
  getBlueprints(@AuthWorkspace() workspace: FlatWorkspace) {
    return this.dataAccessService.getBlueprints(workspace.id);
  }

  @Get('blueprint/:id')
  getBlueprintById(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataAccessService.getBlueprintById(workspace.id, id);
  }

  @Post('blueprint/:id/delete')
  deleteBlueprint(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataAccessService.deleteBlueprint(workspace.id, id);
  }

  @Post('playbook/cs/create')
  async createCsPlaybook(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      playbookId: string;
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
    },
  ) {
    const validated = this.salesExecutionService.createPlaybook(body);
    
    if (validated.isValid) {
      const saved = await this.dataAccessService.createPlaybook(workspace.id, {
        name: body.name,
        triggerType: body.triggerType as any,
        steps: body.steps,
        isActive: body.isActive,
        estimatedDurationDays: validated.estimatedDurationDays,
      });
      
      return {
        featureId: 60,
        result: { ...validated, id: saved.id },
        persisted: true,
        persistedAt: saved.createdAt.toISOString(),
      };
    }
    
    return {
      featureId: 60,
      result: validated,
      persisted: false,
    };
  }

  @Get('playbook/cs')
  getCsPlaybooks(@AuthWorkspace() workspace: FlatWorkspace) {
    return this.dataAccessService.getPlaybooks(workspace.id);
  }

  @Get('playbook/cs/:id')
  getCsPlaybookById(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataAccessService.getPlaybookById(workspace.id, id);
  }

  @Post('qbr/schedule')
  scheduleQbr(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      qbrId: string;
      accountId: string;
      accountName: string;
      scheduledDate: string;
      attendees: Array<{
        attendeeId: string;
        attendeeName: string;
        email: string;
        role: 'internal' | 'client';
      }>;
      documents?: Array<{
        documentId: string;
        documentType: 'agenda' | 'presentation' | 'report' | 'action_items' | 'meeting_notes';
        title: string;
        url?: string;
        content?: string;
      }>;
    },
  ) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 64,
      route: 'qbr/schedule',
      payload: body,
      execute: () => this.salesExecutionService.scheduleQbr(body),
    });
  }

  @Post('audit/immutable')
  async createImmutableAuditLog(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      entityType: string;
      entityId: string;
      action: 'create' | 'update' | 'delete' | 'read' | 'export';
      changes: Array<{
        field: string;
        oldValue: unknown;
        newValue: unknown;
      }>;
      userId: string;
      userName: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    const calculated = this.salesExecutionService.createImmutableAuditLog(body);
    
    const saved = await this.dataAccessService.createAuditLog(workspace.id, {
      entityType: body.entityType,
      entityId: body.entityId,
      action: calculated.action as any,
      changes: body.changes,
      userId: body.userId,
      userName: body.userName,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
    });

    return {
      featureId: 91,
      result: {
        dbId: saved.id,
        ...calculated,
      },
      persisted: true,
      persistedAt: saved.createdAt.toISOString(),
    };
  }

  @Get('audit/immutable')
  async getAuditLogs(
    @AuthWorkspace() workspace: FlatWorkspace,
  ) {
    return this.dataAccessService.getAuditLogs(workspace.id, { limit: 100 });
  }

  @Get('audit/immutable/verify/:logId')
  async verifyAuditLog(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Param('logId') logId: string,
  ) {
    return this.dataAccessService.verifyAuditLog(workspace.id, logId);
  }

  @Post('revenue/expansion')
  async calculateExpansionRevenue(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      accountId: string;
      currentMrr?: number;
      expansionOpportunities?: Array<{
        opportunityId: string;
        type: 'upsell' | 'cross_sell' | 'add_on' | 'seat_expansion';
        description: string;
        probability: number;
        amount: number;
        targetDate: string;
      }>;
    },
  ) {
    const result = await this.dataAccessService.calculateExpansionRevenue(
      workspace.id,
      body.accountId,
    );

    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 63,
      route: 'revenue/expansion',
      payload: body,
      execute: () => Promise.resolve(result),
    });
  }

  @Post('playbook/sales/create')
  async createSalesPlaybook(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      name: string;
      description: string;
      stages: Array<{
        name: string;
        tasks: Array<{
          task: string;
          description?: string;
          order: number;
        }>;
      }>;
    },
  ) {
    const result = await this.salesExecutionService.createSalesPlaybook(body);

    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 51,
      route: 'playbook/sales/create',
      payload: body,
      execute: () => Promise.resolve(result),
    });
  }

  @Post('playbook/sales/apply')
  async applyPlaybookToDeal(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      dealId: string;
      playbookId: string;
    },
  ) {
    const result = await this.salesExecutionService.applyPlaybookToDeal(
      body.dealId,
      body.playbookId,
    );

    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 51,
      route: 'playbook/sales/apply',
      payload: body,
      execute: () => Promise.resolve(result),
    });
  }

  @Get('playbook/sales/templates')
  getPlaybookTemplates(@AuthWorkspace() workspace: FlatWorkspace) {
    return this.salesExecutionService.getPlaybookTemplates();
  }
}
