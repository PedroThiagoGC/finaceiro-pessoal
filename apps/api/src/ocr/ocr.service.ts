import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

export interface OcrResult {
  rawText: string;
  confidence: number;
  parsed: {
    amount?: number;
    merchant?: string;
    date?: string;
    items?: Array<{ description: string; amount: number }>;
    suggestedCategory?: string;
  };
}

@Injectable()
export class OcrService {
  /**
   * Extrai texto de uma imagem usando Tesseract OCR
   */
  async extractText(imagePath: string): Promise<OcrResult> {
    const worker = await createWorker('por', 1, {
      logger: (m) => console.log('OCR Progress:', m),
    });

    try {
      const {
        data: { text, confidence },
      } = await worker.recognize(imagePath);

      const parsed = this.parseReceiptText(text);

      return {
        rawText: text,
        confidence: confidence,
        parsed,
      };
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Analisa o texto extraído para identificar informações relevantes
   */
  private parseReceiptText(text: string): OcrResult['parsed'] {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const result: OcrResult['parsed'] = {
      items: [],
    };

    // Regex para valores monetários (R$ 10,50 ou 10.50 ou 10,50)
    const amountRegex = /R?\$?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;

    // Regex para datas (dd/mm/yyyy, dd-mm-yyyy, etc.)
    const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;

    let totalAmount = 0;
    let merchant = '';
    let date = '';

    lines.forEach((line, index) => {
      // Primeira linha geralmente é o nome do estabelecimento
      if (index === 0 && !line.match(amountRegex)) {
        merchant = line.trim();
      }

      // Procura por datas
      const dateMatch = line.match(dateRegex);
      if (dateMatch && !date) {
        date = dateMatch[1];
      }

      // Procura por valores
      const amounts = line.match(amountRegex);
      if (amounts) {
        amounts.forEach((amountStr) => {
          const value = this.parseAmount(amountStr);
          if (value > totalAmount) {
            totalAmount = value;
          }

          // Tenta extrair item com valor
          const itemMatch = line.match(/^(.+?)\s+R?\$?\s*\d/);
          if (itemMatch && value > 0) {
            result.items?.push({
              description: itemMatch[1].trim(),
              amount: value,
            });
          }
        });
      }
    });

    // Procura por palavras-chave de "TOTAL"
    const totalLine = lines.find((line) =>
      /total|valor\s+total|total\s+r\$/i.test(line),
    );
    if (totalLine) {
      const match = totalLine.match(amountRegex);
      if (match) {
        totalAmount = this.parseAmount(match[0]);
      }
    }

    result.amount = totalAmount;
    result.merchant = merchant;
    result.date = date;
    result.suggestedCategory = this.suggestCategory(text);

    return result;
  }

  /**
   * Converte string de valor para número
   */
  private parseAmount(amountStr: string): number {
    const cleaned = amountStr
      .replace(/R\$/, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return parseFloat(cleaned) || 0;
  }

  /**
   * Sugere categoria baseada em palavras-chave
   */
  private suggestCategory(text: string): string {
    const textLower = text.toLowerCase();

    const categoryKeywords: Record<string, string[]> = {
      'Alimentação': [
        'restaurante',
        'padaria',
        'lanchonete',
        'café',
        'pizzaria',
        'hamburger',
        'fast food',
        'food',
        'mercado',
        'supermercado',
        'açougue',
        'hortifruti',
      ],
      'Transporte': [
        'uber',
        '99',
        'taxi',
        'combustível',
        'gasolina',
        'posto',
        'estacionamento',
        'pedágio',
      ],
      'Saúde': [
        'farmácia',
        'drogaria',
        'hospital',
        'clínica',
        'médico',
        'dentista',
        'laboratório',
      ],
      'Entretenimento': [
        'cinema',
        'teatro',
        'show',
        'evento',
        'ingresso',
        'streaming',
        'netflix',
        'spotify',
      ],
      'Vestuário': [
        'roupa',
        'calçado',
        'sapato',
        'tênis',
        'loja',
        'magazine',
        'fashion',
      ],
      'Educação': [
        'escola',
        'faculdade',
        'universidade',
        'curso',
        'livro',
        'livraria',
      ],
      'Serviços': [
        'salão',
        'barbearia',
        'lavanderia',
        'oficina',
        'manutenção',
      ],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => textLower.includes(keyword))) {
        return category;
      }
    }

    return 'Outros';
  }
}
