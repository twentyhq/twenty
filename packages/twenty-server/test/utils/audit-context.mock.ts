import { TrackEventName } from 'src/engine/core-modules/audit/types/events.type';

export const AuditContextMock = (params?: {
  insertWorkspaceEvent?:
    | ((
        event: TrackEventName,
        properties: any,
      ) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
  insertObjectEvent?:
    | ((
        event: TrackEventName,
        properties: any,
      ) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
  insertPageviewEvent?:
    | ((name: string, properties: any) => Promise<{ success: boolean }>)
    | jest.Mock<any, any>;
}) => {
  return {
    insertWorkspaceEvent:
      params?.insertWorkspaceEvent ??
      jest.fn().mockResolvedValue({ success: true }),
    insertObjectEvent:
      params?.insertObjectEvent ??
      jest.fn().mockResolvedValue({ success: true }),
    insertPageviewEvent:
      params?.insertPageviewEvent ??
      jest.fn().mockResolvedValue({ success: true }),
  };
};
