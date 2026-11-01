import { isDefined } from '@ui/utilities/utils/isDefined';

type ToasterProviderSuspensionProps = {
  pendingSuspension?: Promise<void>;
};

export const ToasterProviderSuspension = ({
  pendingSuspension,
}: ToasterProviderSuspensionProps) => {
  if (isDefined(pendingSuspension)) {
    throw pendingSuspension;
  }

  return null;
};
