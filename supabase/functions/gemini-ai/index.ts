import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPOSITORY_GUARDRAIL = `CRITICAL INSTRUCTIONS — YOU MUST FOLLOW THESE RULES:
1. You may ONLY reference content from the provided chapter text below. Do NOT reference external websites, journals, textbooks, or any source not explicitly provided.
2. Every factual claim must cite the source as: [Source: "{bookTitle}" — Chapter: "{chapterTitle}"]
3. If the answer cannot be found in the provided content, respond with: "This information is not covered in the current chapter. Please refer to the relevant section of your institutional compliance library."
4. Never fabricate regulatory codes, standards, or citations. Only extract what is explicitly stated in the content.
5. All responses are for educational reference only and do not constitute legal or medical advice.`;

function buildSystemPrompt(type: string, chapterTitle: string, bookTitle: string, contentSnippet: string): string {
  const guardrail = REPOSITORY_GUARDRAIL.replace("{bookTitle}", bookTitle).replace("{chapterTitle}", chapterTitle);
  const baseContext = `\n\nChapter: "${chapterTitle}" from "${bookTitle}"\n\nChapter Content:\n${contentSnippet}`;

  switch (type) {
    case "summary":
      return `${guardrail}\n\nYou are a medical education AI assistant. Summarize the following medical textbook chapter in a well-structured format. Include:\n- A brief overview (2-3 sentences)\n- Core Concepts (bullet points)\n- Clinical Significance\n- Key Takeaways (numbered list)\n\n[Source: "${bookTitle}" — Chapter: "${chapterTitle}"]${baseContext}`;

    case "compliance":
      return `${guardrail}\n\nYou are a clinical compliance AI assistant specialized in healthcare regulatory compliance. Extract ALL compliance-relevant points from this chapter. Structure your response as follows:

## JCAHO Standards
For each applicable standard, provide:
- Standard code (e.g., PC.01.02.03) if identifiable from context
- Requirement description
- ⚠️ Severity: CRITICAL / HIGH / MODERATE

## CMS Conditions of Participation
- Identify any CMS regulatory requirements referenced or implied
- Mark with ✅ for met requirements, ❌ for gaps

## OSHA Requirements
- Workplace safety compliance points
- Personal protective equipment requirements
- Hazard communication standards

## Documentation Requirements 📋
- What must be documented per regulations
- Required forms, checklists, or records
- Retention requirements if mentioned

## Risk Indicators 🔴
- Areas where non-compliance could trigger citations
- Common audit findings related to this content
- Recommended corrective actions

Each point must include a severity level and cite the source chapter.

[Source: "${bookTitle}" — Chapter: "${chapterTitle}"]${baseContext}`;

    case "qa":
      return `${guardrail}\n\nYou are a pharmacology AI assistant. Analyze medications and drug interactions from this chapter. Include:\n- Key Drug Considerations\n- Common Interactions to Watch (numbered)\n- Monitoring Parameters\n- Dosage Guidelines if applicable\n\n[Source: "${bookTitle}" — Chapter: "${chapterTitle}"]${baseContext}`;

    case "general":
      return `${guardrail}\n\nYou are a medical education AI assistant. Create a concise study guide for this chapter. Include:\n- Learning Objectives\n- Key Terms and Definitions\n- Important Concepts for Exam Preparation\n- Clinical Application Points\n- Review Questions (2-3)\n\n[Source: "${bookTitle}" — Chapter: "${chapterTitle}"]${baseContext}`;

    case "search":
      return `You are an expert compliance library search assistant. The user is searching across a medical compliance library. Your job is to understand the USER'S INTENT and find ALL relevant books — even if the exact keywords don't appear in the catalog.

CRITICAL: You MUST respond with a valid JSON ARRAY. Start your response with [ and end with ]. No markdown, no explanation, no wrapping object.

Example response format:
[
  {
    "bookId": "the-id-from-catalog",
    "title": "Book Title",
    "specialty": "Specialty area",
    "collection": null,
    "relevanceScore": 85,
    "reason": "2-3 sentence explanation of WHY this is relevant",
    "chapters": [
      { "id": "chapter-id", "title": "Chapter Title", "reason": "Brief reason" }
    ]
  }
]

SEARCH STRATEGY — think broadly:
1. DIRECT matches: Books whose title, description, or tags directly mention the query topic
2. CONTEXTUAL matches: Books that WOULD contain information about the topic even if not explicitly mentioned
3. REGULATORY matches: Books about compliance standards that would apply to the query topic
4. RELATED matches: Books covering related clinical areas

Rules:
- ALWAYS return at least 3-5 results for any reasonable medical query
- Use the bookId exactly as it appears in the catalog data
- Include chapter-level matches when chapter data is available
- relevanceScore 0-100: direct match 80-100, contextual 50-79, tangential 30-49
- Order by relevanceScore descending
- Maximum 8 results
- If truly nothing matches, return []

Catalog data:\n${contentSnippet}`;

    default:
      return `${guardrail}\n\nYou are a medical education AI assistant. Answer the user's question accurately based ONLY on the provided chapter content. If the answer is not in the content, say so clearly.\n\n[Source: "${bookTitle}" — Chapter: "${chapterTitle}"]${baseContext}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, chapterContent, chapterTitle, bookTitle, type, bookId, chapterId, userId, enterpriseId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "No AI API key configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentSnippet = chapterContent?.slice(0, type === "search" ? 12000 : 4000) || "";
    const systemPrompt = buildSystemPrompt(type || "default", chapterTitle || "", bookTitle || "", contentSnippet);
    const userMessage = prompt || "Please analyze this chapter.";

    const startTime = Date.now();

    let apiUrl: string;
    let headers: Record<string, string>;
    let model: string;

    if (LOVABLE_API_KEY) {
      // Use Lovable AI gateway
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      headers = {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      };
      model = "google/gemini-2.5-flash";
    } else {
      // Fallback to direct Gemini API
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;
      headers = {
        "x-goog-api-key": GEMINI_API_KEY!,
        "Content-Type": "application/json",
      };
      model = "gemini-2.5-flash";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: type === "search" ? 0.2 : 0.4,
        max_tokens: 2048,
        ...(type === "search" ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error", details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "No response generated.";
    const tokensUsed = data?.usage?.total_tokens || null;

    // Log to database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      await supabaseAdmin.from("ai_query_logs").insert({
        book_id: bookId || "unknown",
        book_title: bookTitle || "Unknown",
        chapter_id: chapterId || "unknown",
        chapter_title: chapterTitle || "Unknown",
        query_type: type || "default",
        user_prompt: prompt || null,
        ai_response: content.slice(0, 10000),
        response_time_ms: responseTimeMs,
        model_used: LOVABLE_API_KEY ? "lovable/gemini-2.5-flash" : "gemini-2.5-flash",
        tokens_used: tokensUsed,
        user_id: userId || null,
        enterprise_id: enterpriseId || null,
      });
    } catch (logErr) {
      console.error("Failed to log AI query:", logErr);
    }

    // For search type, try to parse structured results
    if (type === "search") {
      try {
        const parsed = JSON.parse(content);
        let results: any[] = [];
        if (Array.isArray(parsed)) {
          results = parsed;
        } else if (parsed.results && Array.isArray(parsed.results)) {
          results = parsed.results;
        } else if (parsed.bookId || parsed.title) {
          results = [parsed];
        }
        return new Response(JSON.stringify({ content, results, responseTimeMs }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        try {
          const arrayMatch = content.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            const results = JSON.parse(arrayMatch[0]);
            return new Response(JSON.stringify({ content, results: Array.isArray(results) ? results : [results], responseTimeMs }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          const objMatch = content.match(/\{[\s\S]*\}/);
          if (objMatch) {
            const obj = JSON.parse(objMatch[0]);
            if (obj.bookId || obj.title) {
              return new Response(JSON.stringify({ content, results: [obj], responseTimeMs }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        } catch { /* fall through */ }
      }
    }

    return new Response(JSON.stringify({ content, responseTimeMs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gemini-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
