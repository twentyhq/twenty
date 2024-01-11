import { Injectable, Logger } from '@nestjs/common';

import { render } from '@react-email/render';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { UserService } from 'src/core/user/services/user.service';
import { EmailService } from 'src/integrations/email/email.service';
import CleanInactiveWorkspaceEmail from 'src/workspace/cron/clean-inactive-workspaces/email/clean-inactive-workspaces.email';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';

const MILLISECONDS_IN_ONE_DAY = 1000 * 3600 * 24;
const INACTIVE_DAYS_BEFORE_EMAIL = 0;
const INACTIVE_DAYS_BEFORE_DELETE = 6;
const MAIL_FROM = 'felix@twenty.com';
const FEATURE_FLAGS = [
  '6abf1b14-d85d-422d-b7f3-b2187cc22806',
  '9d426e68-d604-4b4e-8bc0-a23ec02939b5',
];

@Injectable()
export class CleanInactiveWorkspaceJob implements MessageQueueJob<undefined> {
  private readonly logger = new Logger(CleanInactiveWorkspaceJob.name);

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly typeORMService: TypeORMService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly workspaceService: WorkspaceService,
  ) {}

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
        daysLeft: INACTIVE_DAYS_BEFORE_DELETE - daysSinceInactive,
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
        from: `Twenty <${MAIL_FROM}>`,
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

    if (daysSinceInactive > INACTIVE_DAYS_BEFORE_DELETE) {
      await this.deleteWorkspace(dataSource, daysSinceInactive);
    } else if (daysSinceInactive > INACTIVE_DAYS_BEFORE_EMAIL) {
      await this.warnWorkspaceUsers(dataSource, daysSinceInactive);
    }
  }

  async handle(): Promise<void> {
    this.logger.log(`${CleanInactiveWorkspaceJob.name} job running...`);
    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();

    const objectsMetadata = await this.objectMetadataService.findMany();

    for (const dataSource of dataSources) {
      if (!FEATURE_FLAGS.includes(dataSource.workspaceId)) {
        continue;
      }
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

    this.logger.log(`${CleanInactiveWorkspaceJob.name} job done!`);
  }
}
