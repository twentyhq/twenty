import { Injectable } from '@nestjs/common';

import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UPGRADE_COMMAND_VERSIONS } from 'src/engine/constants/upgrade-command-versions.constant';
import { getPreviousVersion } from 'src/utils/version/get-previous-version';

@Injectable()
export class CoreEngineVersionService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getCurrentAppVersion(): SemVer {
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    if (!isDefined(appVersion)) {
      throw new Error(
        'APP_VERSION is not defined, please double check your env variables',
      );
    }

    return new SemVer(appVersion);
  }

  getPreviousTwentyVersion(): SemVer {
    const currentAppVersion = this.getCurrentAppVersion();
    const currentVersionMajorMinor = `${currentAppVersion.major}.${currentAppVersion.minor}.0`;

    const previousVersion = getPreviousVersion({
      currentVersion: currentVersionMajorMinor,
      versions: [...UPGRADE_COMMAND_VERSIONS],
    });

    if (!isDefined(previousVersion)) {
      throw new Error(
        `No previous version found for version ${currentAppVersion}. Available versions: ${UPGRADE_COMMAND_VERSIONS.join(', ')}`,
      );
    }

    return previousVersion;
  }
}
