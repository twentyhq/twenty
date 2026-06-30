import { OBJECTS_BLOCKED_FROM_AUTOMATION } from '../constants/ObjectsBlockedFromAutomation';

export const canObjectBeManagedByAutomation = ({
  nameSingular,
}: {
  nameSingular: string;
}): boolean => {
  return !OBJECTS_BLOCKED_FROM_AUTOMATION.includes(
    nameSingular as (typeof OBJECTS_BLOCKED_FROM_AUTOMATION)[number],
  );
};
