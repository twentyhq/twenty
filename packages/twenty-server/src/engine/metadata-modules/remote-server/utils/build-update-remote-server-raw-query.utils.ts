import { BadRequestException } from '@nestjs/common';

import {
  ForeignDataWrapperOptions,
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { UserMappingOptions } from 'src/engine/metadata-modules/remote-server/types/user-mapping-options';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export const buildUpdateRemoteServerRawQuery = (
  remoteServerToUpdate: DeepPartial<RemoteServerEntity<RemoteServerType>> &
    Pick<RemoteServerEntity<RemoteServerType>, 'workspaceId' | 'id'>,
): [any[], string] => {
  const options: string[] = [];

  const [parameters, parametersPositions] =
    buildParametersAndPositions(remoteServerToUpdate);

  if (remoteServerToUpdate.userMappingOptions) {
    const userMappingOptionsQuery = buildJsonRawQuery(
      remoteServerToUpdate.userMappingOptions,
      parametersPositions,
      'userMappingOptions',
    );

    options.push(userMappingOptionsQuery);
  }

  if (remoteServerToUpdate.foreignDataWrapperOptions) {
    const foreignDataWrapperOptionsQuery = buildJsonRawQuery(
      remoteServerToUpdate.foreignDataWrapperOptions,
      parametersPositions,
      'foreignDataWrapperOptions',
    );

    options.push(foreignDataWrapperOptionsQuery);
  }

  if (options.length < 1) {
    throw new BadRequestException('No fields to update');
  }

  const rawQuery = `UPDATE metadata."remoteServer" SET ${options.join(
    ', ',
  )} WHERE "id"= $1 RETURNING *`;

  return [parameters, rawQuery];
};

const buildParametersAndPositions = (
  remoteServerToUpdate: DeepPartial<RemoteServerEntity<RemoteServerType>> &
    Pick<RemoteServerEntity<RemoteServerType>, 'workspaceId' | 'id'>,
): [any[], object] => {
  const parameters: any[] = [remoteServerToUpdate.id];
  const parametersPositions = {};

  if (remoteServerToUpdate.userMappingOptions) {
    Object.entries(remoteServerToUpdate.userMappingOptions).forEach(
      ([key, value]) => {
        parameters.push(value);
        parametersPositions[key] = parameters.length;
      },
    );
  }

  if (remoteServerToUpdate.foreignDataWrapperOptions) {
    Object.entries(remoteServerToUpdate.foreignDataWrapperOptions).forEach(
      ([key, value]) => {
        parameters.push(value);
        parametersPositions[key] = parameters.length;
      },
    );
  }

  return [parameters, parametersPositions];
};

const buildJsonRawQuery = (
  options:
    | Partial<UserMappingOptions>
    | Partial<ForeignDataWrapperOptions<RemoteServerType>>,
  parametersPositions: object,
  objectName: string,
): string => {
  const buildJsonSet = (
    opts:
      | Partial<UserMappingOptions>
      | Partial<ForeignDataWrapperOptions<RemoteServerType>>,
  ): string => {
    const [[firstKey, _], ...followingOptions] = Object.entries(opts);

    let query = `jsonb_set("${objectName}", '{${firstKey}}', to_jsonb($${parametersPositions[firstKey]}::text))`;

    followingOptions.forEach(([key, _]) => {
      query = `jsonb_set(${query}, '{${key}}', to_jsonb($${parametersPositions[key]}::text))`;
    });

    return query;
  };

  return `"${objectName}" = ${buildJsonSet(options)}`;
};
