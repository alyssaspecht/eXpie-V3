// Simulated channel data
const simulatedChannels = [
  { id: 'C01234ABCDE', name: 'general', members: 32 },
  { id: 'C098765FGHI', name: 'team-real-estate', members: 15 },
  { id: 'C111222JKLM', name: 'leads', members: 8 },
  { id: 'C333444NOPQ', name: 'property-listings', members: 12 },
  { id: 'C555666RSTU', name: 'client-success', members: 6 }
];

// Simulated message history
const messageHistory = new Map();

// Function to simulate sending a Slack message
export async function sendSlackMessage(channel: string, text: string) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the channel
    const foundChannel = simulatedChannels.find(c => c.id === channel || c.name === channel);
    if (!foundChannel) {
      throw new Error(`Channel ${channel} not found`);
    }
    
    // Create a simulated message
    const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const message = {
      id: messageId,
      channel: foundChannel.id,
      text,
      timestamp: new Date().toISOString(),
      user: 'U012345678', // Simulated user ID
      username: 'eXpieStack Bot',
      success: true
    };
    
    // Store in our simulated history
    if (!messageHistory.has(foundChannel.id)) {
      messageHistory.set(foundChannel.id, []);
    }
    messageHistory.get(foundChannel.id).push(message);
    
    console.log(`Simulated message sent to #${foundChannel.name}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    
    return {
      ok: true,
      message_id: messageId,
      channel: foundChannel.id,
      channel_name: foundChannel.name,
      timestamp: message.timestamp
    };
  } catch (error) {
    console.error('Error sending simulated Slack message:', error);
    throw error;
  }
}

// Function to use a canned response in Slack
export async function sendCannedResponseToSlack(channel: string, cannedResponseId: string) {
  try {
    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // First fetch the canned response content - this still needs to be real
    const responseContentRes = await fetch(`/api/canned-responses/${cannedResponseId}`, {
      credentials: 'include',
    });
    
    if (!responseContentRes.ok) {
      const errorData = await responseContentRes.json();
      throw new Error(errorData.message || 'Failed to fetch canned response');
    }
    
    const cannedResponse = await responseContentRes.json();
    
    // Now send the content to simulated Slack
    const result = await sendSlackMessage(channel, cannedResponse.content);
    
    // Track usage of the canned response - this still needs to be real
    await fetch(`/api/canned-responses/${cannedResponseId}/use`, {
      method: 'POST',
      credentials: 'include',
    });
    
    return {
      ...result,
      simulated: true,
      canned_response_id: cannedResponseId
    };
  } catch (error) {
    console.error('Error sending canned response to Slack:', error);
    throw error;
  }
}

// Prepare Slack slash commands params (simulate these for the demo)
export const slashCommands = {
  canned: (tag: string) => `/expie canned ${tag}`,
  tasks: () => `/expie tasks`,
};

// Get a list of available Slack channels for the UI
export async function getSlackChannels() {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return simulatedChannels.map(channel => ({
    id: channel.id,
    name: channel.name,
    member_count: channel.members
  }));
}

// Simulate a listener for Slack events
export function setupSlackEventListener(callback: (event: any) => void) {
  console.log('Setting up simulated Slack event listener');
  
  // Create a simulated event every 60 seconds if desired
  const interval = setInterval(() => {
    // Example of simulating an event - disabled by default
    /* 
    const eventTypes = ['message', 'channel_created', 'channel_rename', 'member_joined_channel'];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    callback({
      type: randomEvent,
      timestamp: new Date().toISOString(),
      channel: simulatedChannels[Math.floor(Math.random() * simulatedChannels.length)].id,
      user: `U${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      text: randomEvent === 'message' ? 'This is a simulated Slack message' : undefined
    });
    */
  }, 60000);
  
  // Return a cleanup function
  return () => {
    console.log('Cleaning up simulated Slack event listener');
    clearInterval(interval);
  };
}
