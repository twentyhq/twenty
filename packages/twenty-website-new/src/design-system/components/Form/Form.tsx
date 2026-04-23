'use client';

import { theme } from '@/theme';
import { Field } from '@base-ui/react/field';
import { styled } from '@linaria/react';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

/**
 * Compound Form primitive built on Base UI's `Field`.
 *
 * Base UI's `Field.Root` provides the id + ARIA wiring; we add a thin
 * `<Form.Field label hint error>` sugar layer so consumers don't have
 * to assemble Label + Description + Error themselves when those slots
 * follow the standard layout.
 *
 * ```tsx
 * <Form.Field name="email" label="Email" hint="We never share it." error={emailError}>
 *   <Form.Input type="email" placeholder="you@company.com" />
 * </Form.Field>
 * ```
 *
 * Notes:
 * - Pass `label={null}` (or omit it) when the visual label lives
 *   elsewhere — the input is still ARIA-wired through Base UI's
 *   context. Use `aria-label` on the input if there's no visible label
 *   anywhere.
 * - The `error` slot, when set, also wires `aria-invalid="true"` on
 *   the input. The error message is announced via `aria-describedby`.
 * - This is a layout/wiring primitive only — it doesn't run validation
 *   or own form state. Pass `validate={…}` to `<Form.Field>` to opt
 *   into Base UI's built-in validation, or handle errors via the
 *   parent form's `onSubmit` and pass them down through `error`.
 */

const FieldRootBase = styled(Field.Root)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1.5)};
  width: 100%;
`;

const FieldLabel = styled(Field.Label)`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.lineHeight(4.5)};
`;

const FieldHint = styled(Field.Description)`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
  margin: 0;
`;

const FieldError = styled(Field.Error)`
  color: #ff9a9a;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(3.5)};
  margin: 0;
`;

export type FormFieldProps = ComponentPropsWithoutRef<typeof Field.Root> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

function FormField({
  children,
  error,
  hint,
  invalid,
  label,
  ...rootProps
}: FormFieldProps) {
  const hasHint = hint !== undefined && hint !== null && hint !== '';
  const hasError = error !== undefined && error !== null && error !== '';
  const computedInvalid =
    invalid !== undefined ? invalid : hasError || undefined;

  return (
    // oxlint-disable-next-line eslint-plugin-react(jsx-props-no-spreading)
    <FieldRootBase invalid={computedInvalid} {...rootProps}>
      {label !== undefined && label !== null ? (
        <FieldLabel>{label}</FieldLabel>
      ) : null}
      {children}
      {hasHint ? <FieldHint>{hint}</FieldHint> : null}
      {hasError ? <FieldError>{error}</FieldError> : null}
    </FieldRootBase>
  );
}

/**
 * `Form.Input` renders a styled `<input>` wired to its parent
 * `<Form.Field>`. Field auto-supplies `id`, `aria-describedby`, and
 * `aria-invalid` via Base UI's context — no manual wiring at the call
 * site. The component IS the styled input, so all native input props
 * (`name`, `type`, `placeholder`, `inputMode`, …) flow through Linaria's
 * `styled()` HOC without a wrapper / spread.
 */
export const FormInput = styled(Field.Control)`
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  height: clamp(40px, 5.5vh, 56px);
  line-height: ${theme.lineHeight(5.5)};
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
  padding-top: ${theme.spacing(1)};
  width: 100%;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }

  &:focus-visible {
    border-color: ${theme.colors.highlight[100]};
    outline: none;
  }

  &[aria-invalid='true'] {
    border-color: #ff9a9a;
  }
`;

const StyledTextareaElement = styled.textarea`
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  min-height: clamp(80px, 18vh, 185px);
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
  padding-top: ${theme.spacing(1)};
  resize: vertical;
  width: 100%;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }

  &:focus-visible {
    border-color: ${theme.colors.highlight[100]};
    outline: none;
  }

  &[aria-invalid='true'] {
    border-color: #ff9a9a;
  }
`;

const TEXTAREA_RENDER = <StyledTextareaElement />;

export type FormTextareaProps = Omit<
  ComponentPropsWithoutRef<typeof Field.Control>,
  'render'
>;

/**
 * `Form.Textarea` is `Field.Control` with `render={<textarea/>}` baked
 * in. We forward consumer props onto Base UI's `Field.Control`, which
 * clones them onto the rendered `<textarea>` together with its own
 * id/aria attributes. The `{...props}` is the entire purpose of this
 * wrapper — see the linked rule discussion below.
 *
 * eslint-disable-next-line: this primitive exists explicitly to be a
 * pass-through over a native element; the rule's own
 * `explicitSpread: ignore` mode is meant to allow this case.
 */
function FormTextarea(props: FormTextareaProps) {
  // oxlint-disable-next-line eslint-plugin-react(jsx-props-no-spreading)
  return <Field.Control render={TEXTAREA_RENDER} {...props} />;
}

export const Form = {
  Field: FormField,
  Input: FormInput,
  Textarea: FormTextarea,
  /** Re-exported so consumers can render labels/hints/errors directly
   * when the `<Form.Field label hint error>` sugar isn't enough (e.g.
   * to insert other markup between them). */
  Label: FieldLabel,
  Hint: FieldHint,
  Error: FieldError,
};
