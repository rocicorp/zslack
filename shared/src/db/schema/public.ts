import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)]
);

export const userRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

export const messages = pgTable("message", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  senderID: text("sender_id")
    .references(() => users.id)
    .notNull(),
  channelID: text("channel_id")
    .references(() => channels.id)
    .notNull(),
  body: text("body"),
});

export const messageRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderID],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [messages.channelID],
    references: [channels.id],
  }),
}));

export const channels = pgTable("channel", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  name: text("name"),
});

export const channelRelations = relations(channels, ({ many }) => ({
  messages: many(messages),
}));
