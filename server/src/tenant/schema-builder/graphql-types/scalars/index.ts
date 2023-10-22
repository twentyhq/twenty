import { BigFloatScalarType } from './big-float.scalar';
import { BigIntScalarType } from './big-int.scalar';
import { CursorScalarType } from './cursor.scalar';
import { DateScalarType } from './date.scalar';
import { DateTimeScalarType } from './date-time.scalar';
import { TimeScalarType } from './time.scalar';
import { UUIDScalarType } from './uuid.scalar';

export const scalars = [
  BigFloatScalarType,
  BigIntScalarType,
  DateScalarType,
  DateTimeScalarType,
  TimeScalarType,
  UUIDScalarType,
  CursorScalarType,
];
