import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppMode, GeneratedResult, GeneratorSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    svgContent: {
      type: Type.STRING,
      description: "The complete, valid SVG XML string. Must include viewBox, width, and height attributes.",
    },
    description: {
      type: Type.STRING,
      description: "A short technical description of the generated design in Czech language.",
    },
    width: {
      type: Type.STRING,
      description: "The width of the design (e.g., '100mm').",
    },
    height: {
      type: Type.STRING,
      description: "The height of the design (e.g., '100mm').",
    },
  },
  required: ["svgContent", "description", "width", "height"],
};

export const generateLaserDesign = async (
  prompt: string,
  mode: AppMode,
  settings: GeneratorSettings
): Promise<GeneratedResult> => {
  const modelId = "gemini-3-pro-preview"; // Using Pro for complex reasoning (geometry)

  const systemInstruction = `
Jsi expertní inženýr a grafik specializující se na laserové řezání (laser cutting) a generování SVG souborů.
Tvým úkolem je vygenerovat technicky precizní SVG kód na základě požadavku uživatele.

PARAMETRY STROJE:
- Řez (Cut): Barva ${settings.cutColor}, Tloušťka čáry ${settings.cutStrokeWidth}mm. Použij element <path> nebo <rect/circle> bez výplně (fill="none") se strockem.
- Gravírování (Engrave): Barva ${settings.engraveColor}, Výplň (fill) ${settings.engraveColor} nebo tlustý stroke.

REŽIM: ${mode === AppMode.THREE_D_PUZZLE ? "3D PUZZLE (Interlocking parts)" : "2D DESIGN (Flat)"}
TLOUŠŤKA MATERIÁLU: ${settings.materialThickness}mm (Důležité pro spoje v režimu 3D Puzzle).

POKYNY PRO SVG:
1. Musí být validní XML.
2. Musí mít nastavený 'viewBox' a reálné rozměry 'width' a 'height' v mm.
3. Všechny cesty musí být uzavřené pro řezání.
4. Pro 3D Puzzle: Vygeneruj "flat layout" (rozložený tvar) všech dílů potřebných k sestavení objektu. Vypočítej správně drážky (slots) podle tloušťky materiálu (${settings.materialThickness}mm).
5. Buď kreativní, ale dbej na fyzikální realizovatelnost (díly nesmí být příliš tenké).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [{ text: `Vytvoř návrh: ${prompt}` }],
        },
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for geometry calculation
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(jsonText) as GeneratedResult;
    return result;

  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Nepodařilo se vygenerovat návrh. Zkuste to prosím znovu.");
  }
};