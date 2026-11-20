/** Includes the adjacent digit when Backspace or Delete lands on an automatic group. */
export function getGroupDeletion({
  text,
  start,
  end,
  key,
  group,
}: {
  text: string;
  start: number;
  end: number;
  key: string;
  group: string;
}) {
  if (!group || start !== end) {
    return null;
  }

  if (
    key === "Backspace" &&
    text.slice(start - group.length, start) === group
  ) {
    return { start: Math.max(0, start - group.length - 1), end };
  }

  if (key === "Delete" && text.slice(start, start + group.length) === group) {
    return { start, end: Math.min(text.length, start + group.length + 1) };
  }

  return null;
}
