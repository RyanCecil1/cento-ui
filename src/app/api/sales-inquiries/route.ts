import { NextResponse } from "next/server";
import { z } from "zod";

import { highestPublishedCreditBundle } from "@/data/site";
import { createSalesInquiry } from "@/lib/sales/repository";

const SalesInquirySchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phoneNumber: z.string().trim().min(8),
  organizationName: z.string().trim().min(2),
  roleTitle: z.string().trim().min(2),
  requestedCredits: z.coerce.number().int().positive(),
  reason: z.string().trim().min(12),
});

export async function POST(request: Request) {
  const payload = SalesInquirySchema.parse(await request.json());
  const exceedsPricingLimit = payload.requestedCredits > highestPublishedCreditBundle;
  const inquiry = await createSalesInquiry({
    ...payload,
    exceedsPricingLimit,
    pricingLimitReference: highestPublishedCreditBundle,
  });

  return NextResponse.json(
    {
      success: true,
      inquiryId: inquiry.id,
      exceedsPricingLimit,
      pricingLimitReference: highestPublishedCreditBundle,
      message: exceedsPricingLimit
        ? `Submitted. This request is above the published ${highestPublishedCreditBundle.toLocaleString()} credit bundle, so it will be treated as a custom volume inquiry.`
        : "Submitted. Sales can review this request against the published credit bundles and follow up.",
    },
    { status: 201 },
  );
}
