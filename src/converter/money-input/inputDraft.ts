import { type formatAmountEdit } from "./amountExpression";

export type InputDraft = ReturnType<typeof formatAmountEdit> & {
  revision: number;
};

/** Discards a stale expression or invalid draft after another field's valid edit. */
export function getCurrentInputDraft({
  draft,
  inputRevision,
}: {
  draft: InputDraft | null;
  inputRevision: number;
}): InputDraft | null {
  if (
    draft &&
    (draft.amount === null || draft.isExpression) &&
    draft.revision < inputRevision
  ) {
    return null;
  }

  return draft;
}
