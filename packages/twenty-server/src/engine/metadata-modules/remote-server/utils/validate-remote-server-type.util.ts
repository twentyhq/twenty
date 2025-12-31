import { type Repository } from 'typeorm';

import { type FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { type RemoteServerType } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import {
  RemoteServerException,
  RemoteServerExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-server.exception';

export const validateRemoteServerType = async (
  remoteServerType: RemoteServerType,
  _featureFlagRepository: Repository<FeatureFlagEntity>,
  _workspaceId: string,
) => {
  throw new RemoteServerException(
    `Type ${remoteServerType} is not supported.`,
    RemoteServerExceptionCode.INVALID_REMOTE_SERVER_INPUT,
  );
};
