import { asyncHandler } from "../middleware/error.middleware.js";
import { generateStudyPlan } from "../services/studyPlan.service.js";
import { generateAIResponse } from "../utils/geminiClient.js";

export const generateMockStudyPlan = asyncHandler(async (req, res) => {
  const { exam, daysLeft, dailyHours, weakTopics } = req.body;
  const plan = generateStudyPlan({ exam, daysLeft, dailyHours, weakTopics });

  res.status(200).json({
    success: true,
    message: "Mock study plan generated successfully",
    plan,
  });
});

export const generateAIStudyPlan = asyncHandler(async (req, res) => {
  const { exam, daysLeft, dailyHours, weakTopics } = req.body;

  // Create prompt for Gemini
  const prompt = `You are an expert study planner. Create a highly effective, structured, and realistic study plan.
Details:
- Exam: ${exam}
- Time remaining: ${daysLeft} days
- Daily study time: ${dailyHours} hours
- Weak topics to prioritize: ${weakTopics}

Guidelines:
1. Prioritize the weak topics.
2. Include dedicated time for revision.
3. Include dedicated time for practice.
4. Keep the plan realistic and manageable within the daily study hours limit.

Output exactly and ONLY valid JSON matching this structure. Do not include markdown formatting, backticks, or any extra text:
{
  "plan": [
    {
      "day": number,
      "tasks": [
        {
          "topic": string,
          "type": "learn" | "revise" | "practice",
          "hours": number,
          "reason": string
        }
      ]
    }
  ]
}`;

  let parsedPlan;
  try {
    // Call Gemini client function
    const aiResponse = await generateAIResponse(prompt);
    
    // Parse the output as JSON (safeguard against markdown blocks)
    const cleanedResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    const planJson = JSON.parse(cleanedResponse);
    
    // Extract the plan array since our prompt forces it to be inside a "plan" key
    parsedPlan = planJson.plan || planJson;
  } catch (error) {
    if (error.message && error.message.includes("Rate Limit Exceeded")) {
      console.warn("AI Rate Limited. Falling back to dynamic mock generation.");
      const mockSafeTopic = weakTopics ? weakTopics.toString().split(',')[0].trim() : "Core Concepts";
      const mockSecondaryTopic = weakTopics && weakTopics.toString().split(',').length > 1 ? weakTopics.toString().split(',')[1].trim() : "Problem Solving";
      
      parsedPlan = Array.from({ length: 5 }).map((_, index) => ({
        day: index + 1,
        tasks: [
          {
            topic: mockSafeTopic,
            type: "learn",
            hours: Math.max(1, Math.floor((dailyHours || 2) * 0.4)),
            reason: "AI API Quota Exhausted: Generated offline mock. Focus on learning this weak topic."
          },
          {
            topic: mockSecondaryTopic,
            type: "practice",
            hours: Math.max(1, Math.floor((dailyHours || 2) * 0.4)),
            reason: "Offline Mock Strategy: Practice application of the theory."
          },
          {
            topic: "Previous Day Review",
            type: "revise",
            hours: Math.max(0.5, Number(((dailyHours || 2) * 0.2).toFixed(1))),
            reason: "Offline Block: Essential daily revision."
          }
        ]
      }));
    } else {
      console.error("AI Output Fetch/Parsing Error:", error.message);
      // Fallback if JSON is invalid
      parsedPlan = [
        {
          day: 1,
          tasks: [
            {
              topic: weakTopics ? weakTopics.toString().split(',')[0] : "General Studies",
              type: "learn",
              hours: dailyHours || 2,
              reason: "Fallback task. The AI response could not be parsed."
            }
          ]
        }
      ];
    }
  }

  // Return response as JSON
  res.status(200).json({
    success: true,
    plan: parsedPlan,
  });
});

export const rebalanceStudyPlan = asyncHandler(async (req, res) => {
  const { existingPlan, weakTopics, revisionTopics, performanceData } = req.body;

  // Create prompt for Gemini
  const prompt = `You are an expert study planner. Rebalance and update the following existing study plan based on the new data provided.

Existing Plan:
${JSON.stringify(existingPlan, null, 2)}

New Data to Integrate:
- Additional Weak Topics to increase frequency: ${weakTopics || "None"}
- Topics to add as Revision tasks: ${revisionTopics || "None"}
- Past Performance Data / Feedback: ${performanceData || "None"}

Guidelines:
1. Increase the frequency and time allocation for the new weak topics.
2. Add dedicated revision tasks for the prescribed revision topics.
3. Adjust the overall time allocation intelligently to accommodate these additions without making the schedule unrealistic.
4. Keep the output plan realistic and manageable.

Output exactly and ONLY valid JSON matching this structure (the same structure as the existing plan). Do not include markdown formatting, backticks, or any extra text:
{
  "plan": [
    {
      "day": number,
      "tasks": [
        {
          "topic": string,
          "type": "learn" | "revise" | "practice",
          "hours": number,
          "reason": string
        }
      ]
    }
  ]
}`;

  let parsedPlan;
  try {
    const aiResponse = await generateAIResponse(prompt);
    
    // Parse the output as JSON (safeguard against markdown blocks)
    const cleanedResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    const planJson = JSON.parse(cleanedResponse);
    
    // Extract the plan array since our prompt forces it to be inside a "plan" key
    parsedPlan = planJson.plan || planJson;
  } catch (error) {
    if (error.message && error.message.includes("Rate Limit Exceeded")) {
      console.warn("AI Rate Limited during rebalance. Returning existing plan with offline tweaks.");
      const rawPlan = existingPlan?.plan || existingPlan || [];
      parsedPlan = Array.isArray(rawPlan) ? rawPlan.map(day => ({
        ...day,
        tasks: Array.isArray(day.tasks) ? day.tasks.map(task => ({
          ...task,
          reason: "(Offline Mock Rebalance) " + task.reason
        })) : []
      })) : [];
    } else {
      console.error("AI Rebalance Fetch/Parsing Error:", error.message);
      parsedPlan = existingPlan?.plan || existingPlan || [];
    }
  }

  // Return response as JSON
  res.status(200).json({
    success: true,
    plan: parsedPlan,
  });
});
