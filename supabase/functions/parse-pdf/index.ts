import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXTRACTION_PROMPT = `You are an expert medical librarian and document analyst. Analyze this PDF document and extract structured metadata and chapter/section information.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "Full title of the document",
  "subtitle": "Subtitle if present, otherwise empty string",
  "authors": ["Author Name 1", "Author Name 2"],
  "publisher": "Publisher name if identifiable",
  "isbn": "ISBN if found, otherwise empty string",
  "edition": "Edition info if found, otherwise empty string",
  "publishedYear": 2024,
  "description": "A concise 2-4 sentence description of what this document covers, who it is for, and its clinical relevance.",
  "specialty": "Primary medical specialty (e.g. Surgery, Internal Medicine, Emergency Medicine, Cardiology, etc.)",
  "detectedTags": ["tag1", "tag2"],
  "chapters": [
    {
      "title": "Chapter or section title",
      "pageNumber": 1,
      "contentSummary": "A 2-3 sentence summary of what this chapter/section covers"
    }
  ]
}

Guidelines:
- Extract the REAL title from the document content (title page, headers, running heads), not from the filename.
- For authors, look at the title page, copyright page, or author listings.
- For chapters: identify major sections, chapters, or logical divisions. If the PDF has a table of contents, use it. Otherwise infer from headings.
- For detectedTags, identify relevant medical topics from this list: pharmacology, surgical_procedures, patient_safety, infection_control, emergency_protocols, diagnostic_imaging, clinical_guidelines, drug_interactions, anesthesia, perioperative, respiratory, cardiovascular, endocrine, renal, neurology, oncology, pediatrics, obstetrics, orthopedics, dermatology, gastroenterology, hematology, immunology, psychiatry, rehabilitation, nutrition, wound_care, pain_management
- publishedYear should be a number. If unknown, use 0.
- Return AT LEAST 1 chapter entry even if the document appears to be a single section.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, fileName } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: "No PDF data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Parsing PDF: ${fileName}, base64 length: ${pdfBase64.length}`);

    // Use Gemini with PDF as inline data
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: EXTRACTION_PROMPT + `\n\nFilename for reference: "${fileName}"`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || "";

    console.log("Raw AI response length:", rawContent.length);

    // Parse JSON from the response (handle potential markdown fences)
    let parsed;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw:", rawContent.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response as JSON", raw: rawContent.slice(0, 1000) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("parse-pdf error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
