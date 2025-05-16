import { pgTable, text, uuid, boolean, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  mode: text("mode").default("zen"),
  onboarding_complete: boolean("onboarding_complete").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Connected tools table
export const connectedTools = pgTable("connected_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  tool_name: text("tool_name").notNull(),
  status: text("status").default("pending"),
  connected_at: timestamp("connected_at").defaultNow(),
});

// Canned responses table
export const cannedResponses = pgTable("canned_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  usage_count: integer("usage_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

// Action items table
export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  status: text("status").default("pending"),
  transcript: text("transcript"),
  due_date: timestamp("due_date"),
  source: text("source"),
  created_at: timestamp("created_at").defaultNow(),
});

// Action item outputs table
export const actionItemOutputs = pgTable("action_item_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  action_item_id: uuid("action_item_id").notNull().references(() => actionItems.id),
  output: text("output").notNull(),
  tool_used: text("tool_used").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Automations table
export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  trigger_type: text("trigger_type").notNull(),
  action: text("action").notNull(),
  tool: text("tool").notNull(),
  is_enabled: boolean("is_enabled").default(true),
  last_run: timestamp("last_run"),
  created_at: timestamp("created_at").defaultNow(),
});

// Time saved table
export const timeSaved = pgTable("time_saved", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  action_type: text("action_type").notNull(),
  minutes_saved: integer("minutes_saved").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  badge: text("badge").notNull(),
  earned_at: timestamp("earned_at").defaultNow(),
});

// User accessibility preferences table
export const accessibilityPreferences = pgTable("accessibility_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  large_text: boolean("large_text").default(false),
  dark_mode: boolean("dark_mode").default(false),
  reduce_motion: boolean("reduce_motion").default(false),
  high_contrast: boolean("high_contrast").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  mode: true,
  onboarding_complete: true,
});

export const insertConnectedToolSchema = createInsertSchema(connectedTools).pick({
  user_id: true,
  tool_name: true,
  status: true,
});

export const insertCannedResponseSchema = createInsertSchema(cannedResponses).pick({
  user_id: true,
  title: true,
  content: true,
  tags: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).pick({
  user_id: true,
  text: true,
  status: true,
  transcript: true,
  due_date: true,
  source: true,
});

export const insertActionItemOutputSchema = createInsertSchema(actionItemOutputs).pick({
  user_id: true,
  action_item_id: true,
  output: true,
  tool_used: true,
});

export const insertAutomationSchema = createInsertSchema(automations).pick({
  user_id: true,
  trigger_type: true,
  action: true,
  tool: true,
  is_enabled: true,
});

export const insertTimeSavedSchema = createInsertSchema(timeSaved).pick({
  user_id: true,
  action_type: true,
  minutes_saved: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  user_id: true,
  badge: true,
});

export const insertAccessibilityPreferenceSchema = createInsertSchema(accessibilityPreferences).pick({
  user_id: true,
  large_text: true,
  dark_mode: true,
  reduce_motion: true,
  high_contrast: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ConnectedTool = typeof connectedTools.$inferSelect;
export type InsertConnectedTool = z.infer<typeof insertConnectedToolSchema>;

export type CannedResponse = typeof cannedResponses.$inferSelect;
export type InsertCannedResponse = z.infer<typeof insertCannedResponseSchema>;

export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;

export type ActionItemOutput = typeof actionItemOutputs.$inferSelect;
export type InsertActionItemOutput = z.infer<typeof insertActionItemOutputSchema>;

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;

export type TimeSaved = typeof timeSaved.$inferSelect;
export type InsertTimeSaved = z.infer<typeof insertTimeSavedSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type AccessibilityPreference = typeof accessibilityPreferences.$inferSelect;
export type InsertAccessibilityPreference = z.infer<typeof insertAccessibilityPreferenceSchema>;
