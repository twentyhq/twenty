import { type APP_LOCALES } from 'twenty-shared/translations';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

export type ManifestMessageRequestContext = {
  loaders: IDataloaders;
  req: {
    locale?: keyof typeof APP_LOCALES;
    workspace?: Pick<WorkspaceEntity, 'id'>;
  };
};
