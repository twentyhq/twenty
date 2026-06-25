import { Field as FieldPrimitive } from '@base-ui/react/field';

type FieldRootProps = {
  children?: React.ReactNode;
  className?: string;
  name?: string;
  'data-testid'?: string;
};

export const FieldRoot = ({
  children,
  className,
  name,
  'data-testid': dataTestId,
}: FieldRootProps) => (
  <FieldPrimitive.Root
    className={className}
    name={name}
    data-testid={dataTestId}
  >
    {children}
  </FieldPrimitive.Root>
);
