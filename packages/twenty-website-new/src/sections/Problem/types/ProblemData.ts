import { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { ProblemPointType } from './ProblemPoint';

export type ProblemDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  points: ProblemPointType[];
};
