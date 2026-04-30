import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity, ProjectTaskEntity, TimeEntryEntity, ProjectRiskEntity, ProjectTemplateEntity, ProjectStatus } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity) private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(ProjectTaskEntity) private readonly taskRepo: Repository<ProjectTaskEntity>,
    @InjectRepository(TimeEntryEntity) private readonly timeRepo: Repository<TimeEntryEntity>,
    @InjectRepository(ProjectRiskEntity) private readonly riskRepo: Repository<ProjectRiskEntity>,
    @InjectRepository(ProjectTemplateEntity) private readonly templateRepo: Repository<ProjectTemplateEntity>,
  ) {}

  async createFromDeal(workspaceId: string, dealId: string, name: string, templateId?: string): Promise<ProjectEntity> {
    const project = await this.projectRepo.save(this.projectRepo.create({
      workspaceId, dealId, name, status: ProjectStatus.PLANNING, templateId,
    }));

    if (templateId) {
      const template = await this.templateRepo.findOne({ where: { id: templateId } });
      if (template?.phases) {
        let order = 0;
        for (const phase of template.phases) {
          for (const t of phase.tasks) {
            await this.taskRepo.save(this.taskRepo.create({
              projectId: project.id, name: t.name, phase: phase.name,
              estimatedHours: t.estimatedHours, isMilestone: t.isMilestone, sortOrder: order++,
            }));
          }
        }
      }
    }
    return project;
  }

  async createTask(projectId: string, data: Partial<ProjectTaskEntity>): Promise<ProjectTaskEntity> {
    if (data.dependencies?.length) {
      for (const dep of data.dependencies) {
        const blocking = await this.taskRepo.findOne({ where: { id: dep.taskId } });
        if (blocking && blocking.status !== 'done') {
          throw new BadRequestException(`Dependency task ${dep.taskId} not completed`);
        }
      }
    }
    return this.taskRepo.save(this.taskRepo.create({ projectId, ...data }));
  }

  async completeTask(taskId: string): Promise<ProjectTaskEntity> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    task.status = 'done';
    const saved = await this.taskRepo.save(task);
    await this.recalculateProgress(task.projectId);
    return saved;
  }

  async logTime(projectId: string, data: { taskId?: string; userId: string; hours: number; date: Date; description?: string; isBillable?: boolean; hourlyRate?: number }): Promise<TimeEntryEntity> {
    const entry = await this.timeRepo.save(this.timeRepo.create({ projectId, ...data, date: data.date }));
    const project = await this.findProjectOrFail(projectId);
    const cost = data.hours * (data.hourlyRate ?? 0);
    project.actualCost = Number(project.actualCost) + cost;
    if (project.isRetainer) project.retainerHoursUsed = Number(project.retainerHoursUsed) + data.hours;
    await this.projectRepo.save(project);
    return entry;
  }

  async addRisk(projectId: string, data: Partial<ProjectRiskEntity>): Promise<ProjectRiskEntity> {
    return this.riskRepo.save(this.riskRepo.create({ projectId, ...data }));
  }

  async getResourceAllocation(workspaceId: string): Promise<Array<{ userId: string; totalHours: number; projects: number }>> {
    const entries = await this.timeRepo
      .createQueryBuilder('t')
      .innerJoin(ProjectEntity, 'p', 'p.id = t.projectId')
      .where('p.workspaceId = :workspaceId', { workspaceId })
      .andWhere('p.status = :status', { status: ProjectStatus.ACTIVE })
      .select('t.userId', 'userId')
      .addSelect('SUM(t.hours)', 'totalHours')
      .addSelect('COUNT(DISTINCT t.projectId)', 'projects')
      .groupBy('t.userId')
      .getRawMany();
    return entries;
  }

  async getPLByProject(projectId: string): Promise<{ revenue: number; cost: number; margin: number; marginPercent: number }> {
    const project = await this.findProjectOrFail(projectId);
    const revenue = Number(project.revenue);
    const cost = Number(project.actualCost);
    const margin = revenue - cost;
    return { revenue, cost, margin, marginPercent: revenue ? (margin / revenue) * 100 : 0 };
  }

  async calculateHealthScore(projectId: string): Promise<{ score: number; color: string }> {
    const project = await this.findProjectOrFail(projectId);
    const tasks = await this.taskRepo.find({ where: { projectId } });
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
    const budgetRatio = Number(project.budget) ? Number(project.actualCost) / Number(project.budget) : 0;
    const overdueRatio = tasks.length ? overdue.length / tasks.length : 0;

    let score = 100;
    score -= overdueRatio * 40;
    score -= Math.max(0, budgetRatio - 0.8) * 100;
    score = Math.max(0, Math.min(100, score));

    const color = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
    project.healthScore = score;
    project.healthColor = color;
    await this.projectRepo.save(project);
    return { score, color };
  }

  async createTemplate(workspaceId: string, data: Partial<ProjectTemplateEntity>): Promise<ProjectTemplateEntity> {
    return this.templateRepo.save(this.templateRepo.create({ workspaceId, ...data }));
  }

  // Create a template from an existing project, capturing its task structure
  async createTemplateFromProject(
    workspaceId: string,
    projectId: string,
    templateName: string,
  ): Promise<ProjectTemplateEntity> {
    const project = await this.findProjectOrFail(projectId);
    const tasks = await this.taskRepo.find({
      where: { projectId },
      order: { sortOrder: 'ASC' },
    });

    // Group tasks by phase to build the template structure
    const phaseMap = new Map<string, Array<{ name: string; estimatedHours: number; isMilestone: boolean }>>();

    for (const task of tasks) {
      const phaseName = task.phase || 'Default';
      const existing = phaseMap.get(phaseName) || [];
      existing.push({
        name: task.name,
        estimatedHours: task.estimatedHours,
        isMilestone: task.isMilestone,
      });
      phaseMap.set(phaseName, existing);
    }

    const phases = Array.from(phaseMap.entries()).map(([name, phaseTasks]) => ({
      name,
      tasks: phaseTasks,
    }));

    return this.templateRepo.save(
      this.templateRepo.create({
        workspaceId,
        name: templateName,
        methodology: project.methodology ?? undefined,
        phases,
      }),
    );
  }

  // Check all active projects for budget deviation and return alerts
  async getBudgetDeviationAlerts(
    workspaceId: string,
    thresholdPercent = 80,
  ): Promise<Array<{
    projectId: string;
    projectName: string;
    budget: number;
    actualCost: number;
    usedPercent: number;
    progressPercent: number;
    severity: 'warning' | 'critical' | 'over-budget';
    deviationMessage: string;
  }>> {
    const projects = await this.projectRepo.find({
      where: { workspaceId, status: ProjectStatus.ACTIVE },
    });

    const alerts: Array<{
      projectId: string;
      projectName: string;
      budget: number;
      actualCost: number;
      usedPercent: number;
      progressPercent: number;
      severity: 'warning' | 'critical' | 'over-budget';
      deviationMessage: string;
    }> = [];

    for (const project of projects) {
      const budget = Number(project.budget);
      if (budget <= 0) continue;

      const actualCost = Number(project.actualCost);
      const usedPercent = (actualCost / budget) * 100;
      const progressPercent = project.progressPercent ?? 0;

      if (usedPercent < thresholdPercent) continue;

      let severity: 'warning' | 'critical' | 'over-budget';
      let deviationMessage: string;

      if (usedPercent > 100) {
        severity = 'over-budget';
        deviationMessage = `Over budget by ${Math.round(usedPercent - 100)}%. Cost: $${actualCost.toFixed(2)} vs Budget: $${budget.toFixed(2)}`;
      } else if (usedPercent > progressPercent + 20) {
        // Spending ahead of progress -- cost is outpacing delivery
        severity = 'critical';
        deviationMessage = `Budget burn rate exceeds progress. ${Math.round(usedPercent)}% spent but only ${Math.round(progressPercent)}% complete`;
      } else {
        severity = 'warning';
        deviationMessage = `Approaching budget threshold: ${Math.round(usedPercent)}% of budget consumed`;
      }

      alerts.push({
        projectId: project.id,
        projectName: project.name,
        budget,
        actualCost,
        usedPercent: Math.round(usedPercent * 100) / 100,
        progressPercent,
        severity,
        deviationMessage,
      });
    }

    // Sort by severity (over-budget first, then critical, then warning)
    const severityOrder = { 'over-budget': 0, critical: 1, warning: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts;
  }

  // Forecast resource demand across all active projects for upcoming weeks
  async getResourceForecast(
    workspaceId: string,
    weeksAhead = 4,
  ): Promise<Array<{
    userId: string;
    currentHoursPerWeek: number;
    forecastedHoursPerWeek: number;
    projectCount: number;
    utilizationPercent: number;
    isOverallocated: boolean;
    projects: Array<{ projectId: string; projectName: string; estimatedHoursRemaining: number }>;
  }>> {
    const activeProjects = await this.projectRepo.find({
      where: { workspaceId, status: ProjectStatus.ACTIVE },
    });

    // Gather time entries from the last 4 weeks for baseline
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentEntries = await this.timeRepo
      .createQueryBuilder('t')
      .innerJoin(ProjectEntity, 'p', 'p.id = t.projectId')
      .where('p.workspaceId = :workspaceId', { workspaceId })
      .andWhere('t.date >= :fourWeeksAgo', { fourWeeksAgo })
      .getMany();

    // Calculate current weekly rate per user
    const userWeeklyHours = new Map<string, number>();
    for (const entry of recentEntries) {
      const current = userWeeklyHours.get(entry.userId) || 0;
      userWeeklyHours.set(entry.userId, current + Number(entry.hours));
    }

    // Get remaining work per user from open tasks
    const userProjectMap = new Map<
      string,
      Array<{ projectId: string; projectName: string; estimatedHoursRemaining: number }>
    >();

    for (const project of activeProjects) {
      const openTasks = await this.taskRepo.find({
        where: { projectId: project.id },
      });

      for (const task of openTasks) {
        if (task.status === 'done' || !task.assigneeId) continue;

        const remaining = Math.max(
          task.estimatedHours - Number(task.loggedHours),
          0,
        );

        if (remaining <= 0) continue;

        const existing = userProjectMap.get(task.assigneeId) || [];
        const projectEntry = existing.find((p) => p.projectId === project.id);
        if (projectEntry) {
          projectEntry.estimatedHoursRemaining += remaining;
        } else {
          existing.push({
            projectId: project.id,
            projectName: project.name,
            estimatedHoursRemaining: remaining,
          });
        }
        userProjectMap.set(task.assigneeId, existing);
      }
    }

    const standardHoursPerWeek = 40;

    const forecast = Array.from(userProjectMap.entries()).map(([userId, projects]) => {
      const totalWeeklyHoursLogged = userWeeklyHours.get(userId) || 0;
      const currentHoursPerWeek = totalWeeklyHoursLogged / 4; // Average over 4 weeks

      const totalRemainingHours = projects.reduce(
        (sum, p) => sum + p.estimatedHoursRemaining,
        0,
      );
      const forecastedHoursPerWeek = weeksAhead > 0
        ? totalRemainingHours / weeksAhead
        : totalRemainingHours;

      const utilizationPercent =
        Math.round((forecastedHoursPerWeek / standardHoursPerWeek) * 100);

      return {
        userId,
        currentHoursPerWeek: Math.round(currentHoursPerWeek * 100) / 100,
        forecastedHoursPerWeek: Math.round(forecastedHoursPerWeek * 100) / 100,
        projectCount: projects.length,
        utilizationPercent,
        isOverallocated: utilizationPercent > 100,
        projects,
      };
    });

    // Sort by utilization descending so overallocated resources appear first
    forecast.sort((a, b) => b.utilizationPercent - a.utilizationPercent);

    return forecast;
  }

  async getGanttData(projectId: string): Promise<Array<{ id: string; name: string; start: string; end: string; progress: number; dependencies: string[] }>> {
    const tasks = await this.taskRepo.find({ where: { projectId }, order: { sortOrder: 'ASC' } });
    return tasks.map((t) => ({
      id: t.id,
      name: t.name,
      start: t.startDate?.toISOString?.() ?? '',
      end: t.dueDate?.toISOString?.() ?? '',
      progress: t.status === 'done' ? 100 : t.status === 'in_progress' ? 50 : 0,
      dependencies: t.dependencies?.map((d) => d.taskId) ?? [],
    }));
  }

  private async recalculateProgress(projectId: string): Promise<void> {
    const tasks = await this.taskRepo.find({ where: { projectId } });
    if (!tasks.length) return;
    const done = tasks.filter((t) => t.status === 'done').length;
    await this.projectRepo.update(projectId, { progressPercent: (done / tasks.length) * 100 });
  }

  private async findProjectOrFail(projectId: string): Promise<ProjectEntity> {
    const p = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!p) throw new NotFoundException(`Project ${projectId} not found`);
    return p;
  }
}
