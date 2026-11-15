
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

module.exports = async (req, res) => {
  // Meta webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  // Incoming WhatsApp message
  if (req.method === "POST") {
    try {
      const message =
        req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message || message.type !== "text") {
        return res.status(200).send("OK");
      }

      const question = message.text.body;
      const from = message.from;

      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are the helpful customer support assistant for Shopify by Waqar. Reply naturally in the same language as the customer. Explain Shopify store design, product listing, Custom Liquid, CSS and store management services. Be polite and concise. Customer asks: ${question}`
              }]
            }]
          })
        }
      );

      const aiData = await aiResponse.json();
      const reply =
        aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Maazrat, abhi jawab dene mein masla aa raha hai. Dobara koshish karein.";

      const phoneId = process.env.PHONE_NUMBER_ID;
      const whatsappToken = process.env.WHATSAPP_TOKEN;
      const graphVersion = process.env.GRAPH_API_VERSION || "v23.0";

      await fetch(
        `https://graph.facebook.com/${graphVersion}/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: reply }
          })
        }
      );

      return res.status(200).send("OK");
    } catch (error) {
      console.error(error);
      return res.status(200).send("OK");
    }
  }

  return res.status(405).send("Method not allowed");
};

