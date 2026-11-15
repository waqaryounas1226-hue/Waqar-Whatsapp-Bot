
const express = require("express");

const app = express();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Waqar WhatsApp Chatbot Server is Running!");
});

// Chatbot test route
app.post("/chat", (req, res) => {
  const message = req.body?.message || "";

  let reply = "Sorry, mujhe aapka message samajh nahi aaya.";

  if (message.toLowerCase().includes("hello")) {
    reply = "Assalam o Alaikum! Welcome to Shopify by Waqar.";
  } else if (message.toLowerCase().includes("price")) {
    reply = "Hamari Shopify services ki pricing maloom karne ke liye apni requirements share karein.";
  } else if (message.toLowerCase().includes("shopify")) {
    reply = "Hum Shopify store design, product listing aur store management services provide karte hain.";
  }

  res.json({ reply });
});

// Start server
app.listen(3000, () => {
  console.log("Chatbot server running on port 3000");
});
