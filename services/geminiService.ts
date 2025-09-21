import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

// FIX: Initialize GoogleGenAI with process.env.API_KEY directly and remove manual checks, as per guidelines.
// The guidelines state to assume process.env.API_KEY is always available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateQuiz = async (topic: string, questionCount: number, language: string): Promise<Question[] | null> => {
  // FIX: Removed API key existence check and alert, as per guidelines.
  // The application should not handle API key configuration.

  const prompt = `Generate ${questionCount} multiple-choice questions about ${topic} in ${language}. Each question must have exactly 4 options. One option must be the correct answer.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The quiz question."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 possible answers."
              },
              correctAnswer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings from the 'options' array."
              }
            },
            required: ["question", "options", "correctAnswer"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const quizData = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(quizData)) {
        throw new Error("API did not return an array.");
    }

    return quizData.map((q: any) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    alert(`Failed to generate quiz. Please check the console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};