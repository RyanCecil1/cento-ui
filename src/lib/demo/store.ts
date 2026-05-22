import "server-only";

type VerificationStatus = "pending" | "verified" | "rejected";
type SenderStatus = "approved" | "in_review" | "draft" | "rejected";
type ContactStatus = "active" | "inactive" | "invalid" | "duplicate";
type CampaignState =
  | "draft"
  | "queued"
  | "paused"
  | "rechecking"
  | "sending"
  | "needs_attention"
  | "completed"
  | "completed_with_failures"
  | "canceled";

export type DemoUser = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
};

export type DemoWorkspace = {
  id: string;
  ownerUserId: string;
  name: string;
  timezone: string;
  verificationStatus: VerificationStatus;
  primaryAudience: string;
  useCase: string;
  senderMode: "shared" | "branded";
};

export type DemoSession = {
  token: string;
  userId: string;
  createdAt: string;
};

export type DemoContact = {
  id: string;
  workspaceId: string;
  phoneE164: string;
  fullName: string;
  firstName: string;
  lastName: string;
  source: string;
  status: ContactStatus;
  tags: string[];
  normalizationState: "normalized" | "invalid" | "duplicate" | "pending";
  isSuppressed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DemoContactGroup = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
};

export type DemoContactGroupMembership = {
  workspaceId: string;
  groupId: string;
  contactId: string;
};

export type DemoSuppression = {
  id: string;
  workspaceId: string;
  contactId: string | null;
  phoneE164: string;
  reason: string;
  createdAt: string;
};

export type DemoTemplate = {
  id: string;
  workspaceId: string;
  name: string;
  body: string;
  source: "starter" | "custom";
  variables: string[];
  fallbackFirstName: string;
  fallbackLastName: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoSenderId = {
  id: string;
  workspaceId: string;
  name: string;
  status: SenderStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoWalletEntry = {
  id: string;
  workspaceId: string;
  direction: "credit" | "debit";
  units: number;
  reason: string;
  meta: string;
  campaignId?: string;
  createdAt: string;
};

export type DemoTopUpOrder = {
  id: string;
  workspaceId: string;
  creditsPurchased: number;
  amountGhs: number;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
};

export type DemoPaymentEvent = {
  eventId: string;
  topUpOrderId: string;
  status: "confirmed" | "ignored";
  createdAt: string;
};

export type DemoCampaign = {
  id: string;
  workspaceId: string;
  name: string;
  state: CampaignState;
  senderId: string;
  message: string;
  templateId: string | null;
  scheduleAt: string | null;
  audienceFilterSummary: string;
  personalizationDefaults: {
    firstName: string;
    lastName: string;
  };
  audienceFilters: Array<{ field: "tag" | "status" | "source"; operator: "in"; value: string }>;
  failureReason: string | null;
  estimatedRecipients: number;
  estimatedCredits: number;
  actualRecipients: number;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
};

export type DemoCampaignAudienceGroup = {
  workspaceId: string;
  campaignId: string;
  groupId: string;
};

export type DemoCampaignJob = {
  id: string;
  workspaceId: string;
  campaignId: string;
  state: "queued" | "running" | "completed" | "failed" | "canceled";
  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
};

export type DemoCampaignRun = {
  id: string;
  workspaceId: string;
  campaignId: string;
  jobId: string;
  senderId: string;
  renderedMessage: string;
  recipientCount: number;
  totalUnits: number;
  creditsUsed: number;
  createdAt: string;
};

export type DemoMessageAttempt = {
  id: string;
  workspaceId: string;
  campaignId: string;
  runId: string;
  contactId: string;
  phoneE164: string;
  status: "queued" | "sent" | "failed" | "skipped";
  providerMessageId: string | null;
  failureReason: string | null;
  createdAt: string;
};

export type DemoActivityLog = {
  id: string;
  workspaceId: string;
  actorUserId: string;
  action: string;
  entityId: string | null;
  createdAt: string;
};

export type DemoStore = {
  users: DemoUser[];
  workspaces: DemoWorkspace[];
  sessions: DemoSession[];
  contacts: DemoContact[];
  contactGroups: DemoContactGroup[];
  contactGroupMemberships: DemoContactGroupMembership[];
  suppressions: DemoSuppression[];
  templates: DemoTemplate[];
  senderIds: DemoSenderId[];
  walletEntries: DemoWalletEntry[];
  topUpOrders: DemoTopUpOrder[];
  paymentEvents: DemoPaymentEvent[];
  campaigns: DemoCampaign[];
  campaignAudienceGroups: DemoCampaignAudienceGroup[];
  campaignJobs: DemoCampaignJob[];
  campaignRuns: DemoCampaignRun[];
  messageAttempts: DemoMessageAttempt[];
  activityLogs: DemoActivityLog[];
};

const STORE_KEY = "__cento_demo_store__";

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function seedStore(): DemoStore {
  const userId = "user_demo_owner";
  const workspaceId = "workspace_demo";
  const churchGroupId = "group_church";
  const parentsGroupId = "group_parents";
  const loyaltyGroupId = "group_loyalty";
  const senderApprovedId = "sender_gracehub";
  const senderReviewId = "sender_centocare";
  const templateReminderId = "template_reminder";
  const contactAmaId = "contact_ama";
  const contactKojoId = "contact_kojo";
  const contactNyarkoId = "contact_nyarko";
  const campaignOneId = "campaign_midweek";
  const campaignTwoId = "campaign_pta";
  const campaignThreeId = "campaign_promo";

  return {
    users: [
      {
        id: userId,
        email: "operator@cento.local",
        password: "Password123456",
        fullName: "Cento Operator",
        phoneNumber: "+233240000000",
      },
    ],
    workspaces: [
      {
        id: workspaceId,
        ownerUserId: userId,
        name: "GraceHub Communications",
        timezone: "Africa/Accra",
        verificationStatus: "verified",
        primaryAudience: "Church members",
        useCase: "Member announcements and reminders",
        senderMode: "shared",
      },
    ],
    sessions: [],
    contacts: [
      {
        id: contactAmaId,
        workspaceId,
        phoneE164: "+233248361973",
        fullName: "Ama Nkrumah",
        firstName: "Ama",
        lastName: "Nkrumah",
        source: "import",
        status: "active",
        tags: ["parents"],
        normalizationState: "normalized",
        isSuppressed: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: contactKojoId,
        workspaceId,
        phoneE164: "+233241940027",
        fullName: "Kojo Adjei",
        firstName: "Kojo",
        lastName: "Adjei",
        source: "import",
        status: "invalid",
        tags: ["church-members"],
        normalizationState: "invalid",
        isSuppressed: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: contactNyarkoId,
        workspaceId,
        phoneE164: "+233554281738",
        fullName: "Nyarko Foods",
        firstName: "Nyarko",
        lastName: "Foods",
        source: "import",
        status: "duplicate",
        tags: ["loyalty"],
        normalizationState: "duplicate",
        isSuppressed: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    contactGroups: [
      { id: churchGroupId, workspaceId, name: "Church members", description: "Members list" },
      { id: parentsGroupId, workspaceId, name: "Parents", description: "Parents list" },
      { id: loyaltyGroupId, workspaceId, name: "Loyalty segment", description: "Customers" },
    ],
    contactGroupMemberships: [
      { workspaceId, groupId: parentsGroupId, contactId: contactAmaId },
      { workspaceId, groupId: churchGroupId, contactId: contactKojoId },
      { workspaceId, groupId: loyaltyGroupId, contactId: contactNyarkoId },
    ],
    suppressions: [],
    templates: [
      {
        id: templateReminderId,
        workspaceId,
        name: "Service Reminder",
        body: "Hello {first_name}, this is a reminder that our Sunday service starts at 8:30 AM tomorrow.",
        source: "starter",
        variables: ["first_name"],
        fallbackFirstName: "Member",
        fallbackLastName: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    senderIds: [
      {
        id: senderApprovedId,
        workspaceId,
        name: "GRACEHUB",
        status: "approved",
        note: "Ready for campaigns",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: senderReviewId,
        workspaceId,
        name: "CENTOCARE",
        status: "in_review",
        note: "Documents pending admin approval",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    walletEntries: [
      {
        id: createId("wallet"),
        workspaceId,
        direction: "credit",
        units: 8000,
        reason: "Top-up via Paystack",
        meta: "GHS 420 • Today",
        createdAt: nowIso(),
      },
      {
        id: createId("wallet"),
        workspaceId,
        direction: "credit",
        units: 6900,
        reason: "Opening balance",
        meta: "Seeded demo data",
        createdAt: nowIso(),
      },
      {
        id: createId("wallet"),
        workspaceId,
        direction: "debit",
        units: 2480,
        reason: "Campaign deduction",
        meta: "Midweek service reminder",
        campaignId: campaignOneId,
        createdAt: nowIso(),
      },
    ],
    topUpOrders: [],
    paymentEvents: [],
    campaigns: [
      {
        id: campaignOneId,
        workspaceId,
        name: "Midweek service reminder",
        state: "completed",
        senderId: senderApprovedId,
        message: "Hello {first_name}, remember the midweek service tonight at 6:30 PM.",
        templateId: templateReminderId,
        scheduleAt: null,
        audienceFilterSummary: "Church members",
        personalizationDefaults: { firstName: "Member", lastName: "" },
        audienceFilters: [],
        failureReason: null,
        estimatedRecipients: 2480,
        estimatedCredits: 2480,
        actualRecipients: 2480,
        creditsUsed: 2480,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: campaignTwoId,
        workspaceId,
        name: "PTA meeting notice",
        state: "queued",
        senderId: senderApprovedId,
        message: "Reminder: PTA meeting starts at 2:30 PM today.",
        templateId: null,
        scheduleAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        audienceFilterSummary: "Parents",
        personalizationDefaults: { firstName: "Parent", lastName: "" },
        audienceFilters: [],
        failureReason: null,
        estimatedRecipients: 1120,
        estimatedCredits: 1120,
        actualRecipients: 0,
        creditsUsed: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: campaignThreeId,
        workspaceId,
        name: "Customer promo blast",
        state: "needs_attention",
        senderId: senderReviewId,
        message: "Weekend promo: reply now to claim your loyalty offer.",
        templateId: null,
        scheduleAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        audienceFilterSummary: "Loyalty segment",
        personalizationDefaults: { firstName: "Customer", lastName: "" },
        audienceFilters: [{ field: "tag", operator: "in", value: "loyalty" }],
        failureReason: "invalid_sender",
        estimatedRecipients: 4850,
        estimatedCredits: 9700,
        actualRecipients: 0,
        creditsUsed: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    campaignAudienceGroups: [
      { workspaceId, campaignId: campaignOneId, groupId: churchGroupId },
      { workspaceId, campaignId: campaignTwoId, groupId: parentsGroupId },
      { workspaceId, campaignId: campaignThreeId, groupId: loyaltyGroupId },
    ],
    campaignJobs: [],
    campaignRuns: [],
    messageAttempts: [],
    activityLogs: [],
  };
}

export function getDemoStore() {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: DemoStore;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = seedStore();
  }

  return globalStore[STORE_KEY] as DemoStore;
}

export function createDemoId(prefix: string) {
  return createId(prefix);
}

