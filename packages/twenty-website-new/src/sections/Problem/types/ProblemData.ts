import { EyebrowType } from '@/design-system/components/Eyebrow';
import { HeadingType } from '@/design-system/components/Heading';
import { ProblemPointType } from './ProblemPoint';

export type ProblemDataType = {
  eyebrow: EyebrowType;
  heading: HeadingType[];
  points: ProblemPointType[];
};
