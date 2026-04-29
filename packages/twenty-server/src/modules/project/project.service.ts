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
