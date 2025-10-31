/**
 * Instructions.js
 *
 * Gerenciador centralizado de instruções ocultas para processamento de documentos.
 */

class InstructionsManager {
  constructor() {
    // Instruções básicas para leitura de documentos
    this.documentTemplates = {
      // Leitura padrão - apenas ler o arquivo
      pdf: `Leia o documento anexado e esteja pronto para responder perguntas sobre ele.`,

      // Análise técnica
      technicalAnalysis: `Leia o documento técnico anexado e esteja pronto para fornecer análises técnicas.`,

      // Resumo executivo
      executiveSummary: `Leia o documento anexado e prepare-se para criar resumos executivos quando solicitado.`,

      // Extração de dados
      dataExtraction: `Leia o documento anexado e prepare-se para extrair dados quando solicitado.`,
    };

    // Instruções para conversão de formatos
    this.conversionInstructions = {
      toPdf: `Prepare-se para converter o conteúdo para formato PDF quando solicitado.`,
      toDocx: `Prepare-se para converter o conteúdo para formato DOCX quando solicitado.`,
      toExcel: `Prepare-se para converter o conteúdo para formato Excel quando solicitado.`,
    };
  }

  // Instruções para análise de conteúdo
  //     this.contentAnalysis = {
  //       keywords: `Leia o documento e prepare-se para extrair palavras-chave quando solicitado.`,
  //       structure: `Leia o documento e prepare-se para analisar sua estrutura quando solicitado.`,
  //       grammarCheck: `Leia o documento e prepare-se para verificação de gramática quando solicitado.`,
  //     };

  // Instruções para processamento de dados
  //     this.dataProcessing = {
  //       compareTable: `Leia o documento e prepare-se para criar tabelas comparativas quando solicitado.`,
  //       generateCharts: `Leia o documento e prepare-se para sugerir visualizações quando solicitado.`,
  //       consolidate: `Leia os documentos e prepare-se para consolidá-los quando solicitado.`,
  //     };

  // Instruções para criação de conteúdo
  //     this.contentCreation = {
  //       createPresentation: `Leia o documento e prepare-se para criar apresentações quando solicitado.`,
  //       generateReport: `Leia o documento e prepare-se para gerar relatórios quando solicitado.`,
  //       createFaq: `Leia o documento e prepare-se para criar FAQs quando solicitado.`,
  //       createChecklist: `Leia o documento e prepare-se para criar checklists quando solicitado.`,
  //     };
  //   }

  /**
   * Obtém uma instrução específica
   */
  getInstruction(category, type) {
    if (!this[category]) {
      console.warn(`Categoria "${category}" não encontrada`);
      return "";
    }

    if (!this[category][type]) {
      console.warn(`Tipo "${type}" não encontrado na categoria "${category}"`);
      return "";
    }

    return this[category][type];
  }

  /**
   * Obtém todas as instruções de uma categoria
   */
  getCategoryInstructions(category) {
    return this[category] || {};
  }

  /**
   * Adiciona uma nova instrução
   */
  addInstruction(category, type, instruction) {
    if (!this[category]) {
      this[category] = {};
    }
    this[category][type] = instruction;
  }

  /**
   * Atualiza uma instrução existente
   */
  updateInstruction(category, type, instruction) {
    if (this[category] && this[category][type]) {
      this[category][type] = instruction;
      return true;
    }
    console.warn(
      `Instrução "${type}" não encontrada na categoria "${category}"`
    );
    return false;
  }

  /**
   * Combina múltiplas instruções
   */
  combineInstructions(instructions) {
    return instructions
      .map(({ category, type }) => this.getInstruction(category, type))
      .filter((instruction) => instruction)
      .join(" ");
  }
}

// Exportar instância única
const instructions = new InstructionsManager();
export default instructions;
