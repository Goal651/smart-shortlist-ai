import pdfParse from 'pdf-parse';

export class ProcessingService {
  /**
   * Extracts text from a PDF Buffer in-memory.
   * @param buffer PDF file buffer
   * @returns Extracted text content
   */
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await (pdfParse as unknown as (buf: Buffer) => Promise<{ text: string }>)(buffer);
      // Clean up text: remove multiple newlines and extra spaces
      return data.text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
}
