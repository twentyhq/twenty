import { useRender } from '@base-ui/react/use-render';

export const SettingsRowLabel = ({
  render,
  ref,
  ...props
}: useRender.ComponentProps<'label'>) =>
  useRender({ defaultTagName: 'label', render, ref, props });
