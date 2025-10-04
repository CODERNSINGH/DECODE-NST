import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { issue, assigneeActivity, repoStats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Analyze this GitHub issue and predict if the assigned user will solve it.

Issue Details:
- Title: ${issue.title}
- Issue #${issue.number}
- State: ${issue.state}
- Assigned to: ${issue.assignee?.login || 'unassigned'}
- Created: ${issue.created_at}
- Last updated: ${issue.updated_at}
- Comments: ${issue.comments}
- Has PR linked: ${issue.pull_request ? 'yes' : 'no'}

Assignee Activity:
- Total contributions: ${assigneeActivity?.contributions || 0}
- Recent activity (last 30 days): ${assigneeActivity?.recentActivity || 'unknown'}
- Other assigned issues: ${assigneeActivity?.otherAssignedIssues || 0}

Repository Stats:
- Average time to close: ${repoStats?.avgTimeToClose || 'unknown'}
- Total open issues: ${repoStats?.openIssues || 0}

Based on this data, provide a JSON response with:
1. completionProbability: number 0-100 (likelihood issue will be solved)
2. estimatedDays: number (estimated days to completion)
3. isUserActive: boolean (is the assigned user currently active)
4. risk: "low" | "medium" | "high" (risk of becoming stale)
5. reasoning: string (brief explanation 1-2 sentences)
6. recommendation: string (actionable advice for maintainers)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes GitHub issues and predicts outcomes. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
