import type { MessageFilter, MessageStatus } from "../types";

export const getInitialMessageStatus = (
  scheduledAt: Date | null,
  now = new Date()
): MessageStatus => {
  if (!scheduledAt || scheduledAt.getTime() <= now.getTime()) {
    return "sent";
  }

  return "scheduled";
};

export const matchesMessageFilter = (
  status: MessageStatus,
  filter: MessageFilter
) => filter === "all" || status === filter;
