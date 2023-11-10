import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { CreateObjectInput } from 'src/metadata/object-metadata/dtos/create-object.input';

@Injectable()
export class BeforeCreateOneObject<T extends CreateObjectInput>
  implements BeforeCreateOneHook<T, any>
{
  constructor(readonly dataSourceService: DataSourceService) {}

  async run(
    instance: CreateOneInputType<T>,
    context: any,
  ): Promise<CreateOneInputType<T>> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const lastDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    instance.input.dataSourceId = lastDataSourceMetadata.id;
    instance.input.workspaceId = workspaceId;
    return instance;
  }
}
