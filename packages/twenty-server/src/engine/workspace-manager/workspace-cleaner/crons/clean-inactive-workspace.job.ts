import { Injectable, Logger } from '@nestjs/common';

import { render } from '@react-email/render';
import { In } from 'typeorm';
import {
  CleanInactiveWorkspaceEmail,
  DeleteInactiveWorkspaceEmail,
} from 'twenty-emails';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { CleanInactiveWorkspacesCommandOptions } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-inactive-workspaces.command';
import { getDryRunLogHeader } from 'src/utils/get-dry-run-log-header';

const MILLISECONDS_IN_ONE_DAY = 1000 * 3600 * 24;

type WorkspaceToDeleteData = {
  workspaceId: string;
  daysSinceInactive: number;
};

@Injectable()
export class CleanInactiveWorkspaceJob
  implements MessageQueueJob<CleanInactiveWorkspacesCommandOptions>
{
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
  ) {
    this.inactiveDaysBeforeDelete = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION',
    );
    this.inactiveDaysBeforeEmail = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION',
    );
  }

  async getMostRecentUpdatedAt(
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
    isDryRun: boolean,
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
      `${getDryRunLogHeader(isDryRun)}Sending workspace ${
        dataSource.workspaceId
      } inactive since ${daysSinceInactive} days emails to users ['${workspaceMembers
        .map((workspaceUser) => workspaceUser.email)
        .join(', ')}']`,
    );

    if (isDryRun) {
      return;
    }

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
        bcc: this.environmentService.get('EMAIL_SYSTEM_ADDRESS'),
        from: `${this.environmentService.get(
          'EMAIL_FROM_NAME',
        )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
        subject: 'Action Needed to Prevent Workspace Deletion',
        html,
        text,
      });
    });
  }

  chunkArray(array: any[], chunkSize = 6): any[][] {
    const chunkedArray: any[][] = [];
    let index = 0;

    while (index < array.length) {
      chunkedArray.push(array.slice(index, index + chunkSize));
      index += chunkSize;
    }

    return chunkedArray;
  }

  async sendDeleteWorkspaceEmail(
    workspacesToDelete: WorkspaceToDeleteData[],
    isDryRun: boolean,
  ): Promise<void> {
    this.logger.log(
      `${getDryRunLogHeader(
        isDryRun,
      )}Sending email to delete workspaces "${workspacesToDelete
        .map((workspaceToDelete) => workspaceToDelete.workspaceId)
        .join('", "')}"`,
    );

    if (isDryRun || workspacesToDelete.length === 0) {
      return;
    }

    const emailTemplate = DeleteInactiveWorkspaceEmail(workspacesToDelete);
    const html = render(emailTemplate, {
      pretty: true,
    });
    const text = render(emailTemplate, {
      plainText: true,
    });

    await this.emailService.send({
      to: this.environmentService.get('EMAIL_SYSTEM_ADDRESS'),
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      subject: 'Action Needed to Delete Workspaces',
      html,
      text,
    });
  }

  async handle(data: CleanInactiveWorkspacesCommandOptions): Promise<void> {
    const isDryRun = data.dryRun || false;

    const workspacesToDelete: WorkspaceToDeleteData[] = [];

    this.logger.log(`${getDryRunLogHeader(isDryRun)}Job running...`);
    if (!this.inactiveDaysBeforeDelete && !this.inactiveDaysBeforeEmail) {
      this.logger.log(
        `'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION' and 'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION' environment variables not set, please check this doc for more info: https://docs.twenty.com/start/self-hosting/environment-variables`,
      );

      return;
    }

    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();

    const dataSourcesChunks = this.chunkArray(dataSources);

    this.logger.log(
      `${getDryRunLogHeader(isDryRun)}On ${
        dataSources.length
      } workspaces divided in ${dataSourcesChunks.length} chunks...`,
    );

    for (const dataSourcesChunk of dataSourcesChunks) {
      const objectsMetadata = await this.objectMetadataService.findMany({
        where: {
          dataSourceId: In(dataSourcesChunk.map((dataSource) => dataSource.id)),
        },
      });

      for (const dataSource of dataSourcesChunk) {
        this.logger.log(
          `${getDryRunLogHeader(isDryRun)}Cleaning Workspace ${
            dataSource.workspaceId
          }`,
        );

        const mostRecentUpdatedAt = await this.getMostRecentUpdatedAt(
          dataSource,
          objectsMetadata,
        );
        const daysSinceInactive = Math.floor(
          (new Date().getTime() - mostRecentUpdatedAt.getTime()) /
            MILLISECONDS_IN_ONE_DAY,
        );

        if (daysSinceInactive > this.inactiveDaysBeforeDelete) {
          workspacesToDelete.push({
            daysSinceInactive: daysSinceInactive,
            workspaceId: `${dataSource.workspaceId}`,
          });
        } else if (daysSinceInactive > this.inactiveDaysBeforeEmail) {
          await this.warnWorkspaceUsers(
            dataSource,
            daysSinceInactive,
            isDryRun,
          );
        }
      }
    }

    await this.sendDeleteWorkspaceEmail(workspacesToDelete, isDryRun);

    this.logger.log(`${getDryRunLogHeader(isDryRun)}job done!`);
  }
}
