
import { GoogleGenAI, Type } from "@google/genai";
import { TimetableData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTimetableData(
  prompt: string, 
  grade: string, 
  filePart?: { inlineData: { data: string, mimeType: string } }
): Promise<TimetableData> {
  
  const textPart = {
    text: `Based on the following request and optional document data: "${prompt}", generate a JSON structure for a sample school timetable. 
    If a document is provided, extract the real classes, times, teachers, and classrooms from it.
    Make sure it includes Monday to Friday, usually 6-8 classes per day as found in the document. 
    Use Chinese for all text.
    Do NOT include any reminder columns or remark fields.
    The response should be strictly JSON.`
  };

  const contents = filePart 
    ? { parts: [filePart, textPart] }
    : { parts: [textPart] };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          weekSchedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                courses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      name: { type: Type.STRING },
                      teacher: { type: Type.STRING },
                      classroom: { type: Type.STRING },
                      icon: { type: Type.STRING, description: "emoji icon for the subject" }
                    },
                    required: ["time", "name"]
                  }
                }
              },
              required: ["day", "courses"]
            }
          },
          motto: { type: Type.STRING }
        },
        required: ["title", "weekSchedule"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}
