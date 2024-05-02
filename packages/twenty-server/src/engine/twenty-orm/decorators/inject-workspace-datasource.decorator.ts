import { Inject } from '@nestjs/common';

import { TWENTY_ORM_WORKSPACE_DATASOURCE } from 'src/engine/twenty-orm/twenty-orm.constants';

export const InjectWorkspaceDatasource = () =>
  Inject(TWENTY_ORM_WORKSPACE_DATASOURCE);
