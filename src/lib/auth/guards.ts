export function assertWorkspaceAccess(input: {
  sessionWorkspaceId: string;
  resourceWorkspaceId: string;
}) {
  if (input.sessionWorkspaceId !== input.resourceWorkspaceId) {
    throw new Error("Workspace access denied");
  }
}
