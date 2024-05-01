import { BadRequestException } from '@nestjs/common';

import { isDefined } from 'class-validator';

import {
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { UserMappingOptions } from 'src/engine/metadata-modules/remote-server/utils/user-mapping-options.utils';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

const buildUserMappingOptionsQuery = (
  parameters: any[],
  parametersPositions: object,
  userMappingOptions: DeepPartial<UserMappingOptions>,
): string | null => {
  const shouldUpdateUserMappingOptionsPassword = isDefined(
    userMappingOptions?.password,
  );

  if (shouldUpdateUserMappingOptionsPassword) {
    parameters.push(userMappingOptions?.password);
    parametersPositions['password'] = parameters.length;
  }

  const shouldUpdateUserMappingOptionsUsername = isDefined(
    userMappingOptions?.username,
  );

  if (shouldUpdateUserMappingOptionsUsername) {
    parameters.push(userMappingOptions?.username);
    parametersPositions['username'] = parameters.length;
  }

  if (
    shouldUpdateUserMappingOptionsPassword ||
    shouldUpdateUserMappingOptionsUsername
  ) {
    return `"userMappingOptions" = jsonb_set(${
      shouldUpdateUserMappingOptionsPassword &&
      shouldUpdateUserMappingOptionsUsername
        ? `jsonb_set(
              "userMappingOptions", 
              '{username}', 
              to_jsonb($${parametersPositions['username']}::text)
          ), 
          '{password}', 
          to_jsonb($${parametersPositions['password']}::text)
      `
        : shouldUpdateUserMappingOptionsPassword
          ? `"userMappingOptions",
                '{password}', 
                to_jsonb($${parametersPositions['password']}::text)
            `
          : `"userMappingOptions", 
                '{username}', 
                to_jsonb($${parametersPositions['username']}::text)
            `
    })`;
  }

  return null;
};

// TO DO This only works for postgres_fdw type for now, lets make it more generic when we have a different type
export const updateRemoteServerRawQuery = (
  remoteServerToUpdate: DeepPartial<RemoteServerEntity<RemoteServerType>> &
    Pick<RemoteServerEntity<RemoteServerType>, 'workspaceId' | 'id'>,
): [any[], string] => {
  const parameters: any[] = [remoteServerToUpdate.id];
  const parametersPositions = {};

  const options: string[] = [];

  if (remoteServerToUpdate.userMappingOptions) {
    const userMappingOptionsQuery = buildUserMappingOptionsQuery(
      parameters,
      parametersPositions,
      remoteServerToUpdate.userMappingOptions,
    );

    if (userMappingOptionsQuery) options.push(userMappingOptionsQuery);
  }

  const shouldUpdateFdwDbname = isDefined(
    remoteServerToUpdate.foreignDataWrapperOptions?.dbname,
  );

  if (shouldUpdateFdwDbname) {
    parameters.push(remoteServerToUpdate?.foreignDataWrapperOptions?.dbname);
    parametersPositions['dbname'] = parameters.length;
  }

  const shouldUpdateFdwHost = isDefined(
    remoteServerToUpdate.foreignDataWrapperOptions?.host,
  );

  if (shouldUpdateFdwHost) {
    parameters.push(remoteServerToUpdate?.foreignDataWrapperOptions?.host);
    parametersPositions['host'] = parameters.length;
  }

  const shouldUpdateFdwPort = isDefined(
    remoteServerToUpdate.foreignDataWrapperOptions?.port,
  );

  if (shouldUpdateFdwPort) {
    parameters.push(remoteServerToUpdate?.foreignDataWrapperOptions?.port);
    parametersPositions['port'] = parameters.length;
  }

  if (shouldUpdateFdwDbname || shouldUpdateFdwHost || shouldUpdateFdwPort) {
    const fwdOptionsQuery = `"foreignDataWrapperOptions" = jsonb_set(${
      shouldUpdateFdwDbname && shouldUpdateFdwHost && shouldUpdateFdwPort
        ? `jsonb_set(jsonb_set("foreignDataWrapperOptions", '{dbname}', to_jsonb($${parametersPositions['dbname']}::text)), '{host}', to_jsonb($${parametersPositions['host']}::text)), '{port}', to_jsonb($${parametersPositions['port']}::text)`
        : shouldUpdateFdwDbname && shouldUpdateFdwHost
          ? `jsonb_set("foreignDataWrapperOptions", '{dbname}', to_jsonb($${parametersPositions['dbname']}::text)), '{host}', to_jsonb($${parametersPositions['host']}::text)`
          : shouldUpdateFdwDbname && shouldUpdateFdwPort
            ? `jsonb_set("foreignDataWrapperOptions", '{dbname}', to_jsonb($${parametersPositions['dbname']}::text)), '{port}', to_jsonb($${parametersPositions['port']}::text)`
            : shouldUpdateFdwHost && shouldUpdateFdwPort
              ? `jsonb_set("foreignDataWrapperOptions", '{host}', to_jsonb($${parametersPositions['host']}::text)), '{port}', to_jsonb($${parametersPositions['port']}::text)`
              : shouldUpdateFdwDbname
                ? `"foreignDataWrapperOptions", '{dbname}', to_jsonb($${parametersPositions['dbname']}::text)`
                : shouldUpdateFdwHost
                  ? `"foreignDataWrapperOptions", '{host}', to_jsonb($${parametersPositions['host']}::text)`
                  : `"foreignDataWrapperOptions", '{port}', to_jsonb($${parametersPositions['port']}::text)`
    })`;

    options.push(fwdOptionsQuery);
  }

  if (options.length < 1) {
    throw new BadRequestException('No fields to update');
  }

  const rawQuery = `UPDATE metadata."remoteServer" SET ${options.join(
    ', ',
  )} WHERE "id"= $1 RETURNING *`;

  return [parameters, rawQuery];
};
