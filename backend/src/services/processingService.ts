import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';

export class ProcessingService {
  /**
   * Extracts text from various file types (PDF, TXT, DOCX, XLSX) in-memory.
   * @param buffer File buffer
   * @param filename Original filename to determine file type
   * @returns Extracted text content
   */
  static async extractText(buffer: Buffer, filename?: string): Promise<string> {
    try {
      const fileExtension = filename?.split('.').pop()?.toLowerCase();
      
      switch (fileExtension) {
        case 'pdf':
          return await this.extractFromPDF(buffer);
        
        case 'txt':
          return await this.extractFromTXT(buffer);
        
        case 'docx':
          return await this.extractFromDOCX(buffer);
        
        case 'xlsx':
        case 'xls':
          return await this.extractFromExcel(buffer);
        
        default:
          // Try PDF as fallback
          try {
            return await this.extractFromPDF(buffer);
          } catch {
            throw new Error(`Unsupported file type: ${fileExtension || 'unknown'}. Supported formats: PDF, TXT, DOCX, XLSX`);
          }
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from file: ${(error as Error).message}`);
    }
  }

  /**
   * Extracts text from PDF Buffer
   */
  private static async extractFromPDF(buffer: Buffer): Promise<string> {
    const pdf = new PDFParse(new Uint8Array(buffer));
    const result = await pdf.getText();
    return result.text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extracts text from TXT Buffer
   */
  private static async extractFromTXT(buffer: Buffer): Promise<string> {
    const text = buffer.toString('utf-8');
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extracts text from DOCX Buffer (basic implementation)
   */
  private static async extractFromDOCX(buffer: Buffer): Promise<string> {
    // For now, treat DOCX as text extraction
    // In a real implementation, you'd use a library like 'mammoth'
    const text = buffer.toString('utf-8');
    // Try to extract readable text from DOCX (basic approach)
    const cleanText = text.replace(/[^\w\s@.-]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleanText;
  }

  /**
   * Extracts text from Excel Buffer
   */
  private static async extractFromExcel(buffer: Buffer): Promise<string> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let allText = '';
    
    // Iterate through all sheets
    workbook.SheetNames.forEach((sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert each row to text
      jsonData.forEach((row: any) => {
        if (Array.isArray(row)) {
          allText += row.join(' ') + ' ';
        }
      });
    });
    
    return allText.replace(/\s+/g, ' ').trim();
  }
}
