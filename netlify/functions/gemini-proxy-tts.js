// Use Google Cloud Text-to-Speech JSON API. Returns base64 in audioContent.
const fetchFn = globalThis.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Expecting { input: { text }, voice?: {...}, audioConfig?: {...} }
    // Provide safe defaults if missing
    const payload = {
      input: body.input || { text: "Hello" },
      voice: body.voice || { languageCode: "en-US", name: "en-US-Neural2-C" },
      audioConfig: body.audioConfig || { audioEncoding: "MP3" }
    };

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`;

    const resp = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: data.error || data })
      };
    }

    // Return JSON with audioContent (base64) to match your frontend
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioContent: data.audioContent })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err) })
    };
  }
};
