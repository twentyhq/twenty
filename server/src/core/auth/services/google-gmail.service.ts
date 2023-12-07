import { Injectable } from '@nestjs/common';

import { SaveConnectedAccountInput } from 'src/core/auth/dto/save-connected-account';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Injectable()
export class GoogleGmailService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {}

  async saveConnectedAccount(
    saveConnectedAccountInput: SaveConnectedAccountInput,
  ) {
    console.log('saveConnectedAccountInput', saveConnectedAccountInput);
    const { accountOwner, type, accessToken, refreshToken } =
      saveConnectedAccountInput;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        accountOwner.defaultWorkspace.id,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    // const workspaceMembers = await workspaceDataSource?.query(
    //   `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId" = '${user.id}'`,
    // );

    console.log('workspaceDataSource', workspaceDataSource);

    // Update connected account
    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."connectedAccount" ("type", "accessToken", "refreshToken") VALUES ('${type}', '${accessToken}', '${refreshToken}')`,
    );

    return;
  }
}
