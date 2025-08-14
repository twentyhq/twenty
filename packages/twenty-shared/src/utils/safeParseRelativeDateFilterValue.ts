import {
  type VariableDateViewFilterValue,
} from '@/types/RelativeDateValue';

export const safeParseRelativeDateValue = (
  value: string,
): VariableDateViewFilterValue | undefined => {
  try {
    const parsedValue = JSON.parse(value);

    if (!parsedValue || typeof parsedValue !== 'object') {
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
      if (typeof amount !== 'number' || amount <= 0) {
        return undefined;
      }
    }

    return { direction, unit, amount };
  } catch {
    return undefined;
  }
}