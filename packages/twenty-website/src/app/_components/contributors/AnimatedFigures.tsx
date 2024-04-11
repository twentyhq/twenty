import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from 'framer-motion';

import { Theme } from '@/app/_components/ui/theme/theme';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 56px;
  font-weight: 700;
  color: ${Theme.text.color.secondary};

  @media (max-width: 810px) {
    font-size: 32px;
  }
`;

interface AnimatedFiguresProps {
  value: number;
  children?: React.ReactNode;
}

export const AnimatedFigures = ({ value, children }: AnimatedFiguresProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest);
  });
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      animate(count, value, { duration: 2 });
    }
  }, [count, inView, value]);

  return (
    <Container>
      <motion.span ref={ref}>{rounded}</motion.span>
      {children}
    </Container>
  );
};
