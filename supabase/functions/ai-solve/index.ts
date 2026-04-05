// @ts-ignore - Deno imports will show errors in standard Node TS environments
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Declaration fallback for VS Code if Deno extension is taking time
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function getMaxRating(aiScore: number): number {
  if (aiScore <= 20) return 1;
  if (aiScore <= 40) return 2;
  if (aiScore <= 60) return 3;
  if (aiScore <= 80) return 4;
  return 5;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    // Rate action: validate and enforce AI-score-based limits
    if (action === "rate") {
      const { solutionId, score, comment } = body;
      if (!solutionId || typeof score !== "number" || score < 1 || score > 5) {
        return new Response(JSON.stringify({ error: "Invalid rating data" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = claimsData.claims.sub;

      // Fetch solution's AI score
      const { data: solution } = await supabaseClient
        .from("solutions")
        .select("ai_score, user_id")
        .eq("id", solutionId)
        .single();

      if (!solution) {
        return new Response(JSON.stringify({ error: "Solution not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (solution.user_id === userId) {
        return new Response(JSON.stringify({ error: "Cannot rate your own solution" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const maxRating = getMaxRating(solution.ai_score ?? 50);
      if (score > maxRating) {
        return new Response(JSON.stringify({ error: `Rating exceeds allowed limit. Max allowed: ${maxRating}⭐ based on AI evaluation.`, maxRating }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert rating
      const { error: ratingError } = await supabaseClient.from("ratings").upsert({
        solution_id: solutionId,
        user_id: userId,
        score,
        comment: typeof comment === "string" ? comment.trim().slice(0, 500) || null : null,
      }, { onConflict: "solution_id,user_id" });

      if (ratingError) {
        return new Response(JSON.stringify({ error: ratingError.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, maxRating }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AI actions: suggest, improve, evaluate
    // AI actions: suggest, improve, evaluate, chat
    const { text, prompt, problemTitle, problemDescription } = body;

    // Determine system and user prompt based on action or direct prompt
    let systemPrompt = "You are a helpful and intelligent AI assistant.";
    let userPrompt = "";

    if (prompt) {
      userPrompt = prompt;
    } else {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Problem context or prompt is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sanitizedText = text.slice(0, 10000);

      if (action === "suggest") {
        systemPrompt = "You are an expert problem-solving consultant. Provide specific, actionable suggestions to improve the user's solution. Be concise but thorough. Format with bullet points.";
        userPrompt = `Problem: "${problemTitle}" - ${problemDescription}\n\nCurrent solution draft:\n${sanitizedText}\n\nProvide specific suggestions to improve this solution.`;
      } else if (action === "improve") {
        systemPrompt = "You are an expert writer and problem solver. Rewrite and improve the given solution to be more comprehensive, well-structured, and impactful.";
        userPrompt = `Problem: "${problemTitle}" - ${problemDescription}\n\nOriginal solution:\n${sanitizedText}\n\nRewrite this solution to be significantly better.`;
      } else if (action === "evaluate") {
        systemPrompt = `You are an expert evaluator. You MUST respond with ONLY valid JSON (no markdown, no code blocks). Return exactly this structure:
{"relevance": <0-20>, "feasibility": <0-20>, "technical": <0-20>, "creativity": <0-20>, "clarity": <0-20>, "feedback": "<detailed feedback>"}

Criteria:
- relevance (0-20): How well does it address the stated problem?
- feasibility (0-20): How practical and implementable is the solution?
- technical (0-20): Technical depth and soundness
- creativity (0-20): Innovation and originality
- clarity (0-20): How well-written and structured`;
        userPrompt = `Problem: "${problemTitle}" - ${problemDescription}\n\nSolution to evaluate:\n${sanitizedText}\n\nReturn ONLY a JSON object with scores (0-20 each) for: relevance, feasibility, technical, creativity, clarity, and a "feedback" string.`;
      } else if (action === "chat") {
        systemPrompt = body.systemPrompt || "You are a helpful and intelligent AI assistant.";
        userPrompt = sanitizedText;
      } else {
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY configuration");
      throw new Error("GEMINI_API_KEY not configured");
    }

    let response;
    try {
      const finalPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
      console.log("Sending request to Gemini API...");
      
      response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: finalPrompt }]
            }
          ]
        })
      });
    } catch (fetchError) {
      console.error("Network Error reaching Gemini:", fetchError);
      return new Response(JSON.stringify({ error: "Unable to contact AI service." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Native Error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Gemini API Error: ${response.status} - ${errText}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    console.log("Gemini API responded successfully.");

    if (prompt) {
      return new Response(JSON.stringify({ reply: content, text: content }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "evaluate") {
      try {
        let jsonStr = content.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }
        const parsed = JSON.parse(jsonStr);

        // Server-side validation and clamping
        const relevance = clamp(parsed.relevance ?? 10, 0, 20);
        const feasibility = clamp(parsed.feasibility ?? 10, 0, 20);
        const technical = clamp(parsed.technical ?? 10, 0, 20);
        const creativity = clamp(parsed.creativity ?? 10, 0, 20);
        const clarity = clamp(parsed.clarity ?? 10, 0, 20);
        const score = relevance + feasibility + technical + creativity + clarity;

        const feedback = typeof parsed.feedback === "string" ? parsed.feedback : content;

        // If solutionId provided, save score via service role (prevents client tampering)
        if (body.solutionId) {
          const authHeader = req.headers.get("Authorization");
          if (authHeader?.startsWith("Bearer ")) {
            const supabaseAdmin = createClient(
              Deno.env.get("SUPABASE_URL")!,
              Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            const supabaseClient = createClient(
              Deno.env.get("SUPABASE_URL")!,
              Deno.env.get("SUPABASE_ANON_KEY")!,
              { global: { headers: { Authorization: authHeader } } }
            );
            const token = authHeader.replace("Bearer ", "");
            const { data: claimsData } = await supabaseClient.auth.getClaims(token);
            const userId = claimsData?.claims?.sub;

            if (userId) {
              await supabaseAdmin.from("solutions").update({
                ai_score: score,
                ai_feedback: feedback,
              }).eq("id", body.solutionId).eq("user_id", userId);
            }
          }
        }

        return new Response(JSON.stringify({
          score,
          criteria: { relevance, feasibility, technical, creativity, clarity },
          feedback,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ score: 50, criteria: { relevance: 10, feasibility: 10, technical: 10, creativity: 10, clarity: 10 }, feedback: content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-solve error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
