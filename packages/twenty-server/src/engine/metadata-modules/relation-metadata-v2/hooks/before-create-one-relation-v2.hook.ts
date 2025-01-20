import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { CreateRelationV2Input } from 'src/engine/metadata-modules/relation-metadata-v2/dtos/create-relation-v2.input';

@Injectable()
export class BeforeCreateOneRelationV2<T extends CreateRelationV2Input>
  implements BeforeCreateOneHook<T>
{
  async run(
    instance: CreateOneInputType<T>,
    context: any,
  ): Promise<CreateOneInputType<T>> {
    const workspaceId = context?.req?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    instance.input.workspaceId = workspaceId;

    return instance;
  }
}
