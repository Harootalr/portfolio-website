const fetchFn = globalThis.fetch;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body || "{}");

    const payload = {
      input: body.input || { text: "Hello from Haroot's portfolio site." },
      voice: body.voice || { languageCode: "en-US", name: "en-US-Neural2-C" },
      audioConfig: body.audioConfig || { audioEncoding: "MP3" }
    };

    const KEY = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY; // prefer TTS key if set
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`;

    const resp = await fetchFn(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await resp.json();

    if (!resp.ok) return { statusCode: resp.status, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: data.error || data }) };
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audioContent: data.audioContent }) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: String(err) }) };
  }
};
