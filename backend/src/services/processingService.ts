import { PDFParse } from 'pdf-parse';

export class ProcessingService {
  /**
   * Extracts text from a PDF Buffer in-memory.
   * @param buffer PDF file buffer
   * @returns Extracted text content
   */
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const pdf = new PDFParse(new Uint8Array(buffer));
      const result = await pdf.getText();
      // Clean up text: remove multiple newlines and extra spaces
      return result.text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
}
