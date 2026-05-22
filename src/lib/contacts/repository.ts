import "server-only";

import { createDemoId, getDemoStore, type DemoContact, type DemoContactGroup } from "@/lib/demo/store";
import { resolveAudience } from "./filters";

type ContactFilter = {
  field: "tag" | "status" | "source";
  operator: "in";
  value: string;
};

export type WorkspaceContactView = DemoContact & {
  groupIds: string[];
  groupNames: string[];
};

export async function listWorkspaceContacts(workspaceId: string) {
  return getDemoStore().contacts.filter((contact) => contact.workspaceId === workspaceId);
}

export async function listContactGroups(workspaceId: string) {
  return getDemoStore().contactGroups.filter((group) => group.workspaceId === workspaceId);
}

export async function listWorkspaceContactsWithGroups(workspaceId: string): Promise<WorkspaceContactView[]> {
  const store = getDemoStore();
  const groupsById = new Map(
    store.contactGroups
      .filter((group) => group.workspaceId === workspaceId)
      .map((group) => [group.id, group] as const),
  );

  return store.contacts
    .filter((contact) => contact.workspaceId === workspaceId)
    .map((contact) => {
      const groupIds = store.contactGroupMemberships
        .filter((membership) => membership.workspaceId === workspaceId && membership.contactId === contact.id)
        .map((membership) => membership.groupId);

      return {
        ...contact,
        groupIds,
        groupNames: groupIds
          .map((groupId) => groupsById.get(groupId)?.name)
          .filter((value): value is string => Boolean(value)),
      };
    });
}

export async function listContactGroupsWithCounts(workspaceId: string) {
  const store = getDemoStore();
  const counts = new Map<string, number>();

  store.contactGroupMemberships.forEach((membership) => {
    if (membership.workspaceId !== workspaceId) return;
    counts.set(membership.groupId, (counts.get(membership.groupId) ?? 0) + 1);
  });

  return store.contactGroups
    .filter((group) => group.workspaceId === workspaceId)
    .map((group) => ({
      ...group,
      memberCount: counts.get(group.id) ?? 0,
    }));
}

export async function getContactQualitySummary(workspaceId: string) {
  const contacts = await listWorkspaceContacts(workspaceId);
  const result = resolveAudience(
    contacts.map((contact) => ({
      id: contact.id,
      phoneE164: contact.phoneE164,
      isSuppressed: contact.isSuppressed,
      isDuplicate: contact.status === "duplicate",
      isValid: contact.status !== "invalid",
    })),
  );

  return result.summary;
}

export async function createContactGroup(workspaceId: string, input: { name: string; description?: string }) {
  const store = getDemoStore();
  const group: DemoContactGroup = {
    id: createDemoId("group"),
    workspaceId,
    name: input.name,
    description: input.description ?? "",
  };
  store.contactGroups.unshift(group);
  return group;
}

export async function createContact(workspaceId: string, input: {
  fullName: string;
  phoneE164: string;
  source?: string;
  tags?: string[];
  groupIds?: string[];
}) {
  const store = getDemoStore();
  const [firstName = input.fullName, ...rest] = input.fullName.split(" ");
  const contact: DemoContact = {
    id: createDemoId("contact"),
    workspaceId,
    phoneE164: input.phoneE164,
    fullName: input.fullName,
    firstName,
    lastName: rest.join(" "),
    source: input.source ?? "manual",
    status: "active",
    tags: input.tags ?? [],
    normalizationState: "normalized",
    isSuppressed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.contacts.unshift(contact);

  for (const groupId of input.groupIds ?? []) {
    store.contactGroupMemberships.push({ workspaceId, groupId, contactId: contact.id });
  }

  return contact;
}

export async function upsertSuppression(workspaceId: string, input: {
  contactId?: string | null;
  phoneE164: string;
  reason: string;
}) {
  const store = getDemoStore();
  const suppression = {
    id: createDemoId("suppression"),
    workspaceId,
    contactId: input.contactId ?? null,
    phoneE164: input.phoneE164,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };
  store.suppressions.unshift(suppression);
  if (input.contactId) {
    const contact = store.contacts.find((item) => item.id === input.contactId && item.workspaceId === workspaceId);
    if (contact) {
      contact.isSuppressed = true;
      contact.updatedAt = new Date().toISOString();
    }
  }
  return suppression;
}

export async function resolveWorkspaceAudience(workspaceId: string, input: {
  groupIds: string[];
  filters: ContactFilter[];
}) {
  const store = getDemoStore();
  const contacts = store.contacts.filter((contact) => contact.workspaceId === workspaceId);
  const membershipContactIds = new Set(
    store.contactGroupMemberships
      .filter((membership) => membership.workspaceId === workspaceId && input.groupIds.includes(membership.groupId))
      .map((membership) => membership.contactId),
  );

  const filtered = contacts.filter((contact) => {
    const groupMatch = input.groupIds.length === 0 || membershipContactIds.has(contact.id);
    const filterMatch = input.filters.every((filter) => {
      if (filter.field === "tag") return contact.tags.includes(filter.value);
      if (filter.field === "status") return contact.status === filter.value;
      return contact.source === filter.value;
    });

    return groupMatch && filterMatch;
  });

  const audience = resolveAudience(
    filtered.map((contact) => ({
      id: contact.id,
      phoneE164: contact.phoneE164,
      isSuppressed: contact.isSuppressed,
      isDuplicate: contact.status === "duplicate",
      isValid: contact.status !== "invalid",
    })),
  );

  return {
    contacts: filtered,
    deliverable: audience.deliverable,
    summary: audience.summary,
  };
}
