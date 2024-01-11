import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { render } from '@react-email/render';
import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { UserService } from 'src/core/user/services/user.service';
import { EmailService } from 'src/integrations/email/email.service';
import CleanInactiveWorkspaceEmail from 'src/workspace/cron/clean-inactive-workspaces/clean-inactive-workspaces.email';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';

const MILLISECONDS_IN_ONE_DAY = 1000 * 3600 * 24;

@Injectable()
export class CleanInactiveWorkspaceJob implements MessageQueueJob<undefined> {
  private readonly logger = new Logger(CleanInactiveWorkspaceJob.name);
  private readonly inactiveDaysBeforeDelete;
  private readonly inactiveDaysBeforeEmail;

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly typeORMService: TypeORMService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    this.inactiveDaysBeforeDelete =
      this.environmentService.getInactiveDaysBeforeDelete();
    this.inactiveDaysBeforeEmail =
      this.environmentService.getInactiveDaysBeforeEmail();
  }

  async getMaxUpdatedAt(
    dataSource: DataSourceEntity,
    tableNames,
  ): Promise<Date> {
    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSource);

    let maxUpdatedAt = new Date(0);

    for (const tableName of tableNames) {
      const maxTableUpdatedAt = (
        await workspaceDataSource?.query(
          `SELECT MAX("updatedAt") FROM ${dataSource.schema}."${tableName}"`,
        )
      )[0].max;

      if (maxTableUpdatedAt) {
        const maxTableUpdatedAtDate = new Date(maxTableUpdatedAt);

        if (!maxUpdatedAt || maxTableUpdatedAtDate > maxUpdatedAt) {
          maxUpdatedAt = maxTableUpdatedAtDate;
        }
      }
    }

    return maxUpdatedAt;
  }

  async warnWorkspaceUsers(
    dataSource: DataSourceEntity,
    daysSinceInactive: number,
  ) {
    const workspaceUsers =
      await this.userService.loadWorkspaceUsers(dataSource);

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSource);

    const displayName = (
      await workspaceDataSource?.query(
        `SELECT "displayName" FROM core.workspace WHERE id='${dataSource.workspaceId}'`,
      )
    )?.[0].displayName;

    this.logger.log(
      `Sending workspace ${
        dataSource.workspaceId
      } inactive since ${daysSinceInactive} days emails to users ['${workspaceUsers
        .map((workspaceUser) => workspaceUser.email)
        .join(', ')}']`,
    );

    workspaceUsers.forEach((workspaceUser) => {
      const emailData = {
        title: 'Inactive Workspace 😴',
        daysLeft: this.inactiveDaysBeforeDelete - daysSinceInactive,
        userName: `${workspaceUser.nameFirstName} ${workspaceUser.nameLastName}`,
        workspaceDisplayName: `${displayName}`,
      };
      const emailTemplate = CleanInactiveWorkspaceEmail(emailData);
      const html = render(emailTemplate, {
        pretty: true,
      });
      const text = render(emailTemplate, {
        plainText: true,
      });

      this.emailService.send({
        to: workspaceUser.email,
        from: `Félix from Twenty <felix@twenty.com>`,
        subject: 'Inactive workspace',
        html,
        text,
      });
    });
  }

  async deleteWorkspace(
    dataSource: DataSourceEntity,
    daysSinceInactive: number,
  ): Promise<void> {
    this.logger.log(
      `Deleting workspace ${dataSource.workspaceId} inactive since ${daysSinceInactive}`,
    );
    await this.workspaceService.deleteWorkspace(dataSource.workspaceId);
  }

  async processWorkspace(
    dataSource: DataSourceEntity,
    maxUpdatedAt: Date,
  ): Promise<void> {
    const daysSinceInactive = Math.floor(
      (new Date().getTime() - maxUpdatedAt.getTime()) / MILLISECONDS_IN_ONE_DAY,
    );

    if (daysSinceInactive > this.inactiveDaysBeforeDelete) {
      await this.deleteWorkspace(dataSource, daysSinceInactive);
    } else if (daysSinceInactive > this.inactiveDaysBeforeEmail) {
      await this.warnWorkspaceUsers(dataSource, daysSinceInactive);
    }
  }

  async isWorkspaceCleanable(dataSource: DataSourceEntity): Promise<boolean> {
    const workspaceFeatureFlags = await this.featureFlagRepository.find({
      where: { workspaceId: dataSource.workspaceId },
    });

    return (
      workspaceFeatureFlags.filter(
        (workspaceFeatureFlag) =>
          workspaceFeatureFlag.key === FeatureFlagKeys.IsWorkspaceCleanable &&
          workspaceFeatureFlag.value,
      ).length > 0
    );
  }

  async handle(): Promise<void> {
    this.logger.log('Job running...');
    if (!this.inactiveDaysBeforeDelete && !this.inactiveDaysBeforeEmail) {
      this.logger.log(
        `'INACTIVE_DAYS_BEFORE_EMAIL' and 'INACTIVE_DAYS_BEFORE_DELETE' environment variables not set, please check this doc for more info: https://docs.twenty.com/start/self-hosting/environment-variables`,
      );

      return;
    }
    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();

    const objectsMetadata = await this.objectMetadataService.findMany();

    for (const dataSource of dataSources) {
      if (!(await this.isWorkspaceCleanable(dataSource))) {
        this.logger.log(`Workspace ${dataSource.workspaceId} not cleanable`);
        continue;
      }
      this.logger.log(`Cleaning Workspace ${dataSource.workspaceId}`);
      const dataSourceTableNames = objectsMetadata
        .filter(
          (objectMetadata) =>
            objectMetadata.workspaceId === dataSource.workspaceId,
        )
        .map((objectMetadata) => objectMetadata.targetTableName);

      const maxUpdatedAt = await this.getMaxUpdatedAt(
        dataSource,
        dataSourceTableNames,
      );

      await this.processWorkspace(dataSource, maxUpdatedAt);
    }

    this.logger.log('job done!');
  }
}
