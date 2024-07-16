import {
  ForeignDataWrapperOptions,
  RemoteServerEntity,
  RemoteServerType,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  RemoteServerException,
  RemoteServerExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-server.exception';
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

  if (remoteServerToUpdate.schema) {
    options.push(`"schema" = $${parametersPositions['schema']}`);
  }

  if (remoteServerToUpdate.label) {
    options.push(`"label" = $${parametersPositions['label']}`);
  }

  if (options.length < 1) {
    throw new RemoteServerException(
      'No fields to update',
      RemoteServerExceptionCode.INVALID_REMOTE_SERVER_INPUT,
    );
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

  if (remoteServerToUpdate.schema) {
    parameters.push(remoteServerToUpdate.schema);
    parametersPositions['schema'] = parameters.length;
  }

  if (remoteServerToUpdate.label) {
    parameters.push(remoteServerToUpdate.label);
    parametersPositions['label'] = parameters.length;
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
