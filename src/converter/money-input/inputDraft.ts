import { type formatAmountDraft } from "./amountDraft";

export type InputDraft = ReturnType<typeof formatAmountDraft> & {
  revision: number;
};

/** Discards an invalid draft after a successful edit, even when the numeric result is unchanged. */
export function getCurrentInputDraft({
  draft,
  inputRevision,
}: {
  draft: InputDraft | null;
  inputRevision: number;
}): InputDraft | null {
  if (draft?.amount === null && draft.revision !== inputRevision) {
    return null;
  }

  return draft;
}
