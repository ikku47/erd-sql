import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize Gemini Client
// Note: API Key is accessed via process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a senior database architect. Your goal is to analyze SQL dump files to extract the schema structure and provide high-quality, actionable optimization suggestions.
Analyze the SQL strictly.
For schema extraction: Identify tables, columns, primary keys, and foreign key relationships.
For optimizations: Look for missing indexes on foreign keys, inappropriate data types, lack of constraints, opportunities for normalization, and potential query performance bottlenecks.
`;

export const analyzeSqlDump = async (sqlContent: string): Promise<AnalysisResult> => {
  const modelId = 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Analyze the following SQL dump content. 
    
    1. Extract the Database Schema (tables, columns with types/constraints, and relationships).
    2. Provide a list of Optimization Suggestions categorized by Performance, Security, Normalization, or Storage. 
       Include specific SQL queries to implement the fixes where applicable.

    SQL Content:
    ${sqlContent.substring(0, 30000)} 
    (Content truncated to first 30k chars for safety, infer rest if incomplete)
    `,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          schema: {
            type: Type.OBJECT,
            properties: {
              tables: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    columns: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          type: { type: Type.STRING },
                          isPk: { type: Type.BOOLEAN },
                          isFk: { type: Type.BOOLEAN },
                          nullable: { type: Type.BOOLEAN },
                        },
                        required: ["name", "type"]
                      }
                    }
                  },
                  required: ["name", "columns"]
                }
              },
              relationships: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sourceTable: { type: Type.STRING },
                    targetTable: { type: Type.STRING },
                    sourceColumn: { type: Type.STRING },
                    targetColumn: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["1:1", "1:N", "N:M"] }
                  },
                  required: ["sourceTable", "targetTable"]
                }
              }
            },
            required: ["tables", "relationships"]
          },
          optimizations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Performance", "Security", "Normalization", "Storage"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                sqlCode: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["category", "title", "description", "impact"]
            }
          }
        },
        required: ["schema", "optimizations"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse analysis result");
  }
};
