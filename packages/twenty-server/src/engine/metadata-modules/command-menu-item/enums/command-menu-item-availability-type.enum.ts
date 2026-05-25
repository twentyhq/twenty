import { registerEnumType } from '@nestjs/graphql';

export enum CommandMenuItemAvailabilityType {
  GLOBAL = 'GLOBAL',
  GLOBAL_OBJECT_CONTEXT = 'GLOBAL_OBJECT_CONTEXT',
  RECORD_SELECTION = 'RECORD_SELECTION',
  FALLBACK = 'FALLBACK',
}

registerEnumType(CommandMenuItemAvailabilityType, {
  name: 'CommandMenuItemAvailabilityType',
});
