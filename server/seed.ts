import { storage } from './storage';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Seeds the database with initial data for testing purposes
 */
export async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');
  
  // Create test users
  const users = [
    {
      email: 'sarah@expiestack.com',
      password: 'password123',
      mode: 'hype',
      onboarding_complete: true
    },
    {
      email: 'michael@expiestack.com',
      password: 'password123',
      mode: 'focus',
      onboarding_complete: true
    },
    {
      email: 'alex@expiestack.com',
      password: 'password123',
      mode: 'zen',
      onboarding_complete: false
    }
  ];
  
  const createdUsers = [];
  
  for (const user of users) {
    try {
      const existingUser = await storage.getUserByEmail(user.email);
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const createdUser = await storage.createUser({
          email: user.email,
          password: hashedPassword,
          mode: user.mode,
          onboarding_complete: user.onboarding_complete
        });
        
        console.log(`Created user: ${user.email}`);
        createdUsers.push(createdUser);
      } else {
        console.log(`User ${user.email} already exists, skipping`);
        createdUsers.push(existingUser);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
  
  if (createdUsers.length === 0) {
    console.log('No users created, skipping other seed data');
    return;
  }
  
  // Set the first user as our main test user
  const mainUser = createdUsers[0];
  
  // Create connected tools for main user
  const tools = [
    { user_id: mainUser.id, tool_name: 'slack', status: 'connected', connected_at: new Date() },
    { user_id: mainUser.id, tool_name: 'gmail', status: 'connected', connected_at: new Date() },
    { user_id: mainUser.id, tool_name: 'calendar', status: 'connected', connected_at: new Date() },
    { user_id: mainUser.id, tool_name: 'openai', status: 'connected', connected_at: new Date() },
    { user_id: mainUser.id, tool_name: 'fireflies', status: 'pending', connected_at: new Date() }
  ];
  
  for (const tool of tools) {
    try {
      await storage.connectTool(tool);
      console.log(`Connected tool ${tool.tool_name} for user ${mainUser.email}`);
    } catch (error) {
      console.error(`Error connecting tool ${tool.tool_name}:`, error);
    }
  }
  
  // Create canned responses for main user
  const cannedResponses = [
    { 
      user_id: mainUser.id, 
      title: 'FastCAP Reminder', 
      content: `Good morning everyone!

Just a friendly reminder that our FastCAP session starts in 30 minutes. This training is an excellent opportunity to expand your knowledge and skills.

Join link: https://expuniversity.learnworlds.com/fastcap 

Looking forward to seeing you there!`,
      tags: ['fastcap', 'training', 'reminder'], 
      usage_count: 15 
    },
    { 
      user_id: mainUser.id, 
      title: 'Weekly Check-In', 
      content: `Hi team,

Hope your week is going well! Please share your updates using the format below:

✅ Completed this week
🚀 Working on now
🛑 Blockers/challenges
🙋 Where you need help

I'll compile responses by EOD Friday. Thanks for keeping our communication flowing!`,
      tags: ['weekly', 'check-in', 'team'], 
      usage_count: 12 
    },
    { 
      user_id: mainUser.id, 
      title: 'Client Follow-Up', 
      content: `Hello [Client Name],

Thank you for our conversation today! I wanted to follow up with the key points we discussed:

1. Your property goals and timeline
2. Your budget considerations
3. Next steps in the process

I've made a note to check in with you next [Day] to see if you have any questions. In the meantime, feel free to reach out if you need anything.

Looking forward to working with you!`,
      tags: ['client', 'follow-up', 'sales'], 
      usage_count: 9 
    }
  ];
  
  for (const response of cannedResponses) {
    try {
      await storage.createCannedResponse(response);
      console.log(`Created canned response: ${response.title}`);
    } catch (error) {
      console.error(`Error creating canned response ${response.title}:`, error);
    }
  }
  
  // Create action items for main user
  const actionItems = [
    { 
      user_id: mainUser.id, 
      text: 'Create a process doc for the team onboarding workflow', 
      status: 'pending',
      source: 'meeting',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    },
    { 
      user_id: mainUser.id, 
      text: 'Schedule a follow-up meeting with the FastCAP committee', 
      status: 'in_progress',
      source: 'call',
      transcript: 'Call with the FastCAP leadership team on Monday discussing future curriculum updates. Need to schedule a follow-up meeting to finalize changes.',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
    },
    { 
      user_id: mainUser.id, 
      text: 'Draft copy for a LinkedIn post announcing the AI challenge', 
      status: 'pending',
      source: 'email',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    { 
      user_id: mainUser.id, 
      text: 'Update the AI onboarding materials for new staff', 
      status: 'completed',
      source: 'email',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  ];
  
  for (const item of actionItems) {
    try {
      await storage.createActionItem(item);
      console.log(`Created action item: ${item.text}`);
    } catch (error) {
      console.error(`Error creating action item ${item.text}:`, error);
    }
  }
  
  // Create automations for main user
  const automations = [
    { 
      user_id: mainUser.id, 
      trigger_type: 'weekly', 
      action: 'Send weekly status check-in message',
      tool: 'slack',
      is_enabled: true,
      last_run: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      description: 'Automatically sends a weekly check-in message to your team every Monday at 9am'
    },
    { 
      user_id: mainUser.id, 
      trigger_type: 'transcript', 
      action: 'Follow up on Fireflies transcript',
      tool: 'fireflies',
      is_enabled: true,
      last_run: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      description: 'Analyzes meeting transcripts and automatically sends follow-up messages with action items'
    },
    { 
      user_id: mainUser.id, 
      trigger_type: 'email', 
      action: 'Auto-tag client emails',
      tool: 'gmail',
      is_enabled: false,
      description: 'Automatically tags incoming client emails for better organization'
    }
  ];
  
  for (const automation of automations) {
    try {
      await storage.createAutomation(automation);
      console.log(`Created automation: ${automation.action}`);
    } catch (error) {
      console.error(`Error creating automation ${automation.action}:`, error);
    }
  }
  
  // Log time saved entries for main user
  const timeSavedEntries = [
    { user_id: mainUser.id, action_type: 'canned_response', minutes_saved: 5 },
    { user_id: mainUser.id, action_type: 'canned_response', minutes_saved: 3 },
    { user_id: mainUser.id, action_type: 'automation', minutes_saved: 15 },
    { user_id: mainUser.id, action_type: 'gpt_draft', minutes_saved: 10 },
    { user_id: mainUser.id, action_type: 'automation', minutes_saved: 12 },
    { user_id: mainUser.id, action_type: 'slack_message', minutes_saved: 2 }
  ];
  
  for (const entry of timeSavedEntries) {
    try {
      await storage.logTimeSaved(entry);
      console.log(`Logged time saved: ${entry.minutes_saved} minutes from ${entry.action_type}`);
    } catch (error) {
      console.error(`Error logging time saved:`, error);
    }
  }
  
  // Create user achievements for main user
  const achievements = [
    { user_id: mainUser.id, badge: 'first_login', earned_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { user_id: mainUser.id, badge: 'tools_connected', earned_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { user_id: mainUser.id, badge: 'loop_slayer', earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), details: "Used 10+ canned responses" },
    { user_id: mainUser.id, badge: 'time_wizard', earned_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), details: "Saved 100+ minutes" },
    { user_id: mainUser.id, badge: 'automation_hero', earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), details: "Created 5 automations" }
  ];
  
  for (const achievement of achievements) {
    try {
      await storage.addUserAchievement(achievement);
      console.log(`Added achievement: ${achievement.badge}`);
    } catch (error) {
      console.error(`Error adding achievement ${achievement.badge}:`, error);
    }
  }
  
  // Create accessibility preferences for main user
  try {
    await storage.saveAccessibilityPreferences({
      user_id: mainUser.id,
      large_text: false,
      dark_mode: true,
      reduce_motion: false,
      high_contrast: false
    });
    console.log(`Created accessibility preferences for user ${mainUser.email}`);
  } catch (error) {
    console.error(`Error creating accessibility preferences:`, error);
  }
  
  console.log('✅ Database seeding complete!');
}