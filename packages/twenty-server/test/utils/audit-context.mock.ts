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
  createPageviewEvent?:
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
    createPageviewEvent:
      params?.createPageviewEvent ??
      jest.fn().mockResolvedValue({ success: true }),
  };
};
