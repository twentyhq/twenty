import { Field as FieldPrimitive } from '@base-ui/react/field';

import { FieldDescription } from './internal/FieldDescription';
import { FieldError } from './internal/FieldError';
import { FieldLabel } from './internal/FieldLabel';

export const Field = {
  Root: FieldPrimitive.Root,
  Label: FieldLabel,
  Control: FieldPrimitive.Control,
  Description: FieldDescription,
  Error: FieldError,
  Validity: FieldPrimitive.Validity,
};
