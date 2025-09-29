// netlify/functions/gemini-proxy.js
const fetchFn = globalThis.fetch;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  // Use a model your key exposes; default to -latest
  const model = (body.model || "gemini-1.5-flash-latest").replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  const contents = body.contents || [
    { role: "user", parts: [{ text: body.prompt ?? "Hello from Netlify" }] },
  ];

  const payload = body.systemInstruction
    ? { contents, systemInstruction: body.systemInstruction }
    : { contents };

  const resp = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await resp.text();
  return { statusCode: resp.status, headers: { ...CORS, "Content-Type": "application/json" }, body: text };
};
