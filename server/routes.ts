import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";

// Extend the Request type to include session
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare module "express" {
  interface Request {
    session: session.Session & session.SessionData;
  }
}
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertConnectedToolSchema, 
  insertCannedResponseSchema,
  insertActionItemSchema,
  insertActionItemOutputSchema,
  insertAutomationSchema,
  insertTimeSavedSchema,
  insertUserAchievementSchema,
  insertAccessibilityPreferenceSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import OpenAI from "openai";
import { WebClient } from "@slack/web-api";

// Setup OpenAI client - using simulated version
import * as openaiSimulated from "../client/src/lib/openai";
const openai = { simulate: true };

// Setup Slack client - using simulated version
import * as slackSimulated from "../client/src/lib/slack";
const slack = { simulate: true };

export async function registerRoutes(app: Express): Promise<Server> {
  // Default user middleware for demo purposes - bypasses authentication
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if we have a demo user already
      if (!req.session.userId) {
        // Get our demo user
        const demoUser = await storage.getUserByEmail('sarah@expiestack.com');
        if (demoUser) {
          // Set the user ID in the session
          req.session.userId = demoUser.id;
        }
      }
      next();
    } catch (error) {
      next();
    }
  });

  // User Authentication Routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "No active session" });
    }
  });
  
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });
  
  // User Settings Routes
  app.patch("/api/user/settings", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { mode, onboarding_complete } = req.body;
      const updateData: Record<string, any> = {};
      
      if (mode !== undefined) updateData.mode = mode;
      if (onboarding_complete !== undefined) updateData.onboarding_complete = onboarding_complete;
      
      const updatedUser = await storage.updateUser(req.session.userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });
  
  // Connected Tools Routes
  app.get("/api/tools", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tools = await storage.getConnectedTools(req.session.userId);
      res.status(200).json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to get connected tools" });
    }
  });
  
  app.post("/api/tools", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertConnectedToolSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      const tool = await storage.connectTool(validatedData);
      res.status(201).json(tool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to connect tool" });
    }
  });
  
  app.patch("/api/tools/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedTool = await storage.updateToolStatus(req.params.id, status);
      if (!updatedTool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      res.status(200).json(updatedTool);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tool status" });
    }
  });
  
  // Canned Responses Routes
  app.get("/api/canned-responses", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tag = req.query.tag as string | undefined;
      
      if (tag) {
        const responses = await storage.getCannedResponsesByTag(req.session.userId, tag);
        return res.status(200).json(responses);
      }
      
      const responses = await storage.getCannedResponses(req.session.userId);
      res.status(200).json(responses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get canned responses" });
    }
  });
  
  app.post("/api/canned-responses", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertCannedResponseSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      const response = await storage.createCannedResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create canned response" });
    }
  });
  
  app.patch("/api/canned-responses/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { title, content, tags } = req.body;
      const updateData: Record<string, any> = {};
      
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (tags !== undefined) updateData.tags = tags;
      
      const updatedResponse = await storage.updateCannedResponse(req.params.id, updateData);
      if (!updatedResponse) {
        return res.status(404).json({ message: "Canned response not found" });
      }
      
      res.status(200).json(updatedResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update canned response" });
    }
  });
  
  app.delete("/api/canned-responses/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const success = await storage.deleteCannedResponse(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Canned response not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete canned response" });
    }
  });
  
  app.post("/api/canned-responses/:id/use", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const success = await storage.incrementCannedResponseUsage(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Canned response not found" });
      }
      
      // Log time saved (assuming 1 minute saved per use)
      await storage.logTimeSaved({
        user_id: req.session.userId,
        action_type: "canned_response",
        minutes_saved: 1
      });
      
      res.status(200).json({ message: "Usage incremented and time saved logged" });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment usage" });
    }
  });
  
  // Action Items Routes
  app.get("/api/action-items", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const items = await storage.getActionItems(req.session.userId);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get action items" });
    }
  });
  
  app.post("/api/action-items", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertActionItemSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      const item = await storage.createActionItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create action item" });
    }
  });
  
  app.patch("/api/action-items/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { text, status, due_date, source } = req.body;
      const updateData: Record<string, any> = {};
      
      if (text !== undefined) updateData.text = text;
      if (status !== undefined) updateData.status = status;
      if (due_date !== undefined) updateData.due_date = due_date;
      if (source !== undefined) updateData.source = source;
      
      const updatedItem = await storage.updateActionItem(req.params.id, updateData);
      if (!updatedItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update action item" });
    }
  });
  
  app.delete("/api/action-items/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const success = await storage.deleteActionItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete action item" });
    }
  });
  
  app.post("/api/action-items/:id/gpt", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const actionItem = await storage.getActionItem(req.params.id);
      if (!actionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      // Get the transcript or text to use for generating content
      const prompt = actionItem.transcript || actionItem.text;
      
      // Use our simulated OpenAI implementation to generate content
      let generatedContent = "";
      try {
        // This simulated function returns plain text instead of an OpenAI response structure
        generatedContent = await openaiSimulated.generateActionItemDraft(
          actionItem.text, 
          prompt !== actionItem.text ? prompt : undefined
        );
        
        console.log("Generated content with simulated OpenAI implementation");
      } catch (error) {
        console.error("Error generating content:", error);
        return res.status(500).json({ message: "Error generating content" });
      }
      
      // Log time saved (2 minutes for GPT draft)
      await storage.logTimeSaved({
        user_id: req.session.userId,
        action_type: "gpt_draft",
        minutes_saved: 2
      });
      
      // Save the output
      const output = await storage.createActionItemOutput({
        user_id: req.session.userId,
        action_item_id: actionItem.id,
        output: generatedContent || "No content generated",
        tool_used: "openai"
      });
      
      res.status(200).json(output);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content with GPT" });
    }
  });
  
  app.get("/api/action-items/:id/outputs", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const outputs = await storage.getActionItemOutputs(req.params.id);
      res.status(200).json(outputs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get action item outputs" });
    }
  });
  
  // Automations Routes
  app.get("/api/automations", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const automations = await storage.getAutomations(req.session.userId);
      res.status(200).json(automations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get automations" });
    }
  });
  
  app.post("/api/automations", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertAutomationSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      const automation = await storage.createAutomation(validatedData);
      
      // Log time saved (3 minutes for creating automation)
      await storage.logTimeSaved({
        user_id: req.session.userId,
        action_type: "automation_created",
        minutes_saved: 3
      });
      
      res.status(201).json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create automation" });
    }
  });
  
  app.patch("/api/automations/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { trigger_type, action, tool, is_enabled } = req.body;
      const updateData: Record<string, any> = {};
      
      if (trigger_type !== undefined) updateData.trigger_type = trigger_type;
      if (action !== undefined) updateData.action = action;
      if (tool !== undefined) updateData.tool = tool;
      if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
      
      const updatedAutomation = await storage.updateAutomation(req.params.id, updateData);
      if (!updatedAutomation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      
      res.status(200).json(updatedAutomation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update automation" });
    }
  });
  
  app.delete("/api/automations/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const success = await storage.deleteAutomation(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Automation not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete automation" });
    }
  });
  
  app.post("/api/automations/:id/run", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const automation = await storage.getAutomation(req.params.id);
      if (!automation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      
      // Execute automation logic here based on the tool and action
      // For now, we'll just update the last_run timestamp
      
      const updatedAutomation = await storage.updateAutomation(automation.id, {
        last_run: new Date()
      });
      
      // Log time saved (5 minutes for running automation)
      await storage.logTimeSaved({
        user_id: req.session.userId,
        action_type: "automation_run",
        minutes_saved: 5
      });
      
      res.status(200).json(updatedAutomation);
    } catch (error) {
      res.status(500).json({ message: "Failed to run automation" });
    }
  });
  
  // Time Saved Routes
  app.get("/api/time-saved", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const entries = await storage.getTimeSaved(req.session.userId);
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get time saved entries" });
    }
  });
  
  app.get("/api/time-saved/total", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const totalMinutes = await storage.getTotalTimeSaved(req.session.userId);
      res.status(200).json({ minutes: totalMinutes, hours: totalMinutes / 60 });
    } catch (error) {
      res.status(500).json({ message: "Failed to get total time saved" });
    }
  });
  
  app.post("/api/time-saved", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertTimeSavedSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      const entry = await storage.logTimeSaved(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to log time saved" });
    }
  });
  
  // Achievements Routes
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const achievements = await storage.getUserAchievements(req.session.userId);
      res.status(200).json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });
  
  app.post("/api/achievements", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertUserAchievementSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      const achievement = await storage.addUserAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add achievement" });
    }
  });
  
  // Accessibility Preferences Routes
  app.get("/api/accessibility", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const preferences = await storage.getAccessibilityPreferences(req.session.userId);
      res.status(200).json(preferences || {
        large_text: false,
        dark_mode: false,
        reduce_motion: false,
        high_contrast: false
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get accessibility preferences" });
    }
  });
  
  app.post("/api/accessibility", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertAccessibilityPreferenceSchema.parse({
        ...req.body,
        user_id: req.session.userId
      });
      
      // Check if preferences already exist
      const existingPreferences = await storage.getAccessibilityPreferences(req.session.userId);
      
      if (existingPreferences) {
        const updatedPreferences = await storage.updateAccessibilityPreferences(
          existingPreferences.id,
          validatedData
        );
        return res.status(200).json(updatedPreferences);
      }
      
      const preferences = await storage.saveAccessibilityPreferences(validatedData);
      res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save accessibility preferences" });
    }
  });
  
  // Slack Integration Routes
  app.post("/api/slack/send", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!slack) {
        return res.status(503).json({ message: "Slack service not available" });
      }
      
      const { channel, text } = req.body;
      
      if (!channel || !text) {
        return res.status(400).json({ message: "Channel and text are required" });
      }
      
      const response = await slack.chat.postMessage({
        channel,
        text
      });
      
      res.status(200).json({ message: "Message sent", ts: response.ts });
    } catch (error) {
      res.status(500).json({ message: "Failed to send Slack message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
