export class ProcessingService {
  /**
   * Extracts text from a PDF Buffer in-memory.
   * @param buffer PDF file buffer
   * @returns Extracted text content
   */
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      // Dynamic import for ESM-compatible pdf-parse v2
      const pdfParse = await import('pdf-parse');
      const pdfFn = pdfParse.default ?? pdfParse;
      const data = await (pdfFn as any)(buffer);
      // Clean up text: remove multiple newlines and extra spaces
      return data.text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
}
