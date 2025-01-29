export interface RoleInterface {
  id: string;
  name: string;
  label: string;
  workspaceId: string;
  canUpdateAllSettings: boolean;
  isEditable: boolean;
  description?: string;
}
