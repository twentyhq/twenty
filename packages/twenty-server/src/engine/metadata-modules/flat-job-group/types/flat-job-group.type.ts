import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type JobGroupEntity } from 'src/engine/metadata-modules/job-group/entities/job-group.entity';

export type FlatJobGroup = FlatEntityFrom<JobGroupEntity>;
