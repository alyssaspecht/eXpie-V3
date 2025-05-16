import OpenAI from "openai";

// Use environment variable for API key or fallback to empty string (handled in UI)
// In this simulated version, we don't need a real API key
const apiKey = 'simulated-key';

// Initialize OpenAI client - this won't be used in the simulated version
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const openai = new OpenAI({ 
  apiKey: 'sk-simulated',
  dangerouslyAllowBrowser: true // Allow usage in browser environment
});

// Simulated responses for real estate scenarios
const simulatedResponses = {
  followUp: `Hi [Name],

I wanted to follow up on our conversation about the property at [Address]. As we discussed, this [Bedroom] bedroom, [Bathroom] bathroom home is in a highly desirable neighborhood with excellent schools nearby.

I've attached some additional information about recent comparable sales in the area that support the listing price we discussed. 

Would you like to schedule a time to see the property in person? I'm available this weekend or next week at your convenience.

Best regards,
[Your Name]`,
  
  marketUpdate: `Hello [Client Name],

I wanted to provide you with a quick market update for [Neighborhood/Area].

Currently, we're seeing:
- Average sale price: $[Amount]
- Average days on market: [Number] days
- [Number] new listings this month
- [Number]% increase/decrease in inventory from last month

If you're interested in a more detailed analysis for your specific property, please let me know and I'd be happy to prepare one for you.

Thanks,
[Your Name]`,
  
  clientConsultation: `Hello [Client Name],

Thank you for the opportunity to discuss your real estate needs. Based on our conversation, I understand you're looking for:

- Property type: [House/Condo/Townhouse]
- Bedrooms: [Number]
- Bathrooms: [Number]
- Budget: $[Amount] - $[Amount]
- Must-haves: [List key features]
- Preferred neighborhoods: [List areas]

I'll begin searching for properties that match these criteria and will send you some options in the next [timeframe]. In the meantime, please let me know if you have any questions or if anything changes with your requirements.

Looking forward to helping you find your perfect home!

Best regards,
[Your Name]`
};

// Generate a draft for an action item
export async function generateActionItemDraft(actionItem: string, context?: string): Promise<string> {
  try {
    // Simulate delay for a more realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Use the exact action item to generate a relevant response based on the prompt guidelines
    const prompt = `You are eXpie, an AI productivity assistant. Here is the user's task:

${actionItem}

Please generate a professional first draft that will help them get started. This could be a checklist, email, project brief, or outline depending on the task.`;

    let response;
    
    // Process each action item type with customized, relevant responses
    if (actionItem.toLowerCase().includes('process doc') || actionItem.toLowerCase().includes('onboarding')) {
      response = `Subject: Onboarding Workflow — Initial Draft

Here's a working doc to guide new team members through onboarding:
– Overview of systems/tools
– First 7-day expectations
– Team contacts
– Performance benchmarks

Let me know what else you'd like to include before sharing!`;
    } else if (actionItem.toLowerCase().includes('follow up') || actionItem.toLowerCase().includes('meeting') || actionItem.toLowerCase().includes('fastcap')) {
      response = `Subject: FastCAP Committee Follow-Up

I'd like to schedule a follow-up meeting to discuss:

1. Recent FastCAP session feedback
2. Proposed changes to the curriculum
3. Next quarter's schedule planning
4. Instructor availability and assignments

Would Thursday at 2pm work for everyone? I'll send calendar invites once confirmed.`;
    } else if (actionItem.toLowerCase().includes('draft') || actionItem.toLowerCase().includes('linkedin') || actionItem.toLowerCase().includes('post')) {
      response = `Subject: LinkedIn Post Draft - AI Challenge Announcement

Excited to announce our upcoming AI Challenge at eXp Realty! 🚀

Join us in exploring how AI can transform real estate operations. This competition invites teams to build innovative solutions that:
• Improve client experiences
• Streamline workflows
• Enhance data analysis

Registration opens May 20th. Cash prizes and implementation opportunities for winning solutions!

#AIinRealEstate #eXpInnovation #RealEstateTech`;
    } else if (actionItem.toLowerCase().includes('update') || actionItem.toLowerCase().includes('materials') || actionItem.toLowerCase().includes('onboarding')) {
      response = `Subject: AI Onboarding Materials Update - Draft Plan

Here's my initial plan for updating our AI onboarding materials:

1. Add section on prompt engineering best practices
2. Update ChatGPT examples with GPT-4o capabilities 
3. Create quick-reference guide for common AI tasks
4. Develop 3 hands-on exercises for new staff
5. Record walkthrough videos for complex workflows

Target completion: End of month
Reviewers needed: Tech team and 2-3 recent hires`;
    } else {
      // Generic response if nothing specific matches
      response = `Subject: ${actionItem} - Initial Draft

I've prepared a first draft for this task:

1. Main objectives and scope
2. Key stakeholders to involve
3. Timeline and milestones
4. Resources needed
5. Success metrics

Would you like me to expand any particular section or add other components?`;
    }
    
    // Add context reference if provided (for meeting transcripts, etc.)
    if (context && context.trim().length > 0) {
      response = `Based on: "${context.substring(0, 100)}${context.length > 100 ? '...' : ''}"

${response}`;
    }

    console.log("Generated content with simulated OpenAI implementation");
    return response;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

// Generate a canned response suggestion
export async function generateCannedResponseSuggestion(title: string, tagHints?: string[]): Promise<string> {
  try {
    // Simulate delay for a more realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Predefined canned responses for common real estate topics
    const cannedResponses = {
      faq: `Thank you for your question about [Topic].

This is a common question I receive, and I'm happy to clarify. [Brief 1-2 sentence explanation]

In short, [main answer point]. If you'd like more detailed information, I can provide resources or schedule a quick call to discuss further.

Let me know if you have any other questions!`,
      
      showing: `Thank you for your interest in viewing [Property Type/Address].

I'd be delighted to arrange a showing for you. The property is available for viewings on [Days/Times]. Please let me know which of these options works best for you, and I'll confirm the appointment.

To make the most of our time, I recommend having your pre-approval letter ready if you're considering making an offer. This property has been generating significant interest.

Looking forward to showing you this wonderful property!`,
      
      pricing: `Thank you for inquiring about pricing for [Property/Service].

Our current rates are as follows:
- [Item/Service 1]: $X
- [Item/Service 2]: $Y
- [Package option]: $Z

All prices include [what's included] and are valid until [date]. We also offer flexible payment options to accommodate your needs.

Please let me know if you have any other questions or would like a personalized quote.`,

      followUp: `I wanted to follow up on our recent conversation about [Topic/Property].

As promised, I've [action taken - e.g., "researched those questions," "checked availability," etc.]. [Insert 1-2 sentences with findings or updates]

The next steps would be [brief description of next steps]. Would you like to proceed, or do you need any additional information at this point?

I'm here to help in any way I can.`
    };
    
    // Select an appropriate response based on the title and tags
    let responseText;
    
    if (title.toLowerCase().includes('faq') || title.toLowerCase().includes('question')) {
      responseText = cannedResponses.faq;
    } else if (title.toLowerCase().includes('showing') || title.toLowerCase().includes('tour') || title.toLowerCase().includes('visit')) {
      responseText = cannedResponses.showing;
    } else if (title.toLowerCase().includes('price') || title.toLowerCase().includes('cost') || title.toLowerCase().includes('fee')) {
      responseText = cannedResponses.pricing;
    } else {
      responseText = cannedResponses.followUp;
    }
    
    // Customize with tags if provided
    if (tagHints && tagHints.length > 0) {
      responseText = `[${tagHints.join('/')}]\n\n${responseText}`;
    }
    
    console.log("Simulated canned response generated");
    return responseText;
  } catch (error) {
    console.error("Error generating simulated canned response:", error);
    throw error;
  }
}

// Extract action items from meeting transcript
export async function extractActionItemsFromTranscript(transcript: string): Promise<string[]> {
  try {
    // Simulate delay for a more realistic experience
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Predefined action items that make sense for real estate professionals
    const predefinedActionItems = [
      "Schedule property viewing for 123 Main St on Tuesday",
      "Follow up with John Smith about financing options",
      "Send market analysis report to the Rodriguez family",
      "Contact home inspector to arrange inspection for 456 Oak Avenue",
      "Prepare listing presentation for Thursday's appointment with the Millers",
      "Call contractor about repair estimate for the kitchen renovation",
      "Update MLS listing for 789 Pine Street with new photos",
      "Reach out to past clients for quarterly check-in",
      "Prepare offer documents for the Jacksons",
      "Research comparable properties in Westlake neighborhood"
    ];
    
    // Pick a random number of action items between 3 and 5
    const numItems = Math.floor(Math.random() * 3) + 3;
    const selectedItems = [];
    
    // Select random action items without duplicates
    const availableItems = [...predefinedActionItems];
    for (let i = 0; i < numItems; i++) {
      if (availableItems.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      selectedItems.push(availableItems[randomIndex]);
      availableItems.splice(randomIndex, 1);
    }
    
    // Try to extract a keyword from the transcript to make the response more relevant
    let keyword = '';
    if (transcript.length > 0) {
      const words = transcript.split(' ');
      if (words.length > 3) {
        const randomWordIndex = Math.floor(Math.random() * Math.min(words.length, 20));
        keyword = words[randomWordIndex];
        
        // Add one custom action item based on the keyword if it's meaningful
        if (keyword.length > 3 && !keyword.match(/^(and|the|this|that|with|from|have|about)$/i)) {
          selectedItems.push(`Follow up about ${keyword} discussion from the meeting`);
        }
      }
    }
    
    console.log("Simulated action items extracted");
    return selectedItems;
  } catch (error) {
    console.error("Error extracting simulated action items:", error);
    throw error;
  }
}

// Suggest an automation based on user activity
export async function suggestAutomation(activityHistory: string): Promise<{
  trigger: string;
  action: string;
  tool: string;
  timeSaved: number;
  description: string;
}> {
  try {
    // Simulate delay for a more realistic experience
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Predefined automation suggestions for real estate workflows
    const automationSuggestions = [
      {
        trigger: "New client inquiry received",
        action: "Send welcome email with introduction and schedule initial consultation",
        tool: "Gmail",
        timeSaved: 15,
        description: "Automatically respond to new leads with your introduction and calendar link to reduce response time and capture more opportunities."
      },
      {
        trigger: "Property showing scheduled",
        action: "Send reminder and property details 24 hours before viewing",
        tool: "Calendar",
        timeSaved: 10,
        description: "Ensure clients are prepared for viewings with automatic reminders containing property details, directions, and key features to highlight."
      },
      {
        trigger: "Meeting transcript with action items detected",
        action: "Create task assignments in project management tool",
        tool: "Slack",
        timeSaved: 20,
        description: "Automatically convert meeting notes into assigned tasks to ensure follow-up items don't fall through the cracks."
      },
      {
        trigger: "Contract signed",
        action: "Notify team members and start closing process workflow",
        tool: "Slack",
        timeSaved: 12,
        description: "Keep your team in sync with automatic notifications when a contract is signed, initiating the closing process workflow."
      },
      {
        trigger: "Property listing anniversary (6 months)",
        action: "Generate price reduction recommendation email",
        tool: "Gmail",
        timeSaved: 25,
        description: "Automatically identify stale listings and prepare price reduction recommendations with market comparison data to help move properties."
      }
    ];
    
    // Select a random automation suggestion
    const randomIndex = Math.floor(Math.random() * automationSuggestions.length);
    const suggestion = automationSuggestions[randomIndex];
    
    // Slightly customize the suggestion if activity history contains relevant keywords
    if (activityHistory) {
      if (activityHistory.toLowerCase().includes('email') || activityHistory.toLowerCase().includes('message')) {
        suggestion.tool = 'Gmail';
      } else if (activityHistory.toLowerCase().includes('team') || activityHistory.toLowerCase().includes('chat')) {
        suggestion.tool = 'Slack';
      } else if (activityHistory.toLowerCase().includes('meeting') || activityHistory.toLowerCase().includes('schedule')) {
        suggestion.tool = 'Calendar';
      }
    }
    
    console.log("Simulated automation suggestion generated");
    return suggestion;
  } catch (error) {
    console.error("Error generating simulated automation suggestion:", error);
    throw error;
  }
}
