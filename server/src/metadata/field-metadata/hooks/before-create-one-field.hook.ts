import { Injectable, UnauthorizedException } from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

@Injectable()
export class BeforeCreateOneField<T extends FieldMetadata>
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
    instance.input.isActive = false;
    instance.input.isCustom = true;
    return instance;
  }
}
