export type Connection = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Contact = {
  id: string;
  ownerId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type MessageStatus = "scheduled" | "sent";

export type BroadcastMessage = {
  id: string;
  ownerId: string;
  connectionId: string;
  content: string;
  contactIds: string[];
  status: MessageStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type MessageFilter = "all" | MessageStatus;
