import { type FloatingButtonProps } from '@ui/components/FloatingButton/types/FloatingButtonProps';
import React from 'react';

export type FloatingButtonGroupProps = Pick<FloatingButtonProps, 'size'> & {
  children: React.ReactElement[];
  className?: string;
};
