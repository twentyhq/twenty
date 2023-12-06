import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { CreateFieldInput } from 'src/metadata/field-metadata/dtos/create-field.input';

@Injectable()
export class BeforeCreateOneField<T extends CreateFieldInput>
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
