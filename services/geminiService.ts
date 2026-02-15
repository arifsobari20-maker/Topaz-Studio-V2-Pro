
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Custom error class for Gemini API issues
 */
export class GeminiError extends Error {
  constructor(public message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

// --- API KEY MANAGEMENT ---

// Internal pool for default access (Fallback)
const INTERNAL_KEY_POOL = [
  "AIzaSyBrXbDL4pykatiD68i3joepGIWU3KtEBa0",
  "AIzaSyCB1X5fQ7mE-EHUoNKO9_vKl_sIetr7IHo",
  "AIzaSyAiYdY0ioPbmugKmN0kqp8Y0QtDUhOYeOE",
  "AIzaSyAffTjtgYFcrErFZ5hlYkvB2kgD5S0yrDE",
  "AIzaSyApxwdxGRn931d2qpI0xpnD-eTtLbBdCKg"
];

// State to track rotation index for internal pool
let internalKeyIndex = 0;
const exhaustedKeys = new Set<number>();

// Helper to get User Key from LocalStorage safely with Deep Cleaning
const getStoredUserKey = (): string | null => {
    if (typeof window !== 'undefined') {
        const key = localStorage.getItem('TOPAZ_USER_GEMINI_KEY');
        // Regex to remove newlines, spaces, and non-printable chars
        if (key) {
            const cleanKey = key.replace(/\s/g, '').trim();
            if (cleanKey.length > 10) return cleanKey;
        }
    }
    return null;
};

/**
 * Sets the Custom User API Key.
 * If provided, this key takes precedence over the internal pool.
 */
export const setCustomApiKey = (key: string | null) => {
    if (typeof window !== 'undefined') {
        if (key && key.trim().length > 0) {
            const cleanKey = key.replace(/\s/g, '').trim();
            localStorage.setItem('TOPAZ_USER_GEMINI_KEY', cleanKey);
            console.log("[SYSTEM] Custom API Key Saved (Cleaned)");
        } else {
            localStorage.removeItem('TOPAZ_USER_GEMINI_KEY');
            console.log("[SYSTEM] Custom API Key Removed");
        }
    }
};

/**
 * Checks if a custom key is currently set
 */
export const hasCustomApiKey = (): boolean => {
    return !!getStoredUserKey();
};

/**
 * Retrieves the current active API key.
 */
const getActiveApiKey = () => {
    const userKey = getStoredUserKey();
    if (userKey) return userKey;
    if (process.env.API_KEY) return process.env.API_KEY;
    return INTERNAL_KEY_POOL[internalKeyIndex];
};

/**
 * Rotates to the next available API Key in the internal pool.
 */
const rotateApiKey = () => {
    if (hasCustomApiKey()) {
        console.warn("[API ERROR] Custom User API Key failed.");
        return;
    }

    exhaustedKeys.add(internalKeyIndex);
    const oldIndex = internalKeyIndex;
    let nextIndex = (internalKeyIndex + 1) % INTERNAL_KEY_POOL.length;
    let attempts = 0;
    
    while (exhaustedKeys.has(nextIndex) && attempts < INTERNAL_KEY_POOL.length) {
        nextIndex = (nextIndex + 1) % INTERNAL_KEY_POOL.length;
        attempts++;
    }
    
    if (attempts === INTERNAL_KEY_POOL.length) {
        exhaustedKeys.clear();
        nextIndex = (oldIndex + 1) % INTERNAL_KEY_POOL.length;
    }

    internalKeyIndex = nextIndex;
    console.warn(`[API ROTATION] Switched Default Key #${oldIndex + 1} to #${internalKeyIndex + 1}`);
};

/**
 * Utility for exponential backoff retries with Key Rotation.
 */
const fetchWithRetry = async <T>(fn: (apiKey: string) => Promise<T>, maxRetries = 2, initialDelay = 1000): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const currentKey = getActiveApiKey();
      return await fn(currentKey);
    } catch (error: any) {
      lastError = error;
      
      const errorString = JSON.stringify(error).toLowerCase();
      
      // Check for Invalid Key specifically
      if (errorString.includes("api key not valid") || (error.status === 400 && errorString.includes("key"))) {
          if (hasCustomApiKey()) {
              throw new GeminiError("API Key Invalid. Cek kembali key Anda.", 400);
          }
      }

      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 ||
        errorString.includes('429') ||
        errorString.includes('quota');
      
      if (isRateLimit) {
         if (!hasCustomApiKey()) {
             rotateApiKey();
         }
         const backoff = initialDelay * Math.pow(1.5, i);
         await new Promise(resolve => setTimeout(resolve, backoff)); 
         continue; 
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// --- HELPER FUNCTIONS ---

const createWavHeader = (dataLength: number, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16) => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  return header;
};

// --- MAIN FUNCTIONS ---

/**
 * Generates an image with Model Fallback
 */
export const generateImage = async (prompt: string, images?: { base64: string, mimeType: string }[], config?: any) => {
  return fetchWithRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const parts: any[] = [{ text: prompt }];
    if (images && images.length > 0) {
      images.forEach(img => {
        parts.push({
          inlineData: { data: img.base64, mimeType: img.mimeType }
        });
      });
    }

    // Try models in order: 2.5 Image -> 2.0 Flash (Multimodal)
    const modelsToTry = ['gemini-2.5-flash-image', 'gemini-2.0-flash-exp'];
    
    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
              model: modelName, 
              contents: { parts },
              config: {
                imageConfig: modelName.includes('image') ? { aspectRatio: config?.aspectRatio || "1:1" } : undefined
              }
            });

            if (response.candidates?.[0]?.content?.parts) {
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                  return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType
                  };
                }
              }
            }
        } catch (e: any) {
            console.warn(`Model ${modelName} failed, trying next...`, e.message);
            // If it's the last model, throw
            if (modelName === modelsToTry[modelsToTry.length - 1]) throw e;
        }
    }
    throw new Error("Failed to generate image with all available models.");
  });
};

/**
 * Generates text with Robust Model Fallback
 */
export const generateText = async (prompt: string, images?: { base64: string, mimeType: string }[]) => {
  return fetchWithRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let contents: any;
    if (images && images.length > 0) {
      contents = {
        parts: [
          { text: prompt },
          ...images.map(img => ({
            inlineData: { data: img.base64, mimeType: img.mimeType }
          }))
        ]
      };
    } else {
      contents = prompt;
    }

    // LIST OF MODELS TO TRY IN ORDER
    // 1. Gemini 3 (Bleeding Edge) - If Key supports it
    // 2. Gemini 2.0 Flash (Experimental) - Very capable
    // 3. Gemini 1.5 Flash (Stable) - The workhorse
    const textModels = ['gemini-3-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];

    for (const model of textModels) {
        try {
            // console.log(`Attempting generation with ${model}...`);
            const response = await ai.models.generateContent({
                model: model,
                contents,
            });
            return response.text; // Success
        } catch (e: any) {
            const errStr = JSON.stringify(e).toLowerCase();
            // If error is 404 (Model not found) or 400 (Bad Request/Invalid arg), it often means the key doesn't support the model.
            // We continue to the next model.
            // If error is 429 (Quota), we might want to stop or retry (handled by fetchWithRetry wrapper).
            
            console.warn(`[Fallback System] Model ${model} failed:`, e.message);
            
            if (model === textModels[textModels.length - 1]) {
                // All failed
                throw e; 
            }
        }
    }
    throw new Error("All text models failed.");
  });
};

/**
 * Generates Speech (TTS) from text
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  return fetchWithRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const wavHeader = createWavHeader(bytes.length);
    const wavBlob = new Blob([wavHeader, bytes], { type: 'audio/wav' });

    return wavBlob; 
  });
};

/**
 * Generates Multi-Speaker Speech (Dialog)
 */
export const generateMultiSpeakerConversation = async (dialogueItems: {speaker: string, text: string}[], mode: 'MF' | 'MM') => {
  return fetchWithRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const uniqueSpeakers = Array.from(new Set(dialogueItems.map(d => d.speaker)));
    let speakerA = uniqueSpeakers[0] || 'Speaker1';
    let speakerB = uniqueSpeakers[1] || 'Speaker2';

    const promptText = dialogueItems.map(d => `${d.speaker}: "${d.text}"`).join('\n');

    const maleVoices = ['Puck', 'Fenrir', 'Charon'];
    const femaleVoices = ['Zephyr', 'Kore', 'Aoede']; 

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    let voiceNameA: string;
    let voiceNameB: string;

    if (mode === 'MF') {
        voiceNameA = getRandom(maleVoices);
        voiceNameB = getRandom(femaleVoices);
    } else {
        voiceNameA = getRandom(maleVoices);
        const remainingMales = maleVoices.filter(v => v !== voiceNameA);
        voiceNameB = remainingMales.length > 0 ? getRandom(remainingMales) : voiceNameA;
    }

    const speakerConfigs = [
        {
            speaker: speakerA,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceNameA } }
        },
        {
            speaker: speakerB,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceNameB } }
        }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: speakerConfigs
            }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No multi-speaker audio returned");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const wavHeader = createWavHeader(bytes.length);
    const wavBlob = new Blob([wavHeader, bytes], { type: 'audio/wav' });

    return wavBlob;
  });
};

/**
 * Generates Video using Veo 3.1
 */
export const generateVideo = async (
  prompt: string, 
  imageBase64?: string, 
  aspectRatio: '9:16' | '16:9' = '9:16',
  resolution: '720p' | '1080p' = '720p',
  engine: 'fast' | 'quality' = 'fast'
) => {
  return fetchWithRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    try {
      let operation = await ai.models.generateVideos({
        model: engine === 'quality' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Cinematic movement, high quality',
        image: imageBase64 ? {
          imageBytes: imageBase64,
          mimeType: 'image/png',
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: resolution,
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 15000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) return null;

      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      if (!response.ok) throw new GeminiError('Failed to download video data', response.status);
      
      const videoBlob = await response.blob();
      return URL.createObjectURL(videoBlob);
    } catch (error: any) {
      throw error;
    }
  });
};

/**
 * Metadata Service using Gemini JSON mode
 */
export const generateMetadataForStock = async (base64: string, mimeType: string, isAi: boolean) => {
  return fetchWithRetry(async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const categoryList = `
      1: Animals, 2: Buildings/Architecture, 3: Business/Money, 4: Drinks/Beverages, 5: Environment/Ecology, 
      6: States of Mind/Emotions, 7: Food, 8: Graphic Resources/Backgrounds, 9: Hobbies/Leisure, 10: Industry/Craft, 
      11: Landscapes/Nature, 12: Lifestyle, 13: People, 14: Plants/Flowers, 15: Culture/Religion, 16: Science/Technology,
      17: Social Issues, 18: Sports, 19: Technology, 20: Transport, 21: Travel/Vacation
    `;

    const aiInstructions = isAi 
      ? `IMPORTANT (AI CONTENT): 
         1. The Title MUST end with the exact suffix " - Generative AI".
         2. The Keywords MUST include ini tags at the beginning: "generative ai", "ai generated", "ai art", "digital art", "illustration".`
      : `IMPORTANT (REAL PHOTO):
         1. Do NOT include any AI-related terms in Title or Keywords. Focus on authenticity, depth of field, and real-world details.`;

    const prompt = `
      Act as a Senior Microstock SEO Specialist for Adobe Stock.
      Analyze the provided image and generate metadata to MAXIMIZE SALES (Downloads).

      ${aiInstructions}

      OUTPUT REQUIREMENTS (Strict JSON):
      1. title: Commercial, descriptive, concise (Max 70 characters). Subject + Action + Context. English Language.
      2. keywords: Generate exactly 45 to 49 keywords. Sorted by relevance (Most important first). Separated by commas. English.
      3. category_id: Select the single best integer ID from this list: [${categoryList}]. Return ONLY the number (e.g., 11).
    `;
    
    // Fallback logic for JSON mode as well
    const models = ['gemini-3-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
    let lastError;

    for (const m of models) {
        try {
            const response = await ai.models.generateContent({
              model: m,
              contents: {
                parts: [
                  { text: prompt },
                  { inlineData: { data: base64, mimeType } }
                ]
              },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    keywords: { type: Type.STRING },
                    category_id: { type: Type.NUMBER }
                  },
                  required: ["title", "keywords", "category_id"]
                }
              }
            });
            const json = JSON.parse(response.text || "{}");
            if (json.keywords && Array.isArray(json.keywords)) {
                json.keywords = json.keywords.join(', ');
            }
            return json;
        } catch (e: any) {
            lastError = e;
            console.warn(`Metadata gen failed on ${m}, retrying...`);
        }
    }
    throw lastError || new Error("Failed to generate metadata");
  });
};
