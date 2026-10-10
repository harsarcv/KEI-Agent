require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const { searchSimilarDocuments } = require("./vectorSearchService");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateRAGResponse = async (question) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  // =====================================================
  // 1. CARI DOKUMEN YANG RELEVAN
  // =====================================================

  const documents = await searchSimilarDocuments(question, 3);

  if (documents.length === 0) {
    return {
      answer:
        "Maaf, saya tidak menemukan informasi yang relevan di knowledge base RUMLIV.",
      dataSource: "knowledge_base",
      documents: [],
    };
  }

  // =====================================================
  // 2. SUSUN CONTEXT
  // =====================================================

  const context = documents
    .map(
      (doc, index) => `
Dokumen ${index + 1}
Judul: ${doc.title}
Sumber: ${doc.source || "Tidak diketahui"}
Isi:
${doc.content}
`
    )
    .join("\n");

  // =====================================================
  // 3. KIRIM CONTEXT KE GEMINI
  // =====================================================

  const prompt = `
Jawab pertanyaan pengguna berdasarkan knowledge base RUMLIV berikut.

ATURAN:
- Gunakan hanya informasi yang tersedia dalam context.
- Jangan mengarang informasi.
- Jika informasi tidak tersedia, katakan bahwa informasi tersebut tidak ditemukan.
- Jawab dalam bahasa Indonesia.
- Berikan jawaban yang jelas dan ringkas.

CONTEXT:
${context}

PERTANYAAN:
${question}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  return {
    answer: response.text,
    dataSource: "knowledge_base",
    documents: documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      source: doc.source,
      similarity: doc.similarity,
    })),
  };
};

module.exports = {
  generateRAGResponse,
};