import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NutrientData {
  name: string;
  amount: number; // in grams or milligrams
  unit: string;
  percentage: number; // percentage of total weight or daily value? Let's go with percentage of total weight for the "proportion-wise" request
}

export interface FruitNutrition {
  fruitName: string;
  servingSize: string; // e.g., "100g"
  nutrients: NutrientData[];
  summary: string;
}

export async function getFruitNutrition(fruitName: string): Promise<FruitNutrition> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("API_KEY_MISSING");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide detailed nutritional information for 100g of ${fruitName}. 
    Include major nutrients (Carbohydrates, Proteins, Fats, Fiber, Sugar, Water) and key vitamins/minerals.
    For each nutrient, provide the amount in grams (or appropriate unit) and its percentage relative to the total 100g weight.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fruitName: { type: Type.STRING },
          servingSize: { type: Type.STRING },
          summary: { type: Type.STRING },
          nutrients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                percentage: { type: Type.NUMBER },
              },
              required: ["name", "amount", "unit", "percentage"],
            },
          },
        },
        required: ["fruitName", "servingSize", "nutrients", "summary"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as FruitNutrition;
}
