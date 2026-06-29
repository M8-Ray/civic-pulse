import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is missing on the server. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { url, base64, mimeType } = body;

    let base64Data = '';
    let mediaMimeType = '';

    if (url) {
      // Download preset image from Unsplash URL
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString('base64');
      mediaMimeType = response.headers.get('content-type') || 'image/jpeg';
    } else if (base64) {
      base64Data = base64;
      mediaMimeType = mimeType || 'image/jpeg';
    } else {
      return NextResponse.json(
        { error: "Missing image source. Provide either a 'url' or 'base64' payload." },
        { status: 400 }
      );
    }

    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey });

    // Request content generation using gemini-3.1-flash-lite
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mediaMimeType
          }
        },
        "Analyze this image of a civic issue (e.g. pothole, broken streetlight, trash overflow, water leak, fallen tree, traffic hazard) and return structured classification details."
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { 
              type: 'STRING', 
              description: 'Sleek, short title summarizing the hazard, e.g. "Clogged Sewer Grid" or "Deep Pothole Crater"' 
            },
            category: { 
              type: 'STRING', 
              enum: ['Infrastructure', 'Sanitation', 'Safety', 'Traffic', 'Environment'],
              description: 'The closest fitting civic department category.'
            },
            description: { 
              type: 'STRING', 
              description: 'A 1-2 sentence detailed description of the scene, highlighting specific hazards for repair crews.'
            }
          },
          required: ['title', 'category', 'description']
        }
      } as any
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Failed to receive a valid response from the Gemini vision model.");
    }

    // Parse structured JSON and randomly assign 'Medium' or 'High' severity
    const data = JSON.parse(responseText);
    data.severity = Math.random() < 0.5 ? 'Medium' : 'High';
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini scanning API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during AI image scanning." },
      { status: 500 }
    );
  }
}
