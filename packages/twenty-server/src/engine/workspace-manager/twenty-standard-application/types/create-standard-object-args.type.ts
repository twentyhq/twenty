import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type CreateStandardObjectContext } from 'src/engine/workspace-manager/twenty-standard-application/types/create-standard-object-context.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardObjectArgs<
  TObjectName extends AllStandardObjectName = AllStandardObjectName,
> = StandardBuilderArgs<'objectMetadata'> & {
  objectName: TObjectName;
  context: CreateStandardObjectContext<TObjectName>;
};
