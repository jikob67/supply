
import { GoogleGenAI } from "@google/genai";
import { SUPPORT_EMAIL, SUPPORT_LINKS } from "../constants";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const getSupportResponse = async (query: string): Promise<string> => {
  try {
    const ai = getAI();
    
    const systemInstruction = `
      أنت مساعد دعم فني لتطبيق يسمى "supply".
      وصف التطبيق: تطبيق يساعد المستخدمين في العثور على أكبر عدد ممكن من المستخدمين لمشاريعهم، ويسهل التسويق وعرض المشاريع.
      المزايا: رفع صور وفيديوهات إعلانية، دردشة عامة وخاصة، اشتراكات عبر العملات الرقمية.
      
      إذا لم تستطع حل المشكلة، اطلب من المستخدم التواصل عبر البريد: ${SUPPORT_EMAIL}
      أو زيارة: ${SUPPORT_LINKS.join(', ')}
      
      يجب أن تكون إجابتك باللغة العربية، مهذبة، ومختصرة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `واجهنا مشكلة تقنية. يرجى التواصل معنا مباشرة على ${SUPPORT_EMAIL}`;
  }
};
