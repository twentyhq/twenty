import { type DropdownRegistry } from './DropdownRegistry';

export const subscribeToDropdownRegistry = ({
  registry,
  listener,
}: {
  registry: DropdownRegistry;
  listener: () => void;
}) => {
  registry.listeners.add(listener);

  return () => {
    registry.listeners.delete(listener);
  };
};
