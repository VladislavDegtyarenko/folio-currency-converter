import { type Messages } from "../i18n/messages";

export type Notice = {
  id: number;
  messageKey: keyof Messages;
  canUndo: boolean;
};
