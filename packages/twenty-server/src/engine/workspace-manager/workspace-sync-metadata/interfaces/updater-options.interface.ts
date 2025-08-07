import { type UpdaterAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/updater-action.type';

export interface UpdaterOptions {
  actions: UpdaterAction[];
}
