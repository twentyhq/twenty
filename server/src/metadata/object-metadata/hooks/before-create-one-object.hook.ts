import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeCreateOneHook,
  CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { CreateObjectInput } from 'src/metadata/object-metadata/dtos/create-object.input';
import { standardObjectsNames } from 'src/workspace/workspace-manager/standard-objects/standard-object-metadata';

const OBJECT_TYPES = [
  'featureFlag',
  'refreshToken',
  'UserWorkspaceMemberName',
  'UserWorkspaceMember',
  'Workspace',
  'User',
  ...standardObjectsNames,
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
      OBJECT_TYPES.includes(instance.input.nameSingular.trim().toLowerCase()) ||
      OBJECT_TYPES.includes(instance.input.nameSingular.trim().toLowerCase())
    ) {
      throw new ForbiddenException(
        'You cannot create an object with this type.',
      );
    }
    instance.input.workspaceId = workspaceId;
    return instance;
  }
}
