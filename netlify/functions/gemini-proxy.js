// netlify/functions/gemini-proxy.js
const fetchFn = globalThis.fetch;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: '{"error":"Method not allowed"}' };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { statusCode: 500, body: '{"error":"Missing GEMINI_API_KEY"}' };

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch { return { statusCode: 400, body: '{"error":"Invalid JSON"}' }; }

  const model = (body.model || "gemini-2.5-flash").replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  const contents = body.contents || [{ role: "user", parts: [{ text: body.prompt ?? "Hello" }] }];

  const requestBody = { contents };

  if (body.systemInstruction) {
    requestBody.system_instruction = body.systemInstruction;
  }

  try {
    const resp = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const text = await resp.text();
    return { statusCode: resp.status, headers: { "Content-Type": "application/json" }, body: text };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to connect to AI service", details: error.message })
    };
  }
};
