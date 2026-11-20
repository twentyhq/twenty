import { type JobGroupEntity } from 'src/engine/metadata-modules/job-group/entities/job-group.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatJobGroup = UniversalFlatEntityFrom<
  JobGroupEntity,
  'jobGroup'
>;
