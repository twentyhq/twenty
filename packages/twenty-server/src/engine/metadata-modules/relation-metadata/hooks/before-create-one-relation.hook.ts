import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { CreateRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/create-relation.input';

@Injectable()
export class BeforeCreateOneRelation<T extends CreateRelationInput>
  implements BeforeCreateOneHook<T, any>
{
  async run(
    instance: CreateOneInputType<T>,
    context: any,
  ): Promise<CreateOneInputType<T>> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    instance.input.workspaceId = workspaceId;

    return instance;
  }
}
