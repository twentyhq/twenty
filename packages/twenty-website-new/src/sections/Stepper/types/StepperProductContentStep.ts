import type { StepperProductStepType } from '@/sections/Stepper/types/StepperProductStep';

export type StepperProductContentStepType = Omit<StepperProductStepType, 'image'>;
