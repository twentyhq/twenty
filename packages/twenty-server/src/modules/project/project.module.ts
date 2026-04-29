import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity, ProjectTaskEntity, TimeEntryEntity, ProjectRiskEntity, ProjectTemplateEntity } from './project.entity';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, ProjectTaskEntity, TimeEntryEntity, ProjectRiskEntity, ProjectTemplateEntity])],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
