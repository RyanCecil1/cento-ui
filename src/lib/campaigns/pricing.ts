export function getMessageUnits(message: string) {
  const length = message.trim().length;
  if (length === 0) return 0;
  return Math.max(1, Math.ceil(length / 160));
}

export function estimateCampaignCredits(recipientCount: number, message: string) {
  const unitsPerRecipient = getMessageUnits(message);
  return {
    unitsPerRecipient,
    totalCredits: recipientCount * unitsPerRecipient,
  };
}

