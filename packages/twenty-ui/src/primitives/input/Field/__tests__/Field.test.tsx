import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Field } from '../Field';
import descriptionStyles from '../internal/FieldDescription.module.scss';
import errorStyles from '../internal/FieldError.module.scss';
import labelStyles from '../internal/FieldLabel.module.scss';

const FieldRootWrapper = ({ children }: { children: ReactNode }) => (
  <Field.Root>{children}</Field.Root>
);

runComponentConformance({
  name: 'Field.Root',
  element: <Field.Root />,
  refInstanceOf: HTMLDivElement,
});

runComponentConformance({
  name: 'Field.Label',
  element: <Field.Label>Label</Field.Label>,
  refInstanceOf: HTMLLabelElement,
  wrapper: FieldRootWrapper,
  ownClassName: labelStyles.label,
  renderPropTagName: 'label',
});

runComponentConformance({
  name: 'Field.Description',
  element: <Field.Description>Description</Field.Description>,
  refInstanceOf: HTMLParagraphElement,
  wrapper: FieldRootWrapper,
  ownClassName: descriptionStyles.description,
});

runComponentConformance({
  name: 'Field.Error',
  element: <Field.Error match>Required</Field.Error>,
  refInstanceOf: HTMLDivElement,
  wrapper: FieldRootWrapper,
  ownClassName: errorStyles.error,
});
