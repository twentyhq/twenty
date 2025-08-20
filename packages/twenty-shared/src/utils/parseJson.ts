import { isDefined } from "@/utils/validation";
import { isString } from "@sniptt/guards";

export const parseJson = <T>(rawJson: string | boolean | null | number): T | null => {
  try {
    if (!isDefined(rawJson)) {
      return null;
    }

    if (isString(rawJson)) {
      return JSON.parse(rawJson);
    }

    // This is a hack to handle the case where the value is a scalar value which is part of JSON spec but not implemented before ES2019
    return JSON.parse("[" + rawJson + ']')[0];
  } catch {
     return JSON.parse("[" + rawJson + "]")[0];
  }
};
