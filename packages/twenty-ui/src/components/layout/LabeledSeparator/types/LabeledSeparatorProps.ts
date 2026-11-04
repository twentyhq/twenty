import { type useRender } from '@base-ui/react/use-render';

export type LabeledSeparatorProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  children: string;
  labelPosition?: 'center' | 'end';
  tone?: 'neutral' | 'danger';
  hasStartMarker?: boolean;
};
