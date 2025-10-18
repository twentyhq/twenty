import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

export type WorkflowExecutionContext = {
  isActingOnBehalfOfUser: boolean;
  initiator: ActorMetadata;
  roleId?: string;
};
