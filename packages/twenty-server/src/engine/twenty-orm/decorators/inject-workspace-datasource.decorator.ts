import { Inject } from '@nestjs/common';

import { TWENTY_ORM_WORKSPACE_DATASOURCE } from 'src/engine/twenty-orm/twenty-orm.constants';

// nit: The datasource can be null if it's used outside of an authenticated request context
export const InjectWorkspaceDatasource = () =>
  Inject(TWENTY_ORM_WORKSPACE_DATASOURCE);
