export async function handler(event) {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body || "{}");

    // Adjust model/path to match your TTS provider if different
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-to-speech:generate?key=${process.env.GEMINI_API_KEY}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, body: JSON.stringify({ error: errText }) };
    }

    // Expecting JSON with audioContent (base64) to match your frontend
    const data = await resp.json();

    // If provider returns raw bytes instead, convert to JSON:
    // const buffer = await resp.arrayBuffer();
    // const audioContent = Buffer.from(buffer).toString("base64");
    // return { statusCode: 200, body: JSON.stringify({ audioContent }) };

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
