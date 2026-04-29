import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity, ProjectTaskEntity, TimeEntryEntity, ProjectRiskEntity, ProjectTemplateEntity } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, ProjectTaskEntity, TimeEntryEntity, ProjectRiskEntity, ProjectTemplateEntity])],
  providers: [ProjectService, ProjectResolver],
  exports: [ProjectService],
})
export class ProjectModule {}
