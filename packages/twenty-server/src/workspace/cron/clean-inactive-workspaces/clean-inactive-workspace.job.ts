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
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import DeleteInactiveWorkspaceEmail from 'src/workspace/cron/clean-inactive-workspaces/delete-inactive-workspaces.email';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';

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
    private readonly environmentService: EnvironmentService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    this.inactiveDaysBeforeDelete =
      this.environmentService.getInactiveDaysBeforeDelete();
    this.inactiveDaysBeforeEmail =
      this.environmentService.getInactiveDaysBeforeEmail();
  }

  async getmostRecentUpdatedAt(
    dataSource: DataSourceEntity,
    objectsMetadata: ObjectMetadataEntity[],
  ): Promise<Date> {
    const tableNames = objectsMetadata
      .filter(
        (objectMetadata) =>
          objectMetadata.workspaceId === dataSource.workspaceId,
      )
      .map((objectMetadata) => computeObjectTargetTable(objectMetadata));

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSource);

    let mostRecentUpdatedAtDate = new Date(0);

    for (const tableName of tableNames) {
      const mostRecentTableUpdatedAt = (
        await workspaceDataSource?.query(
          `SELECT MAX("updatedAt") FROM ${dataSource.schema}."${tableName}"`,
        )
      )[0].max;

      if (mostRecentTableUpdatedAt) {
        const mostRecentTableUpdatedAtDate = new Date(mostRecentTableUpdatedAt);

        if (
          !mostRecentUpdatedAtDate ||
          mostRecentTableUpdatedAtDate > mostRecentUpdatedAtDate
        ) {
          mostRecentUpdatedAtDate = mostRecentTableUpdatedAtDate;
        }
      }
    }

    return mostRecentUpdatedAtDate;
  }

  async warnWorkspaceUsers(
    dataSource: DataSourceEntity,
    daysSinceInactive: number,
  ) {
    const workspaceMembers =
      await this.userService.loadWorkspaceMembers(dataSource);

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
      } inactive since ${daysSinceInactive} days emails to users ['${workspaceMembers
        .map((workspaceUser) => workspaceUser.email)
        .join(', ')}']`,
    );

    workspaceMembers.forEach((workspaceMember) => {
      const emailData = {
        daysLeft: this.inactiveDaysBeforeDelete - daysSinceInactive,
        userName: `${workspaceMember.nameFirstName} ${workspaceMember.nameLastName}`,
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
        to: workspaceMember.email,
        from: `${this.environmentService.getEmailFromName()} <${this.environmentService.getEmailFromAddress()}>`,
        subject: 'Action Needed to Prevent Workspace Deletion',
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
      `Sending email to delete workspace ${dataSource.workspaceId} inactive since ${daysSinceInactive} days`,
    );

    const emailData = {
      daysSinceDead: daysSinceInactive - this.inactiveDaysBeforeDelete,
      workspaceId: `${dataSource.workspaceId}`,
    };
    const emailTemplate = DeleteInactiveWorkspaceEmail(emailData);
    const html = render(emailTemplate, {
      pretty: true,
    });

    const text = `Workspace '${dataSource.workspaceId}' should be deleted as inactive since ${daysSinceInactive} days`;

    await this.emailService.send({
      to: this.environmentService.getEmailSystemAddress(),
      from: `${this.environmentService.getEmailFromName()} <${this.environmentService.getEmailFromAddress()}>`,
      subject: 'Action Needed to Delete Workspace',
      html,
      text,
    });
  }

  async processWorkspace(
    dataSource: DataSourceEntity,
    objectsMetadata: ObjectMetadataEntity[],
  ): Promise<void> {
    const mostRecentUpdatedAt = await this.getmostRecentUpdatedAt(
      dataSource,
      objectsMetadata,
    );
    const daysSinceInactive = Math.floor(
      (new Date().getTime() - mostRecentUpdatedAt.getTime()) /
        MILLISECONDS_IN_ONE_DAY,
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
        `'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION' and 'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION' environment variables not set, please check this doc for more info: https://docs.twenty.com/start/self-hosting/environment-variables`,
      );

      return;
    }
    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();

    const objectsMetadata = await this.objectMetadataService.findMany();

    for (const dataSource of dataSources) {
      if (!(await this.isWorkspaceCleanable(dataSource))) {
        continue;
      }

      this.logger.log(`Cleaning Workspace ${dataSource.workspaceId}`);
      await this.processWorkspace(dataSource, objectsMetadata);
    }

    this.logger.log('job done!');
  }
}
