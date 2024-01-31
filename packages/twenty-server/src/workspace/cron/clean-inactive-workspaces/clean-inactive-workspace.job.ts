import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { render } from '@react-email/render';
import { In, Repository } from 'typeorm';
import {
  CleanInactiveWorkspaceEmail,
  DeleteInactiveWorkspaceEmail,
} from 'twenty-emails';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { UserService } from 'src/core/user/services/user.service';
import { EmailService } from 'src/integrations/email/email.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { CleanInactiveWorkspacesCommandOptions } from 'src/workspace/cron/clean-inactive-workspaces/commands/clean-inactive-workspaces.command';

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
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    this.inactiveDaysBeforeDelete =
      this.environmentService.getInactiveDaysBeforeDelete();
    this.inactiveDaysBeforeEmail =
      this.environmentService.getInactiveDaysBeforeEmail();
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
      `${this.getDryRunLogHeader(isDryRun)}Sending workspace ${
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
        bcc: this.environmentService.getEmailSystemAddress(),
        from: `${this.environmentService.getEmailFromName()} <${this.environmentService.getEmailFromAddress()}>`,
        subject: 'Action Needed to Prevent Workspace Deletion',
        html,
        text,
      });
    });
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

  getDryRunLogHeader(isDryRun: boolean): string {
    return isDryRun ? 'Dry-run mode: ' : '';
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
      `${this.getDryRunLogHeader(
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
      to: this.environmentService.getEmailSystemAddress(),
      from: `${this.environmentService.getEmailFromName()} <${this.environmentService.getEmailFromAddress()}>`,
      subject: 'Action Needed to Delete Workspaces',
      html,
      text,
    });
  }

  async handle(data: CleanInactiveWorkspacesCommandOptions): Promise<void> {
    const isDryRun = data.dryRun || false;

    const workspacesToDelete: WorkspaceToDeleteData[] = [];

    this.logger.log(`${this.getDryRunLogHeader(isDryRun)}Job running...`);
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
      `${this.getDryRunLogHeader(isDryRun)}On ${
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
        if (!(await this.isWorkspaceCleanable(dataSource))) {
          this.logger.log(
            `${this.getDryRunLogHeader(isDryRun)}Workspace ${
              dataSource.workspaceId
            } not cleanable`,
          );
          continue;
        }

        this.logger.log(
          `${this.getDryRunLogHeader(isDryRun)}Cleaning Workspace ${
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

    this.logger.log(`${this.getDryRunLogHeader(isDryRun)}job done!`);
  }
}
