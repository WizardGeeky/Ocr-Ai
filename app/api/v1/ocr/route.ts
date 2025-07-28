import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ message: "No image data provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // 2.5-flash is not valid

    const prompt = `You are an OCR extraction AI. Extract structured fields like:
- fullName
- dateOfBirth
- documentNumber
- address
- typeOfDocument

Return it in JSON format.`

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: image,
              },
            },
          ],
        },
      ],
    });

    const text = result.response.text();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Failed to parse response as JSON. Raw response: " + text);
    }

    const json = JSON.parse(match[0]);

    return NextResponse.json({ data: json }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Something went wrong." }, { status: 500 });
  }
}
