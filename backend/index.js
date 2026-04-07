require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

function getSeededNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

async function getAIData(prompt) {
  for (let i = 0; i < 2; i++) {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3",
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      let text = result.response;
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const match = text.match(/\{[\s\S]*\}/);

      if (match) {
        const parsed = JSON.parse(match[0]);

        // VALIDATE minimal fields
        if (parsed && typeof parsed === "object") {
          console.log("ACCEPTED AI DATA:", parsed);
          return parsed;
        }
      }

    } catch (err) {
      console.log("Retry attempt failed:", err.message);
    }
  }

  return null; // fallback if both attempts fail
}

app.post('/analyze', async (req, res) => {
  const { drugs } = req.body;
  
  if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
    return res.status(400).json({ error: "drugs array is required" });
  }

  try {
    const results = [];

    // Process each drug separately
    for (const drugName of drugs) {
      if (!drugName) continue;
      const cleanDrug = drugName.trim().toLowerCase();

      let data = {
        generic_name: cleanDrug,
        price_range: { min: 20, max: 100 },
        description: "Estimated data",
        uses: [],
        side_effects: [],
        common_brands: [],
        dosage_form: "",
        availability: "",
        confidence_note: ""
      };

      try {
        const prompt = `
Provide detailed structured information about the medicine '${drugName}' in India.

Return STRICT JSON only. Do NOT include any explanation, markdown, or extra text.

{
"generic_name": "",
"price_range": {
"min": number,
"max": number
},
"description": "",
"uses": [],
"common_brands": [],
"dosage_form": "",
"side_effects": [],
"availability": "",
"confidence_note": ""
}

Rules:
- generic_name = actual chemical/generic name
- price_range = realistic INR range for generic version
- description = 2-3 lines (clear and human-like)
- uses = list of common uses (3-5 items)
- common_brands = popular brand names in India
- dosage_form = tablet / syrup / injection etc
- side_effects = 3-5 common mild side effects
- availability = "OTC" or "Prescription"
- confidence_note = short note like "Commonly available and widely used in India"

IMPORTANT:
- Keep data realistic for Indian market
- Do NOT hallucinate extreme prices
- Keep everything concise but informative
- ONLY return JSON (no text before/after)

Drug: ${drugName}
`;

        const parsed = await getAIData(prompt);

        if (parsed) {
          data = { ...data, ...parsed };
          console.log("PARSED DATA:", parsed);
        }
      } catch (e) {
        console.log(`AI generation error for ${drugName}:`, e.message);
      }

      console.log("FINAL DATA:", drugName, data);

      // NORMALIZATION LAYER
      const genericName = data?.generic_name || data?.genericName || cleanDrug;
      
      let baseMin = 20;
      let baseMax = 100;

      if (data?.price_range?.min && data?.price_range?.max) {
        baseMin = Math.min(data.price_range.min, 100);
        baseMax = Math.max(data.price_range.max, baseMin + 20);
      }

      console.log({
        drug: drugName,
        baseMin,
        baseMax,
        generic_name: genericName
      });

      // GENERATE SAFE PRICES
      const seed = getSeededNumber(cleanDrug);
      const seed2 = getSeededNumber(cleanDrug + "_brand");
      const generic_price = baseMin + (seed % (baseMax - baseMin + 1));
      
      const multiplier = 3 + (seed2 % 4);
      const base_brand_price = Math.round(generic_price * multiplier);
      const variation = seed2 % 30;
      let brand_price = base_brand_price + variation;

      if (brand_price <= generic_price) {
        brand_price = generic_price + 50;
      }
      
      const confidence_level = generic_price < 50 ? "high" : "medium";

      // Compute savings
      const monthly_savings = brand_price - generic_price;
      const yearly_savings = Math.round(monthly_savings * 12);

      const description = data?.description || "Estimated data based on AI.";
      const uses = data?.uses || [];
      const side_effects = data?.side_effects || [];
      const brands = data?.common_brands || [];
      
      const dosage_form = data?.dosage_form || "Tablet";
      const availability = data?.availability || "OTC";
      const confidence_note = data?.confidence_note || "Standard estimates provided.";

      // Push structured result with confidence tier
      results.push({
        drug: drugName,
        generic_name: genericName,
        brand_price,
        generic_price,
        monthly_savings,
        yearly_savings,
        confidence_level,
        explanation: description,
        uses,
        side_effects,
        brands,
        dosage_form,
        availability,
        confidence_note
      });
    }

    res.json({ results });

  } catch (error) {
    console.error("API request error:", error.message);
    
    // Ultimate Failsafe (Do NOT crash)
    const fallbackResults = drugs.filter(d => !!d).map(drugName => {
      const cleanDrug = drugName.trim().toLowerCase();
      const generic_price = 20;
      let brand_price = 100;
      
      if (brand_price <= generic_price) {
        brand_price = generic_price + 50;
      }

      const monthly_savings = brand_price - generic_price;
      const yearly_savings = Math.round(monthly_savings * 12);

      return {
        drug: drugName,
        generic_name: cleanDrug,
        brand_price,
        generic_price,
        monthly_savings,
        yearly_savings,
        confidence_level: "medium",
        explanation: "Information unavailable due to server error, showing estimated pricing.",
        uses: [],
        side_effects: [],
        brands: [],
        dosage_form: "Tablet",
        availability: "OTC",
        confidence_note: "Standard estimates provided due to server error."
      };
    });

    res.json({ results: fallbackResults }); 
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
