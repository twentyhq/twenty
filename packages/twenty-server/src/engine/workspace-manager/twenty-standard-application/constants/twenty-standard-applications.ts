import {
  TWENTY_STANDARD_APPLICATION_NAME,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const TWENTY_STANDARD_APPLICATION = {
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: TWENTY_STANDARD_APPLICATION_NAME,
  description:
    'Twenty is an open-source CRM that allows you to manage your sales and customer relationships',
  version: '1.0.1',
  sourcePath: 'cli-sync',
  sourceType: ApplicationRegistrationSourceType.LOCAL,
} as const satisfies Pick<
  ApplicationEntity,
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'version'
  | 'sourcePath'
  | 'sourceType'
>;
