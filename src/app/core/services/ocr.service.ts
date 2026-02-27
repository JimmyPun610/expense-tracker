import { Injectable } from '@angular/core';
export interface OcrResult {
  amount: number | null;
  category: string | null;
  date: string | null;
  remark: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  async scanReceipt(base64Image: string, mimeType: string): Promise<OcrResult> {
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;
      
      const { data: { text } } = await worker.recognize(imageUrl);
      await worker.terminate();

      return this.parseReceiptText(text);
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  }

  private parseReceiptText(text: string): OcrResult {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // 1. Extract Remark (usually the first non-empty line is the merchant name)
    let remark = lines.length > 0 ? lines[0] : null;
    if (remark && remark.length > 30) {
      remark = remark.substring(0, 30); // keep it short
    }

    // 2. Extract Amount (look for the largest currency-like number, often the Total)
    let amount: number | null = null;
    let maxAmount = 0;
    
    // First try to find explicit "Total" lines
    for (const line of lines) {
      if (line.toLowerCase().includes('total')) {
        const match = line.match(/\d+\.\d{2}/);
        if (match) {
          const val = parseFloat(match[0]);
          if (val > maxAmount) maxAmount = val;
        }
      }
    }
    
    // If no "Total" line found, just find the largest decimal number
    if (maxAmount === 0) {
      const allDecimals = text.match(/\d+\.\d{2}/g);
      if (allDecimals) {
        for (const match of allDecimals) {
          const val = parseFloat(match);
          if (val > maxAmount) maxAmount = val;
        }
      }
    }
    
    if (maxAmount > 0) {
      amount = maxAmount;
    }

    // 3. Extract Date (look for common date formats)
    let date: string | null = null;
    const dateRegex = /(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      // Try to parse it into a valid date
      try {
        const parsedDate = new Date(dateMatch[0]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString();
        }
      } catch {
        // Ignore invalid dates
      }
    }

    // 4. Extract Category (simple keyword matching)
    let category: string | null = 'other';
    const lowerText = text.toLowerCase();
    
    if (/(restaurant|cafe|coffee|food|burger|pizza|eat|dining|menu)/.test(lowerText)) {
      category = 'food';
    } else if (/(uber|lyft|taxi|train|transit|gas|station|fuel|parking)/.test(lowerText)) {
      category = 'transport';
    } else if (/(walmart|target|amazon|shop|store|market|grocery|mall)/.test(lowerText)) {
      category = 'shopping';
    } else if (/(movie|cinema|ticket|game|entertainment|show)/.test(lowerText)) {
      category = 'entertainment';
    } else if (/(bill|utility|electric|water|internet|phone)/.test(lowerText)) {
      category = 'bills';
    }

    return {
      amount,
      category,
      date,
      remark
    };
  }
}
