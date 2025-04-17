import { TrackEventName } from 'src/engine/core-modules/analytics/types/events.type';

export const AnalyticsContextMock = (params?: {
  track?:
    | ((
        event: TrackEventName,
        properties: any,
      ) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
  pageview?:
    | ((name: string, properties: any) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
}) => {
  return {
    track: params?.track ?? jest.fn().mockResolvedValue({ success: true }),
    pageview:
      params?.pageview ?? jest.fn().mockResolvedValue({ success: true }),
  };
};
