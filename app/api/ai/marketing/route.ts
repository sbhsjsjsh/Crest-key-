import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      brokerageName,
      title,
      address,
      city,
      price,
      bhk,
      baths,
      sqft,
      category,
      highlights,
      reraCode,
      tone = 'Luxury Indian Editorial',
    } = body;

    if (!title || !address) {
      return NextResponse.json(
        { error: 'Property title and address are required.' },
        { status: 400 }
      );
    }

    const numericPrice = Number(price || 0);
    const inrFormatted =
      numericPrice >= 1_00_00_000
        ? `₹${(numericPrice / 1_00_00_000).toFixed(2)} Crore`
        : `₹${(numericPrice / 1_00_000).toFixed(2)} Lakh`;

    const ai = getGeminiClient();
    const prompt = `Write Indian real estate marketing copy for the following property represented by ${
      brokerageName || 'our brokerage'
    }.
Tone: ${tone}.
Property Title: ${title}
Location: ${address}, ${city}
RERA Registration ID: ${reraCode || 'Available on request'}
Asking Price: ${inrFormatted} (₹${numericPrice.toLocaleString('en-IN')})
Category: ${category}
Specs: ${bhk > 0 ? `${bhk} BHK` : 'Commercial Floorplate'}, ${baths} Bathrooms, ${Number(
      sqft || 0
    ).toLocaleString('en-IN')} Sq. Ft.
Key Highlights: ${highlights}

Use natural Indian real estate terminology (Crores/Lakhs, BHK, RERA-compliant, Carpet/Super Built-up, Vastu, Site Visit) without exaggerated hype or exclamation spam.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a senior Indian real estate marketing director crafting property portal descriptions (99acres / Magicbricks / Housing), WhatsApp broadcast forwards for channel partners & HNI buyers, and private NRI/client email invitations.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            portalDescription: {
              type: Type.STRING,
              description:
                'Polished property portal listing description (99acres/Magicbricks) under 160 words.',
            },
            whatsappBroadcast: {
              type: Type.STRING,
              description:
                'Crisp WhatsApp broadcast message formatted for Indian buyers and channel partners with key specs and price in Cr/L.',
            },
            emailSubject: {
              type: Type.STRING,
              description: 'Understated email subject line for HNI and NRI buyer lists.',
            },
            emailBody: {
              type: Type.STRING,
              description: 'Short private client invitation email to schedule a site visit.',
            },
          },
          required: ['portalDescription', 'whatsappBroadcast', 'emailSubject', 'emailBody'],
        },
      },
    });

    const jsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unable to generate listing marketing copy.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
