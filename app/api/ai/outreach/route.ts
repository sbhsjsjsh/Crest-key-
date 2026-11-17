import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      brokerageName,
      agentName,
      clientName,
      intent,
      stage,
      budget,
      notes,
      matchedPropertyTitle,
      matchedPropertyAddress,
      matchedPropertyPrice,
    } = body;

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required.' },
        { status: 400 }
      );
    }

    const formatInr = (val: number) =>
      val >= 1_00_00_000
        ? `₹${(val / 1_00_00_000).toFixed(2)} Cr`
        : `₹${(val / 1_00_000).toFixed(2)} L`;

    const matchedPrice = Number(matchedPropertyPrice || 0);
    const propertyContext = matchedPropertyTitle
      ? `Matched Property: ${matchedPropertyTitle} at ${matchedPropertyAddress} (${formatInr(
          matchedPrice
        )}).`
      : 'No specific property matched yet; offer curated RERA-approved options or a consultation.';

    const ai = getGeminiClient();
    const prompt = `Draft a follow-up WhatsApp message and email from ${
      agentName || 'the advisor'
    } at ${brokerageName || 'the brokerage'} in India.
Client: ${clientName}
Intent: ${intent}
Pipeline Stage: ${stage}
Target Budget: ${formatInr(Number(budget || 0))}
Advisor Notes: ${notes || 'None provided'}
${propertyContext}

Write a warm, respectful, high-trust Indian real estate message (e.g., "Hi [Name]," polite tone, offering site visit / video walkthrough / RERA floor plan) tailored to their pipeline stage.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a top-producing Indian real estate advisor writing direct WhatsApp and email follow-ups. Keep WhatsApp messages natural, concise (under 65 words), and respectful, with one clear next step like a site visit or call.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatsappDraft: {
              type: Type.STRING,
              description: 'Concise, polite WhatsApp follow-up message under 65 words.',
            },
            emailSubject: {
              type: Type.STRING,
              description: 'Clear, personalized email subject line.',
            },
            emailBody: {
              type: Type.STRING,
              description: 'Consultative email follow-up with a clear site visit or call CTA.',
            },
          },
          required: ['whatsappDraft', 'emailSubject', 'emailBody'],
        },
      },
    });

    const jsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unable to generate client follow-up draft.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
