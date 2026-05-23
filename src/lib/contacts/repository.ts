import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAudience } from "./filters";

type ContactFilter = {
  field: "tag" | "status" | "source";
  operator: "in";
  value: string;
};

type ContactRow = {
  id: string;
  workspace_id: string;
  phone_e164: string;
  full_name: string;
  first_name: string;
  last_name: string;
  source: string;
  status: "active" | "inactive" | "invalid" | "duplicate";
  tags: string[];
  normalization_state: "normalized" | "invalid" | "duplicate" | "pending";
  is_suppressed: boolean;
  created_at: string;
  updated_at: string;
};

type ContactGroupRow = {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type ContactMembershipRow = {
  workspace_id?: string;
  group_id: string;
  contact_id: string;
};

export type WorkspaceContactView = ReturnType<typeof toContactView> & {
  groupIds: string[];
  groupNames: string[];
};

function toContactView(row: ContactRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    phoneE164: row.phone_e164,
    fullName: row.full_name,
    firstName: row.first_name,
    lastName: row.last_name,
    source: row.source,
    status: row.status,
    tags: row.tags ?? [],
    normalizationState: row.normalization_state,
    isSuppressed: row.is_suppressed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toGroupView(row: ContactGroupRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function splitContactName(fullName: string) {
  const [firstName = fullName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export async function listWorkspaceContacts(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list contacts");
  }

  return (data satisfies ContactRow[]).map(toContactView);
}

export async function listContactGroups(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_groups")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list contact groups");
  }

  return (data satisfies ContactGroupRow[]).map(toGroupView);
}

export async function listWorkspaceContactsWithGroups(workspaceId: string): Promise<WorkspaceContactView[]> {
  const supabase = createServerSupabaseClient();
  const [contactsResult, groupsResult, membershipsResult] = await Promise.all([
    supabase.from("contacts").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("contact_groups").select("*").eq("workspace_id", workspaceId),
    supabase
      .from("contact_group_memberships")
      .select("group_id, contact_id")
      .eq("workspace_id", workspaceId),
  ]);

  if (contactsResult.error || groupsResult.error || membershipsResult.error) {
    throw new Error("Unable to load contacts");
  }

  const groupsById = new Map(
    ((groupsResult.data ?? []) as ContactGroupRow[]).map((group) => [group.id, group.name] as const),
  );
  const memberships = (membershipsResult.data ?? []) as ContactMembershipRow[];

  return ((contactsResult.data ?? []) as ContactRow[]).map((contact) => {
    const groupIds = memberships
      .filter((membership) => membership.contact_id === contact.id)
      .map((membership) => membership.group_id);

    return {
      ...toContactView(contact),
      groupIds,
      groupNames: groupIds
        .map((groupId) => groupsById.get(groupId))
        .filter((value): value is string => Boolean(value)),
    };
  });
}

export async function listContactGroupsWithCounts(workspaceId: string) {
  const [groups, contacts] = await Promise.all([
    listContactGroups(workspaceId),
    listWorkspaceContactsWithGroups(workspaceId),
  ]);

  const counts = new Map<string, number>();
  for (const contact of contacts) {
    for (const groupId of contact.groupIds) {
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
    }
  }

  return groups.map((group) => ({
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
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_groups")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      description: input.description ?? "",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create contact group");
  }

  return toGroupView(data as ContactGroupRow);
}

export async function createContact(workspaceId: string, input: {
  fullName: string;
  phoneE164: string;
  source?: string;
  tags?: string[];
  groupIds?: string[];
}) {
  const supabase = createServerSupabaseClient();
  const { firstName, lastName } = splitContactName(input.fullName);
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      workspace_id: workspaceId,
      phone_e164: input.phoneE164,
      full_name: input.fullName,
      first_name: firstName,
      last_name: lastName,
      source: input.source ?? "manual",
      status: "active",
      tags: input.tags ?? [],
      normalization_state: "normalized",
      is_suppressed: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create contact");
  }

  if (input.groupIds?.length) {
    const { error: membershipError } = await supabase.from("contact_group_memberships").insert(
      input.groupIds.map((groupId) => ({
        workspace_id: workspaceId,
        group_id: groupId,
        contact_id: data.id,
      })),
    );

    if (membershipError) {
      throw new Error("Unable to attach contact groups");
    }
  }

  return toContactView(data as ContactRow);
}

export async function updateContactGroups(
  workspaceId: string,
  contactId: string,
  groupIds: string[],
) {
  const supabase = createServerSupabaseClient();

  const { error: deleteError } = await supabase
    .from("contact_group_memberships")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("contact_id", contactId);

  if (deleteError) {
    throw new Error("Unable to clear contact groups");
  }

  if (groupIds.length > 0) {
    const uniqueGroupIds = [...new Set(groupIds)];
    const { error: insertError } = await supabase
      .from("contact_group_memberships")
      .insert(
        uniqueGroupIds.map((groupId) => ({
          workspace_id: workspaceId,
          group_id: groupId,
          contact_id: contactId,
        })),
      );

    if (insertError) {
      throw new Error("Unable to update contact groups");
    }
  }

  return true;
}

export async function updateContact(
  workspaceId: string,
  contactId: string,
  input: {
    fullName?: string;
    phoneE164?: string;
    source?: string;
    tags?: string[];
    groupIds?: string[];
  },
) {
  const supabase = createServerSupabaseClient();
  const updatePayload: Record<string, unknown> = {};

  if (typeof input.fullName === "string") {
    const { firstName, lastName } = splitContactName(input.fullName);
    updatePayload.full_name = input.fullName;
    updatePayload.first_name = firstName;
    updatePayload.last_name = lastName;
  }

  if (typeof input.phoneE164 === "string") {
    updatePayload.phone_e164 = input.phoneE164;
    updatePayload.status = "active";
    updatePayload.normalization_state = "normalized";
  }

  if (typeof input.source === "string") {
    updatePayload.source = input.source;
  }

  if (Array.isArray(input.tags)) {
    updatePayload.tags = input.tags;
  }

  const { data, error } = await supabase
    .from("contacts")
    .update(updatePayload)
    .eq("workspace_id", workspaceId)
    .eq("id", contactId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Unable to update contact");
  }

  if (input.groupIds) {
    await updateContactGroups(workspaceId, contactId, input.groupIds);
  }

  return toContactView(data as ContactRow);
}

export async function deleteContact(workspaceId: string, contactId: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", contactId);

  if (error) {
    throw new Error("Unable to delete contact");
  }

  return true;
}

export async function importContactsBatch(
  workspaceId: string,
  input: {
    contacts: Array<{
      fullName: string;
      phoneE164: string;
      source?: string;
      tags?: string[];
      groupNames?: string[];
    }>;
    groupIds?: string[];
  },
) {
  const supabase = createServerSupabaseClient();
  const existingGroups = await listContactGroups(workspaceId);
  const groupIdByName = new Map(
    existingGroups.map((group) => [group.name.toLowerCase(), group.id] as const),
  );
  const uniqueGroupNames = [...new Set(
    input.contacts.flatMap((contact) =>
      (contact.groupNames ?? [])
        .map((groupName) => groupName.trim())
        .filter(Boolean),
    ),
  )];

  let groupsCreated = 0;
  for (const groupName of uniqueGroupNames) {
    if (!groupIdByName.has(groupName.toLowerCase())) {
      const group = await createContactGroup(workspaceId, {
        name: groupName,
        description: "Created during contact import.",
      });
      groupIdByName.set(group.name.toLowerCase(), group.id);
      groupsCreated += 1;
    }
  }

  const rows = input.contacts.map((contact) => {
    const { firstName, lastName } = splitContactName(contact.fullName);

    return {
      workspace_id: workspaceId,
      phone_e164: contact.phoneE164,
      full_name: contact.fullName,
      first_name: firstName,
      last_name: lastName,
      source: contact.source ?? "upload",
      status: "active",
      tags: contact.tags ?? [],
      normalization_state: "normalized",
      is_suppressed: false,
    };
  });

  const { data, error } = await supabase
    .from("contacts")
    .upsert(rows, { onConflict: "workspace_id,phone_e164" })
    .select("*");

  if (error) {
    throw new Error("Unable to import contacts");
  }

  const selectedGroupIds = [...new Set(input.groupIds ?? [])];
  const contactsByPhone = new Map(
    ((data ?? []) as ContactRow[]).map((row) => [row.phone_e164, row.id] as const),
  );

  const memberships = input.contacts.flatMap((contact) => {
    const contactId = contactsByPhone.get(contact.phoneE164);
    if (!contactId) {
      return [];
    }

    const dynamicGroupIds = (contact.groupNames ?? [])
      .map((groupName) => groupIdByName.get(groupName.trim().toLowerCase()))
      .filter((groupId): groupId is string => Boolean(groupId));

    return [...new Set([...selectedGroupIds, ...dynamicGroupIds])].map((groupId) => ({
      workspace_id: workspaceId,
      group_id: groupId,
      contact_id: contactId,
    }));
  });

  if (memberships.length > 0) {
    const { error: membershipError } = await supabase
      .from("contact_group_memberships")
      .upsert(memberships, { onConflict: "group_id,contact_id" });

    if (membershipError) {
      throw new Error("Unable to assign imported contact groups");
    }
  }

  return {
    importedCount: rows.length,
    groupsCreated,
  };
}

export async function upsertSuppression(workspaceId: string, input: {
  contactId?: string | null;
  phoneE164: string;
  reason: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_suppressions")
    .upsert({
      workspace_id: workspaceId,
      contact_id: input.contactId ?? null,
      phone_e164: input.phoneE164,
      reason: input.reason,
    }, { onConflict: "workspace_id,phone_e164" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to save suppression");
  }

  return data;
}

export async function resolveWorkspaceAudience(workspaceId: string, input: {
  groupIds: string[];
  filters: ContactFilter[];
}) {
  const contacts = await listWorkspaceContactsWithGroups(workspaceId);
  const filtered = contacts.filter((contact) => {
    const groupMatch =
      input.groupIds.length === 0 ||
      input.groupIds.some((groupId) => contact.groupIds.includes(groupId));

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
    deliverable: filtered.filter((contact) =>
      audience.deliverable.some((candidate) => candidate.id === contact.id),
    ),
    summary: audience.summary,
  };
}
