import type { Icon } from "@phosphor-icons/react";
import {
  BellRinging,
  ChartLineUp,
  CheckCircle,
  ClockCounterClockwise,
  CreditCard,
  Database,
  EnvelopeSimple,
  Funnel,
  GearSix,
  MagicWand,
  MegaphoneSimple,
  PaperPlaneTilt,
  PlugsConnected,
  ShieldCheck,
  Sparkle,
  StackPlus,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";

export type NavItem = {
  label: string;
  href: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: Icon;
  proof: string;
};

export type Metric = {
  value: string;
  label: string;
  detail: string;
};

export type PricingTier = {
  name: string;
  price: string;
  credits: string;
  description: string;
  featured?: boolean;
  cta: string;
  perks: string[];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type AppNavGroup = {
  title: string;
  items: Array<NavItem & { icon: Icon }>;
};

export const marketingNav: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Industries", href: "/industries" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const appNavGroups: AppNavGroup[] = [
  {
    title: "Command",
    items: [
      { label: "Overview", href: "/app", icon: ChartLineUp },
      { label: "Campaigns", href: "/app/campaigns", icon: MegaphoneSimple },
      { label: "Create Campaign", href: "/app/campaigns/new", icon: PaperPlaneTilt },
      { label: "Contacts", href: "/app/contacts", icon: UsersThree },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Wallet", href: "/app/wallet", icon: Wallet },
      { label: "Reports", href: "/app/reports", icon: Database },
      { label: "AI Writer", href: "/app/ai-writer", icon: MagicWand },
      { label: "Sender IDs", href: "/app/sender-ids", icon: ShieldCheck },
      { label: "Settings", href: "/app/settings", icon: GearSix },
    ],
  },
];

export const homepageMetrics: Metric[] = [
  {
    value: "12,420",
    label: "available credits",
    detail: "Visible before every campaign is sent or scheduled",
  },
  {
    value: "94.8%",
    label: "delivery visibility",
    detail: "Plain-language reporting across delivered, failed, and pending messages",
  },
  {
    value: "5 steps",
    label: "campaign flow",
    detail: "Audience, copy, cost, schedule, and final review in sequence",
  },
];

export const featureCards: Feature[] = [
  {
    title: "Guided campaign creation",
    description:
      "A structured builder keeps sender ID, audience, copy, cost, and schedule visible before launch.",
    icon: StackPlus,
    proof: "Prevents accidental sends and unclear deductions.",
  },
  {
    title: "Contact import and cleanup",
    description:
      "Contacts can be uploaded, pasted, grouped, and reviewed for formatting issues before a campaign uses them.",
    icon: UsersThree,
    proof: "Ready for Ghana number normalization later.",
  },
  {
    title: "Wallet clarity",
    description:
      "Credit balance, top-ups, campaign deductions, and review holds live in one traceable ledger surface.",
    icon: CreditCard,
    proof: "Users can see what changed and why.",
  },
  {
    title: "Delivery reporting",
    description:
      "Campaign reports translate technical statuses into clear outcomes: delivered, failed, pending, and needs review.",
    icon: ChartLineUp,
    proof: "Good for support, finance, and operations.",
  },
  {
    title: "AI message assist",
    description:
      "Use AI inside campaign drafting to generate options, tighten copy, reduce SMS cost, and pressure-test tone before a human approves the final send.",
    icon: MagicWand,
    proof: "Supports faster writing without turning approval into autopilot.",
  },
  {
    title: "Sender ID governance",
    description:
      "Sender IDs are requested, reviewed, approved, and kept visible so teams know what can be used.",
    icon: ShieldCheck,
    proof: "Fits the admin controls SMS products need.",
  },
];

export const workflowSteps = [
  {
    title: "Create workspace",
    detail: "Set the sender, audience, and campaign context once so every send starts sharper.",
    icon: PlugsConnected,
  },
  {
    title: "Prepare contacts",
    detail: "Clean the list, group the audience, and protect deliverability before the blast goes out.",
    icon: Database,
  },
  {
    title: "Launch campaign",
    detail: "Tighten the copy, preview the credit cost, and launch now or schedule for the right window.",
    icon: PaperPlaneTilt,
  },
  {
    title: "Track outcomes",
    detail: "Read delivery results fast, spot failed numbers, and plan the next follow-up with confidence.",
    icon: ChartLineUp,
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "GHS 150",
    credits: "2,500 SMS credits",
    description: "For smaller organizations sending notices and reminders.",
    cta: "Start with Starter",
    perks: ["Shared sender ID option", "Basic reports", "Contact groups", "AI rewrite tools"],
  },
  {
    name: "Growth",
    price: "GHS 420",
    credits: "8,000 SMS credits",
    description: "For schools, churches, and SMEs sending regularly.",
    featured: true,
    cta: "Start Free Trial",
    perks: [
      "Custom sender request flow",
      "Scheduled campaigns",
      "Cost preview",
      "Priority support path",
      "Wallet history",
    ],
  },
  {
    name: "Scale",
    price: "GHS 920",
    credits: "18,000 SMS credits",
    description: "For teams running larger campaign calendars.",
    cta: "Talk to Sales",
    perks: ["High-volume campaign review", "Advanced reporting", "Admin review states", "Operational ledger"],
  },
];

export const highestPublishedCreditBundle = 18_000;

export const pricingComparison = [
  { feature: "Send-now campaigns", starter: "Yes", growth: "Yes", scale: "Yes" },
  { feature: "Scheduled campaigns", starter: "Limited", growth: "Yes", scale: "Yes" },
  { feature: "Contact groups", starter: "3 groups", growth: "25 groups", scale: "Unlimited" },
  { feature: "Sender ID requests", starter: "Shared only", growth: "Custom request", scale: "Priority review" },
  { feature: "Delivery reports", starter: "Summary", growth: "Detailed", scale: "Detailed + export-ready" },
  { feature: "AI message tools", starter: "Rewrite", growth: "Rewrite + shorten", scale: "Full assist suite" },
  { feature: "Support", starter: "Email", growth: "Priority email", scale: "Priority + WhatsApp" },
];

export const industries = [
  {
    name: "Churches",
    detail: "Service reminders, department updates, event notices, and member follow-ups.",
  },
  {
    name: "Schools",
    detail: "PTA notices, fee reminders, schedule changes, and urgent parent communication.",
  },
  {
    name: "SMEs",
    detail: "Customer promotions, appointment reminders, loyalty lists, and operations alerts.",
  },
  {
    name: "NGOs",
    detail: "Volunteer coordination, community outreach, and campaign mobilization.",
  },
];

export const faqs: FAQItem[] = [
  {
    question: "Is this connected to a live SMS gateway?",
    answer:
      "Gateway routing is environment-driven. Cento keeps sender approval, wallet deductions, and campaign execution inside the same authenticated flow so teams can move from setup to live sending cleanly.",
  },
  {
    question: "Why does signup ask for sender and audience context?",
    answer:
      "Cento uses the organization and campaign context collected at signup to keep sender posture, audience setup, and review expectations aligned from the first session.",
  },
  {
    question: "Can the wallet logic be connected later?",
    answer:
      "The wallet is already modeled as a ledger. Top-ups, campaign deductions, and adjustments are recorded as explicit entries so finance and operations can audit what changed.",
  },
  {
    question: "Will AI send messages automatically?",
    answer:
      "No. AI is assistive only. It can suggest, rewrite, shorten, and check risk, but the user must approve before sending.",
  },
  {
    question: "Does the design support Ghana phone numbers?",
    answer:
      "Yes. Contacts are stored with status, suppression, and source context so Ghana-focused cleanup and routing rules can be enforced without breaking the campaign flow.",
  },
];

export const dashboardStats = [
  {
    label: "Credits",
    value: "12,420",
    helper: "Enough for the scheduled queue",
  },
  {
    label: "Sent this month",
    value: "47,280",
    helper: "Across 9 campaigns",
  },
  {
    label: "Delivery rate",
    value: "94.8%",
    helper: "6.1% failed or pending",
  },
  {
    label: "Sender IDs",
    value: "2 active",
    helper: "1 request in review",
  },
];

export const recentCampaigns = [
  {
    name: "Midweek service reminder",
    audience: "Church members",
    status: "Delivered",
    sentAt: "Today, 10:12",
    recipients: "2,480",
    delivered: "2,382",
    failed: "98",
    cost: "2,480 cr",
  },
  {
    name: "PTA meeting notice",
    audience: "Parents list",
    status: "Pending",
    sentAt: "Today, 14:30",
    recipients: "1,120",
    delivered: "806",
    failed: "34",
    cost: "1,120 cr",
  },
  {
    name: "Customer promo blast",
    audience: "Loyalty segment",
    status: "Needs review",
    sentAt: "Tomorrow, 08:00",
    recipients: "4,850",
    delivered: "0",
    failed: "Review",
    cost: "9,700 cr",
  },
];

export const walletTransactions = [
  {
    label: "Top-up via Paystack",
    amount: "+8,000 cr",
    meta: "GHS 420 • Today",
  },
  {
    label: "Campaign deduction",
    amount: "-2,480 cr",
    meta: "Midweek service reminder",
  },
  {
    label: "Sender review hold",
    amount: "Pending",
    meta: "CENTOCARE request",
  },
];

export const contactsPreview = [
  {
    name: "Ama Nkrumah",
    phone: "+233 24 836 1973",
    group: "Parents",
    status: "Valid",
  },
  {
    name: "Kojo Adjei",
    phone: "024 194 0027",
    group: "Church members",
    status: "Needs format",
  },
  {
    name: "Nyarko Foods",
    phone: "+233 55 428 1738",
    group: "Loyalty segment",
    status: "Duplicate",
  },
];

export const senderIdPreview = [
  {
    name: "GRACEHUB",
    status: "Approved",
    note: "Ready for campaigns",
  },
  {
    name: "CENTOCARE",
    status: "In review",
    note: "Documents pending admin approval",
  },
  {
    name: "SCHOOLINK",
    status: "Draft",
    note: "Not submitted yet",
  },
];

export const reportHighlights = [
  {
    label: "Delivered",
    value: "44,815",
    helper: "Last 30 days",
  },
  {
    label: "Failed numbers",
    value: "312",
    helper: "Ready for cleanup",
  },
  {
    label: "Average unit cost",
    value: "1.3x",
    helper: "Long copy increased usage",
  },
];

export const aiSuggestions = [
  "Rewrite this reminder to fit one SMS unit without losing the call to action.",
  "Turn this announcement into a warmer version for parents or guardians.",
  "Generate three concise variants for a church, school, or SME audience.",
  "Check whether the wording sounds risky, unclear, or too promotional.",
];

export const quickActions = [
  {
    title: "Create campaign",
    detail: "Build a send or schedule a reminder.",
    icon: PaperPlaneTilt,
    href: "/app/campaigns/new",
  },
  {
    title: "Upload contacts",
    detail: "Import and review a new audience list.",
    icon: UsersThree,
    href: "/app/contacts",
  },
  {
    title: "Buy credits",
    detail: "Top up before the next high-volume send.",
    icon: Wallet,
    href: "/app/wallet",
  },
];

export const campaignBuilderSteps = [
  "Details",
  "Audience",
  "Compose",
  "Preview",
  "Schedule",
];

export const utilityPills = [
  { label: "Sender approvals", icon: ShieldCheck },
  { label: "Scheduled sends", icon: ClockCounterClockwise },
  { label: "Segment filters", icon: Funnel },
  { label: "Delivery alerts", icon: BellRinging },
  { label: "Email support", icon: EnvelopeSimple },
  { label: "AI assist", icon: Sparkle },
  { label: "Safe previews", icon: CheckCircle },
];
