import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SalesInquiryInput = {
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationName: string;
  roleTitle: string;
  requestedCredits: number;
  reason: string;
  exceedsPricingLimit: boolean;
  pricingLimitReference: number;
};

export async function createSalesInquiry(input: SalesInquiryInput) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sales_inquiries")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone_number: input.phoneNumber,
      organization_name: input.organizationName,
      role_title: input.roleTitle,
      requested_credits: input.requestedCredits,
      reason: input.reason,
      exceeds_pricing_limit: input.exceedsPricingLimit,
      pricing_limit_reference: input.pricingLimitReference,
    })
    .select("id, exceeds_pricing_limit, pricing_limit_reference")
    .single();

  if (error || !data) {
    throw new Error("Unable to save sales inquiry");
  }

  return {
    id: data.id as string,
    exceedsPricingLimit: data.exceeds_pricing_limit as boolean,
    pricingLimitReference: data.pricing_limit_reference as number,
  };
}
