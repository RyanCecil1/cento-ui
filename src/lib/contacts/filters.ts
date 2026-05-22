export type ContactCandidate = {
  id: string;
  phoneE164: string;
  isSuppressed: boolean;
  isDuplicate: boolean;
  isValid: boolean;
};

export function resolveAudience(candidates: ContactCandidate[]) {
  const summary = { deliverable: 0, duplicates: 0, suppressed: 0, invalid: 0 };

  const deliverable = candidates.filter((candidate) => {
    if (!candidate.isValid) {
      summary.invalid += 1;
      return false;
    }
    if (candidate.isDuplicate) {
      summary.duplicates += 1;
      return false;
    }
    if (candidate.isSuppressed) {
      summary.suppressed += 1;
      return false;
    }
    summary.deliverable += 1;
    return true;
  });

  return { deliverable, summary };
}

