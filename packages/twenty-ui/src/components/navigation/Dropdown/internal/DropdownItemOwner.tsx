import { useRender } from '@base-ui/react/use-render';

type DropdownItemOwnerProps = useRender.ComponentProps<'button'>;

export const DropdownItemOwner = ({
  render,
  ref,
  disabled,
  ...props
}: DropdownItemOwnerProps) =>
  useRender({
    render,
    ref,
    defaultTagName: 'button',
    props: { ...props, disabled },
  });
