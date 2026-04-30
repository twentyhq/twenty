'use client';

import { theme } from '@/theme';
import { Field } from '@base-ui/react/field';
import { styled } from '@linaria/react';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

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

function FormTextarea(props: FormTextareaProps) {
  // oxlint-disable-next-line eslint-plugin-react(jsx-props-no-spreading)
  return <Field.Control render={TEXTAREA_RENDER} {...props} />;
}

export const Form = {
  Field: FormField,
  Input: FormInput,
  Textarea: FormTextarea,
  Label: FieldLabel,
  Hint: FieldHint,
  Error: FieldError,
};
