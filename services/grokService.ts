
/**
 * Service for handling Grok (xAI) API interactions.
 * Endpoint: https://api.x.ai/v1/chat/completions
 */

export class GrokError extends Error {
    constructor(public message: string, public status?: number) {
      super(message);
      this.name = 'GrokError';
    }
}
  
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

// Helper to get User Key from LocalStorage safely
const getStoredGrokKey = (): string | null => {
    if (typeof window !== 'undefined') {
        const key = localStorage.getItem('TOPAZ_USER_GROK_KEY');
        if (key && key.trim().length > 0) return key.trim();
    }
    return null;
};

/**
* Sets the Custom Grok API Key.
*/
export const setCustomGrokKey = (key: string | null) => {
    if (typeof window !== 'undefined') {
        if (key && key.trim().length > 0) {
            localStorage.setItem('TOPAZ_USER_GROK_KEY', key.trim());
            console.log("[SYSTEM] Grok API Key Saved");
        } else {
            localStorage.removeItem('TOPAZ_USER_GROK_KEY');
            console.log("[SYSTEM] Grok API Key Removed");
        }
    }
};

/**
* Checks if a custom key is currently set
*/
export const hasCustomGrokKey = (): boolean => {
    return !!getStoredGrokKey();
};

/**
* Generates text completion using Grok API.
* Fallback logic should be handled in the UI/App layer (fallback to Gemini).
*/
export const generateGrokResponse = async (
    prompt: string, 
    systemInstruction?: string
): Promise<string> => {
    const apiKey = getStoredGrokKey();
    
    if (!apiKey) {
        throw new GrokError("Grok API Key not found");
    }

    try {
        const response = await fetch(GROK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: systemInstruction || "You are Grok, an AI modeled after the Hitchhiker's Guide to the Galaxy."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "grok-beta", // Or "grok-2-latest"
                stream: false,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Detect auth error to help user
            if (response.status === 401 || response.status === 403) {
                throw new GrokError("Invalid API Key (Grok)", response.status);
            }
            throw new GrokError(
                errorData.error?.message || `Grok API Error: ${response.status}`, 
                response.status
            );
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";

    } catch (error: any) {
        console.error("Grok Service Error:", error);
        throw error;
    }
};
