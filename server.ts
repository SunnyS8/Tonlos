import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { TNVED_CATALOG, searchTnvedCatalog, getTnvedByCode } from './src/data/tnvedCatalog';
import { getCustomsFee2026 } from './src/data/customsTariffs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client on the server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * API: Search TNVED code by query (code digits or text commodity description)
 * Route: POST /api/tnved/search
 */
app.post('/api/tnved/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = 10, useAi = false } = req.body;
    const cleanQuery = (query || '').toString().trim();

    if (!cleanQuery) {
      return res.json({
        success: true,
        source: 'catalog',
        items: TNVED_CATALOG.slice(0, limit),
      });
    }

    // 1. Search in verified EAEU catalog
    const localMatches = searchTnvedCatalog(cleanQuery, limit);

    // If local matches exist and AI is not explicitly requested, or if no API key is available
    if ((localMatches.length > 0 && !useAi) || !ai) {
      return res.json({
        success: true,
        source: 'eaeu_tariff_db',
        items: localMatches,
      });
    }

    // 2. If user requested AI search or local matches are empty, consult Gemini model for EAEU HS code
    if (ai) {
      try {
        const prompt = `Выступи в роли эксперта по таможенному декларированию ЕАЭС и ФТС РФ.
Определи 10-значный код ТН ВЭД ЕАЭС и базовую ставку ввозной таможенной пошлины для товара: "${cleanQuery}".

Ответь строго в формате JSON со следующими полями:
{
  "code": "10-значный цифровой код ТН ВЭД (например, 8708299000)",
  "formattedCode": "код с пробелами (например, 8708 29 900 0)",
  "name": "Официальное наименование товарной субпозиции по ТН ВЭД ЕАЭС",
  "shortName": "Краткое понятное название товара",
  "category": "Категория товара",
  "chapter": "Группа ТН ВЭД (например, Группа 87: Средства наземного транспорта)",
  "dutyRatePercent": число (базовая ставка ввозной пошлины в процентах, например 12 или 10 или 5 или 0),
  "dutyType": "ad_valorem" | "free",
  "vatRatePercent": число (ставка НДС в РФ, обычно 20, для детских/мед товаров 10),
  "requirements": ["список основных требований сертификации, например ТР ТС 018/2011 или Честный Знак"],
  "hasEacCertification": boolean,
  "typicalCommodities": ["примеры товаров"]
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = aiResponse.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.code) {
            // Merge with local matches
            const combined = [parsed, ...localMatches.filter((m) => m.code !== parsed.code)];
            return res.json({
              success: true,
              source: 'eaeu_ai_lookup',
              items: combined.slice(0, limit),
            });
          }
        }
      } catch (aiErr) {
        console.warn('AI TNVED lookup error, falling back to catalog:', aiErr);
      }
    }

    // Fallback to local matches
    return res.json({
      success: true,
      source: 'eaeu_tariff_db',
      items: localMatches,
    });
  } catch (error) {
    console.error('Error in /api/tnved/search:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * API: Calculate customs duty, fee, and VAT by TNVED code
 * Route: POST /api/tnved/calculate
 */
app.post('/api/tnved/calculate', (req: Request, res: Response) => {
  try {
    const {
      code,
      dutyRatePercent: customDutyRate,
      vatRatePercent: customVatRate,
      invoiceAmount = 0,
      invoiceCurrency = 'USD',
      freightAmount = 0,
      freightCurrency = 'USD',
      insuranceRub = 0,
      rates = { usdRub: 82.0, cnyRub: 11.079 },
    } = req.body;

    // Look up code in catalog if available
    const item = code ? getTnvedByCode(code) : undefined;
    const dutyRatePercent =
      typeof customDutyRate === 'number'
        ? customDutyRate
        : item?.dutyRatePercent ?? 12.0;

    const vatRatePercent =
      typeof customVatRate === 'number'
        ? customVatRate
        : item?.vatRatePercent ?? 20.0;

    // Convert invoice to RUB
    let invoiceRub = 0;
    if (invoiceCurrency === 'USD') {
      invoiceRub = invoiceAmount * rates.usdRub;
    } else if (invoiceCurrency === 'CNY') {
      invoiceRub = invoiceAmount * rates.cnyRub;
    } else {
      invoiceRub = invoiceAmount;
    }

    // Convert freight to RUB
    let freightRub = 0;
    if (freightCurrency === 'USD') {
      freightRub = freightAmount * rates.usdRub;
    } else {
      freightRub = freightAmount;
    }

    // Customs value (Таможенная стоимость) = Invoice + Freight + Insurance
    const customsValueRub = invoiceRub + freightRub + (insuranceRub || 0);

    // Import duty (Ввозная таможенная пошлина)
    const dutyRub = Math.round(customsValueRub * (dutyRatePercent / 100));

    // Customs fee (Таможенный сбор за совершение операций по шкале 2026)
    const feeData = getCustomsFee2026(customsValueRub);
    const customsFeeRub = feeData.fee;
    const feeTierLabel = feeData.tier.label;

    // VAT Base (База НДС) = Customs value + Duty
    const vatBaseRub = customsValueRub + dutyRub;
    const vatRub = Math.round(vatBaseRub * (vatRatePercent / 100));

    // Total customs payments (Итого таможенных платежей)
    const totalCustomsPaymentsRub = dutyRub + customsFeeRub + vatRub;

    const customsValueUsd = rates.usdRub > 0 ? customsValueRub / rates.usdRub : 0;
    const dutyUsd = rates.usdRub > 0 ? dutyRub / rates.usdRub : 0;
    const vatUsd = rates.usdRub > 0 ? vatRub / rates.usdRub : 0;
    const totalCustomsPaymentsUsd =
      rates.usdRub > 0 ? totalCustomsPaymentsRub / rates.usdRub : 0;

    return res.json({
      success: true,
      calculation: {
        code: code || item?.code || '8708299000',
        commodityName: item?.shortName || item?.name || 'Товар по ТН ВЭД',
        dutyRatePercent,
        vatRatePercent,
        invoiceRub,
        freightRub,
        insuranceRub,
        customsValueRub,
        customsValueUsd,
        dutyRub,
        dutyUsd,
        customsFeeRub,
        customsFeeTierLabel: feeTierLabel,
        vatRub,
        vatUsd,
        totalCustomsPaymentsRub,
        totalCustomsPaymentsUsd,
        effectiveTaxRatePercent:
          customsValueRub > 0
            ? Math.round((totalCustomsPaymentsRub / customsValueRub) * 1000) / 10
            : 0,
      },
    });
  } catch (error) {
    console.error('Error in /api/tnved/calculate:', error);
    return res.status(500).json({ success: false, error: 'Calculation error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${port}`);
  });
}

startServer();
