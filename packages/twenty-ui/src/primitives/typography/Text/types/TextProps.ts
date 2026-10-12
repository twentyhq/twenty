import { type useRender } from '@base-ui/react/use-render';

import { type TextTruncationProps } from '../internal/TextTruncationProps';

export type TextProps = useRender.ComponentProps<'div'> & TextTruncationProps;
