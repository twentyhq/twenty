import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

const coreObjectNames = [
  'featureFlag',
  'appToken',
  'workspace',
  'user',
  'event',
  'field',
];

@Injectable()
export class BeforeCreateOneObject<T extends CreateObjectInput>
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

    if (
      coreObjectNames.includes(instance.input.nameSingular) ||
      coreObjectNames.includes(instance.input.namePlural)
    ) {
      throw new ForbiddenException(
        'You cannot create an object with this name.',
      );
    }
    instance.input.workspaceId = workspaceId;

    return instance;
  }
}
