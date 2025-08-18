import {
  type VariableDateViewFilterValue,
} from '@/types/RelativeDateValue';
import { isNumber, isObject } from '@sniptt/guards';

export const safeParseRelativeDateFilterValue = (
  value: string,
): VariableDateViewFilterValue | undefined => {
  try {
    const parsedValue = JSON.parse(value);

    if (!parsedValue || !isObject(parsedValue)) {
      return undefined;
    }

    const { direction, unit, amount } = parsedValue;

    if (!['NEXT', 'THIS', 'PAST'].includes(direction)) {
      return undefined;
    }

    if (!['DAY', 'WEEK', 'MONTH', 'YEAR'].includes(unit)) {
      return undefined;
    }

    if (direction === 'NEXT' || direction === 'PAST') {
      if (!isNumber(amount) || amount <= 0) {
        return undefined;
      }
    }

    return { direction, unit, amount };
  } catch {
    return undefined;
  }
}
