import { 
  User, InsertUser, 
  ConnectedTool, InsertConnectedTool,
  CannedResponse, InsertCannedResponse,
  ActionItem, InsertActionItem,
  ActionItemOutput, InsertActionItemOutput,
  Automation, InsertAutomation,
  TimeSaved, InsertTimeSaved,
  UserAchievement, InsertUserAchievement,
  AccessibilityPreference, InsertAccessibilityPreference
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  // Connected Tools operations
  getConnectedTools(userId: string): Promise<ConnectedTool[]>;
  connectTool(tool: InsertConnectedTool): Promise<ConnectedTool>;
  updateToolStatus(id: string, status: string): Promise<ConnectedTool | undefined>;
  
  // Canned Responses operations
  getCannedResponses(userId: string): Promise<CannedResponse[]>;
  getCannedResponsesByTag(userId: string, tag: string): Promise<CannedResponse[]>;
  createCannedResponse(cannedResponse: InsertCannedResponse): Promise<CannedResponse>;
  updateCannedResponse(id: string, data: Partial<CannedResponse>): Promise<CannedResponse | undefined>;
  deleteCannedResponse(id: string): Promise<boolean>;
  incrementCannedResponseUsage(id: string): Promise<boolean>;
  
  // Action Items operations
  getActionItems(userId: string): Promise<ActionItem[]>;
  getActionItem(id: string): Promise<ActionItem | undefined>;
  createActionItem(actionItem: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem | undefined>;
  deleteActionItem(id: string): Promise<boolean>;
  
  // Action Item Outputs operations
  getActionItemOutputs(actionItemId: string): Promise<ActionItemOutput[]>;
  createActionItemOutput(output: InsertActionItemOutput): Promise<ActionItemOutput>;
  
  // Automations operations
  getAutomations(userId: string): Promise<Automation[]>;
  getAutomation(id: string): Promise<Automation | undefined>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: string, data: Partial<Automation>): Promise<Automation | undefined>;
  deleteAutomation(id: string): Promise<boolean>;
  
  // Time Saved operations
  getTimeSaved(userId: string): Promise<TimeSaved[]>;
  getTotalTimeSaved(userId: string): Promise<number>;
  logTimeSaved(timeSaved: InsertTimeSaved): Promise<TimeSaved>;
  
  // User Achievements operations
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  addUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Accessibility Preferences operations
  getAccessibilityPreferences(userId: string): Promise<AccessibilityPreference | undefined>;
  saveAccessibilityPreferences(preferences: InsertAccessibilityPreference): Promise<AccessibilityPreference>;
  updateAccessibilityPreferences(id: string, data: Partial<AccessibilityPreference>): Promise<AccessibilityPreference | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private connectedTools: Map<string, ConnectedTool>;
  private cannedResponses: Map<string, CannedResponse>;
  private actionItems: Map<string, ActionItem>;
  private actionItemOutputs: Map<string, ActionItemOutput>;
  private automations: Map<string, Automation>;
  private timeSaved: Map<string, TimeSaved>;
  private userAchievements: Map<string, UserAchievement>;
  private accessibilityPreferences: Map<string, AccessibilityPreference>;
  
  constructor() {
    this.users = new Map();
    this.connectedTools = new Map();
    this.cannedResponses = new Map();
    this.actionItems = new Map();
    this.actionItemOutputs = new Map();
    this.automations = new Map();
    this.timeSaved = new Map();
    this.userAchievements = new Map();
    this.accessibilityPreferences = new Map();
  }
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = { 
      ...user, 
      id, 
      created_at: new Date(),
      mode: user.mode || 'zen',
      onboarding_complete: user.onboarding_complete || false
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Connected Tools operations
  async getConnectedTools(userId: string): Promise<ConnectedTool[]> {
    return Array.from(this.connectedTools.values()).filter(tool => tool.user_id === userId);
  }
  
  async connectTool(tool: InsertConnectedTool): Promise<ConnectedTool> {
    const id = crypto.randomUUID();
    const newTool: ConnectedTool = { 
      ...tool, 
      id, 
      connected_at: new Date(),
      status: tool.status || 'pending'
    };
    this.connectedTools.set(id, newTool);
    return newTool;
  }
  
  async updateToolStatus(id: string, status: string): Promise<ConnectedTool | undefined> {
    const tool = this.connectedTools.get(id);
    if (!tool) return undefined;
    
    const updatedTool = { ...tool, status };
    this.connectedTools.set(id, updatedTool);
    return updatedTool;
  }
  
  // Canned Responses operations
  async getCannedResponses(userId: string): Promise<CannedResponse[]> {
    return Array.from(this.cannedResponses.values()).filter(response => response.user_id === userId);
  }
  
  async getCannedResponsesByTag(userId: string, tag: string): Promise<CannedResponse[]> {
    const userResponses = await this.getCannedResponses(userId);
    return userResponses.filter(response => response.tags?.includes(tag));
  }
  
  async createCannedResponse(cannedResponse: InsertCannedResponse): Promise<CannedResponse> {
    const id = crypto.randomUUID();
    const newResponse: CannedResponse = { 
      ...cannedResponse, 
      id, 
      created_at: new Date(),
      usage_count: 0
    };
    this.cannedResponses.set(id, newResponse);
    return newResponse;
  }
  
  async updateCannedResponse(id: string, data: Partial<CannedResponse>): Promise<CannedResponse | undefined> {
    const response = this.cannedResponses.get(id);
    if (!response) return undefined;
    
    const updatedResponse = { ...response, ...data };
    this.cannedResponses.set(id, updatedResponse);
    return updatedResponse;
  }
  
  async deleteCannedResponse(id: string): Promise<boolean> {
    return this.cannedResponses.delete(id);
  }
  
  async incrementCannedResponseUsage(id: string): Promise<boolean> {
    const response = this.cannedResponses.get(id);
    if (!response) return false;
    
    const updatedResponse = { 
      ...response, 
      usage_count: (response.usage_count || 0) + 1 
    };
    this.cannedResponses.set(id, updatedResponse);
    return true;
  }
  
  // Action Items operations
  async getActionItems(userId: string): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter(item => item.user_id === userId);
  }
  
  async getActionItem(id: string): Promise<ActionItem | undefined> {
    return this.actionItems.get(id);
  }
  
  async createActionItem(actionItem: InsertActionItem): Promise<ActionItem> {
    const id = crypto.randomUUID();
    const newItem: ActionItem = { 
      ...actionItem, 
      id, 
      created_at: new Date(),
      status: actionItem.status || 'pending'
    };
    this.actionItems.set(id, newItem);
    return newItem;
  }
  
  async updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem | undefined> {
    const item = this.actionItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...data };
    this.actionItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteActionItem(id: string): Promise<boolean> {
    return this.actionItems.delete(id);
  }
  
  // Action Item Outputs operations
  async getActionItemOutputs(actionItemId: string): Promise<ActionItemOutput[]> {
    return Array.from(this.actionItemOutputs.values()).filter(output => output.action_item_id === actionItemId);
  }
  
  async createActionItemOutput(output: InsertActionItemOutput): Promise<ActionItemOutput> {
    const id = crypto.randomUUID();
    const newOutput: ActionItemOutput = { 
      ...output, 
      id, 
      created_at: new Date()
    };
    this.actionItemOutputs.set(id, newOutput);
    return newOutput;
  }
  
  // Automations operations
  async getAutomations(userId: string): Promise<Automation[]> {
    return Array.from(this.automations.values()).filter(auto => auto.user_id === userId);
  }
  
  async getAutomation(id: string): Promise<Automation | undefined> {
    return this.automations.get(id);
  }
  
  async createAutomation(automation: InsertAutomation): Promise<Automation> {
    const id = crypto.randomUUID();
    const newAutomation: Automation = { 
      ...automation, 
      id, 
      created_at: new Date(),
      is_enabled: automation.is_enabled !== undefined ? automation.is_enabled : true,
      last_run: undefined
    };
    this.automations.set(id, newAutomation);
    return newAutomation;
  }
  
  async updateAutomation(id: string, data: Partial<Automation>): Promise<Automation | undefined> {
    const automation = this.automations.get(id);
    if (!automation) return undefined;
    
    const updatedAutomation = { ...automation, ...data };
    this.automations.set(id, updatedAutomation);
    return updatedAutomation;
  }
  
  async deleteAutomation(id: string): Promise<boolean> {
    return this.automations.delete(id);
  }
  
  // Time Saved operations
  async getTimeSaved(userId: string): Promise<TimeSaved[]> {
    return Array.from(this.timeSaved.values()).filter(entry => entry.user_id === userId);
  }
  
  async getTotalTimeSaved(userId: string): Promise<number> {
    const entries = await this.getTimeSaved(userId);
    return entries.reduce((total, entry) => total + entry.minutes_saved, 0);
  }
  
  async logTimeSaved(timeSaved: InsertTimeSaved): Promise<TimeSaved> {
    const id = crypto.randomUUID();
    const newEntry: TimeSaved = { 
      ...timeSaved, 
      id, 
      created_at: new Date()
    };
    this.timeSaved.set(id, newEntry);
    return newEntry;
  }
  
  // User Achievements operations
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(achievement => achievement.user_id === userId);
  }
  
  async addUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = crypto.randomUUID();
    const newAchievement: UserAchievement = { 
      ...achievement, 
      id, 
      earned_at: new Date()
    };
    this.userAchievements.set(id, newAchievement);
    return newAchievement;
  }
  
  // Accessibility Preferences operations
  async getAccessibilityPreferences(userId: string): Promise<AccessibilityPreference | undefined> {
    return Array.from(this.accessibilityPreferences.values()).find(pref => pref.user_id === userId);
  }
  
  async saveAccessibilityPreferences(preferences: InsertAccessibilityPreference): Promise<AccessibilityPreference> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newPreferences: AccessibilityPreference = { 
      ...preferences, 
      id, 
      created_at: now,
      updated_at: now
    };
    this.accessibilityPreferences.set(id, newPreferences);
    return newPreferences;
  }
  
  async updateAccessibilityPreferences(id: string, data: Partial<AccessibilityPreference>): Promise<AccessibilityPreference | undefined> {
    const preferences = this.accessibilityPreferences.get(id);
    if (!preferences) return undefined;
    
    const updatedPreferences = { 
      ...preferences, 
      ...data, 
      updated_at: new Date() 
    };
    this.accessibilityPreferences.set(id, updatedPreferences);
    return updatedPreferences;
  }
}

export const storage = new MemStorage();
