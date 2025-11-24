// Função para retornar instrução personalizada ao selecionar template
const instructions = {
  getInstruction: (category, type, templateName) => {
    if (templateName) {
      return `preencha o template '${templateName}' com as informações ..`;
    }
    return `preencha o template '${type}' com as informações ..`;
  },
};

export default instructions;
