import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

@Injectable()
export class BeforeCreateOneObject<T extends ObjectMetadata>
  implements BeforeCreateOneHook<T, any>
{
  constructor(readonly dataSourceMetadataService: DataSourceMetadataService) {}

  async run(
    instance: CreateOneInputType<T>,
    context: any,
  ): Promise<CreateOneInputType<T>> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const lastDataSourceMetadata =
      await this.dataSourceMetadataService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    instance.input.dataSourceId = lastDataSourceMetadata.id;
    instance.input.targetTableName = instance.input.nameSingular;
    instance.input.workspaceId = workspaceId;
    instance.input.isActive = false;
    instance.input.isCustom = true;
    return instance;
  }
}
