import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import {
  GamificationService,
} from 'src/modules/gamification/services/gamification.service';
import {
  LeadScoringService,
  type LeadScoreInput,
} from 'src/modules/lead-scoring/services/lead-scoring.service';
import { type CrmFeatureId } from 'src/modules/crm-acceleration/types/crm-acceleration.types';

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
  calculateLeadScore(@AuthWorkspace() workspace: FlatWorkspace, @Body() body: LeadScoreInput) {
    return this.executeAndPersist({
      workspaceId: workspace.id,
      featureId: 1,
      route: 'lead-scoring/score',
      payload: body,
      execute: () => this.leadScoringService.calculateScore(body),
    });
  }

  @Post('lead-scoring/batch')
  calculateLeadScores(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      leads: Array<{
        leadId: string;
        data: LeadScoreInput;
      }>;
    },
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
  buildGamificationLeaderboard(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      users: Array<{
        id: string;
        name: string;
        dealsWon: number;
        revenue: number;
        badgeCount: number;
      }>;
    },
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
  evaluateGamificationAchievements(
    @AuthWorkspace() workspace: FlatWorkspace,
    @Body()
    body: {
      userStats: {
        dealsWon: number;
        revenue: number;
        dealsCreated: number;
        ticketsResolved: number;
      };
      badges: Array<{ type: string; criteria: string }>;
    },
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
}
