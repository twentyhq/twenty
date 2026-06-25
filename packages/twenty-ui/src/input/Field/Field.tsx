import { Field as FieldPrimitive } from '@base-ui/react/field';

import { FieldDescription } from './internal/FieldDescription';
import { FieldError } from './internal/FieldError';
import { FieldLabel } from './internal/FieldLabel';
import { FieldRoot } from './internal/FieldRoot';

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldPrimitive.Control,
  Description: FieldDescription,
  Error: FieldError,
};
