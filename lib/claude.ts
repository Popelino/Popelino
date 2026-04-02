import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ModerationResult {
  isFlagged: boolean;
  reason: string | null;
  confidence: "high" | "medium" | "low";
  analysis: string;
}

/**
 * Uses Claude to check if a review is relevant and genuine for the given place type.
 * Flags reviews that:
 *  - Mention wrong venue type (e.g. "food quality" on a bar that serves only drinks)
 *  - Are nonsensical, spam, or clearly fake
 *  - Contain contradictions that don't match the place category
 */
export async function moderateReview(
  reviewContent: string,
  rating: number,
  placeName: string,
  placeType: string,
  placeDescription: string
): Promise<ModerationResult> {
  const prompt = `You are a review moderation assistant for TrustTaste, a food and bar rating platform.

Your job is to check whether a customer review is GENUINE and RELEVANT for the establishment it targets.

ESTABLISHMENT DETAILS:
- Name: ${placeName}
- Type: ${placeType}
- Description: ${placeDescription}

REVIEW (${rating}/5 stars):
"${reviewContent}"

INSTRUCTIONS:
1. Check if the review content is relevant to this type of establishment.
   - Example of WRONG: A review mentioning "the food was cold and the steak was overcooked" for a BAR that clearly only serves drinks, not food.
   - Example of WRONG: A review about "waiting too long for service" at a place described as a fast self-service café.
2. Check for obvious spam, hate speech, or completely nonsensical content.
3. Check if the rating (${rating}/5) is roughly consistent with the review sentiment.
   - Example of SUSPICIOUS: Rating 5 stars but writing "this place was horrible".

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{
  "isFlagged": true or false,
  "reason": "short reason if flagged, null if not flagged",
  "confidence": "high" or "medium" or "low",
  "analysis": "1-2 sentence summary of your assessment"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(text.trim()) as ModerationResult;
    return result;
  } catch (error) {
    console.error("Claude moderation error:", error);
    // On error, don't block the review — return not flagged
    return {
      isFlagged: false,
      reason: null,
      confidence: "low",
      analysis: "Moderation check could not be completed.",
    };
  }
}
