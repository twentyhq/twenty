import { AnalyticsEvent } from 'src/engine/core-modules/analytics/types/event.type';
import { AnalyticsPageview as AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';

export const AnalyticsContextMock = (params?: {
  sendEvent?:
    | ((data: AnalyticsEvent) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
  sendPageview?:
    | ((data: AnalyticsPageview) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
  sendUnknownEvent?:
    | ((data: Record<string, unknown>) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
}) => {
  return {
    sendEvent: () => params?.sendEvent ?? jest.fn(),
    sendPageview: () => params?.sendPageview ?? jest.fn(),
    sendUnknownEvent: () => params?.sendUnknownEvent ?? jest.fn(),
  };
};
