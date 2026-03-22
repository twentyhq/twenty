import { registerEnumType } from '@nestjs/graphql';

export enum CommandMenuItemAvailabilityType {
  GLOBAL = 'GLOBAL',
  RECORD_SELECTION = 'RECORD_SELECTION',
  FALLBACK = 'FALLBACK',
}

registerEnumType(CommandMenuItemAvailabilityType, {
  name: 'CommandMenuItemAvailabilityType',
});
