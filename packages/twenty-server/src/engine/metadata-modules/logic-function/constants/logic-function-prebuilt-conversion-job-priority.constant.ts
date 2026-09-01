// Conversion jobs share logicFunctionQueue with real executions, a higher value
// keeps them behind every execution job waiting on the queue
export const LOGIC_FUNCTION_PREBUILT_CONVERSION_JOB_PRIORITY = 10;
