import { Field as FieldPrimitive } from '@base-ui/react/field';

type FieldProps = {
  children?: React.ReactNode;
  className?: string;
  name?: string;
  'data-testid'?: string;
};

export const Field = ({
  children,
  className,
  name,
  'data-testid': dataTestId,
}: FieldProps) => (
  <FieldPrimitive.Root
    className={className}
    name={name}
    data-testid={dataTestId}
  >
    {children}
  </FieldPrimitive.Root>
);
