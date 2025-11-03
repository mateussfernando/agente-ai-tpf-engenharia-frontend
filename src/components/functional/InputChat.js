import React, { useState, useEffect } from "react";
import { FiSend, FiPlus } from "react-icons/fi";
import { api } from "../../api/Api";
import AttachmentChips from "../ui/chat/AttachmentChips";
import ResponseFormatSelector from "../ui/chat/ResponseFormatSelector";
import instructions from "../../utils/Instructions";
import "../../style/chat.css";
import "../../style/response-format-selector.css";

export default function InputChat({
  activeConversation,
  onOpenAddFileModal,
  onMessageSent,
  attachedDocumentId,
  setAttachedDocumentId,
  attachedFileName,
  setAttachedFileName,
  initialMessage = "",
  onMessageChange,
  hiddenTemplateInstructions = "",
  setHiddenTemplateInstructions,
  attachedTemplates = [], // Array de templates
  attachedFiles = [], // Array de arquivos
  onRemoveTemplate,
  onRemoveFile,
  onClearAllAttachments,
}) {
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const [responseFormat, setResponseFormat] = useState("text"); // "text", "pdf", "docx", "excel"

  // Atualizar mensagem quando initialMessage mudar
  useEffect(() => {
    if (initialMessage !== message) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  // Função para validar se a resposta está no formato esperado
  const validateResponse = (messageContent, expectedFormat) => {
    // Verifica se a mensagem tem indicação de documento gerado
    const hasDocumentGenerated =
      messageContent?.includes("Documento") &&
      messageContent?.includes("gerado com sucesso");

    // Verifica o formato específico do arquivo gerado
    const hasPdf = messageContent?.includes(".pdf");
    const hasDocx = messageContent?.includes(".docx");
    const hasXlsx = messageContent?.includes(".xlsx");

    // Tenta parsear JSON se for string
    let parsedContent = null;
    if (
      typeof messageContent === "string" &&
      messageContent.trim().startsWith("{")
    ) {
      try {
        parsedContent = JSON.parse(messageContent);
      } catch (e) {
        // Não é JSON válido
      }
    }

    const hasDocumentId = !!parsedContent?.document_id;
    const jsonFormat = parsedContent?.format; // Formato no JSON (se existir)

    console.log("=== VALIDAÇÃO DE RESPOSTA ===");
    console.log("Formato esperado:", expectedFormat);
    console.log("Conteúdo da mensagem:", messageContent?.substring(0, 100));
    console.log("Tem documento gerado?", hasDocumentGenerated);
    console.log(
      "Formatos detectados - PDF:",
      hasPdf,
      "| DOCX:",
      hasDocx,
      "| XLSX:",
      hasXlsx
    );
    console.log("Formato no JSON:", jsonFormat);
    console.log("Tem document_id no JSON?", hasDocumentId);

    if (expectedFormat === "text") {
      // Para texto, NÃO deve ter documento gerado
      const isValid = !hasDocumentGenerated && !hasDocumentId;
      console.log(
        "Validação texto:",
        isValid ? "✓ OK" : "✗ FALHOU (gerou arquivo)"
      );
      return isValid;
    } else {
      // Para arquivos, DEVE ter documento gerado E ser do formato correto
      let isCorrectFormat = false;

      if (expectedFormat === "pdf") {
        isCorrectFormat = hasPdf || jsonFormat === "pdf";
      } else if (expectedFormat === "docx") {
        isCorrectFormat = hasDocx || jsonFormat === "docx";
      } else if (expectedFormat === "excel") {
        isCorrectFormat = hasXlsx || jsonFormat === "xlsx";
      }

      const isValid = hasDocumentGenerated && isCorrectFormat;
      console.log(
        "Validação arquivo:",
        isValid
          ? "✓ OK"
          : `✗ FALHOU (formato incorreto - esperado: ${expectedFormat})`
      );
      return isValid;
    }
  };

  const sendMessage = async () => {
    const userPrompt = message.trim();
    if (
      !activeConversation ||
      (!userPrompt && !attachedDocumentId) ||
      isSending
    )
      return;

    setIsSending(true);

    try {
      // Instrução oculta para formato de resposta
      let formatInstruction = "";
      if (responseFormat === "text") {
        formatInstruction = instructions.getInstruction(
          "conversionInstructions",
          "toText"
        );
      } else if (responseFormat === "pdf") {
        formatInstruction = instructions.getInstruction(
          "conversionInstructions",
          "toPdf"
        );
      } else if (responseFormat === "docx") {
        formatInstruction = instructions.getInstruction(
          "conversionInstructions",
          "toDocx"
        );
      } else if (responseFormat === "excel") {
        formatInstruction = instructions.getInstruction(
          "conversionInstructions",
          "toExcel"
        );
      }

      // Combinar instruções: mensagem do usuário + templates + formato (formato sempre no final!)
      let finalPrompt = userPrompt || "Processar este arquivo";

      // Adicionar instruções de template se houver
      if (hiddenTemplateInstructions) {
        finalPrompt = `${hiddenTemplateInstructions}. ${finalPrompt}`;
      }

      // Instrução de formato SEMPRE vem por último para ter prioridade máxima
      if (formatInstruction) {
        finalPrompt = `${finalPrompt}\n\n${formatInstruction}`;
      }

      console.log("=== DEBUG: PROMPT FINAL ENVIADO ===");
      console.log(finalPrompt);
      console.log("=== FIM DEBUG ===");

      // Enviar mensagem do usuário (mostra apenas o que o usuário digitou)
      onMessageSent?.({
        role: "user",
        sender: "user",
        content: userPrompt || "Processar arquivo",
        id: crypto.randomUUID(),
        attachedDocumentId: attachedDocumentId,
        attachedFileName: attachedFileName,
        responseFormat,
      });

      const conversationId = activeConversation?._id || activeConversation?.id;
      const MAX_RETRIES = 5;
      let attemptCount = 0;
      let validResponse = null;

      // Loop de tentativas até obter resposta no formato correto
      while (attemptCount < MAX_RETRIES && !validResponse) {
        attemptCount++;

        console.log(`\n🔄 TENTATIVA ${attemptCount} de ${MAX_RETRIES}`);

        // Mostrar feedback visual ao usuário durante retry
        if (attemptCount > 1) {
          onMessageSent?.({
            role: "assistant",
            sender: "bot",
            content: `⚠️ Tentando novamente... (tentativa ${attemptCount}/${MAX_RETRIES})`,
            id: crypto.randomUUID(),
            isRetrying: true,
          });
        }

        // Enviar para API (com instruções ocultas combinadas)
        const data = await api.sendMessage(
          finalPrompt,
          conversationId,
          attachedDocumentId
        );

        console.log("Resposta da API (tentativa " + attemptCount + "):", data);
        console.log("Document ID recebido:", data?.document_id);

        // Aguardar 2 segundos para o backend processar e salvar a mensagem
        console.log("⏳ Aguardando processamento do backend...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Buscar o histórico para pegar a mensagem real do backend
        let lastBotMessage = null;
        try {
          const history = await api.getConversationHistory(conversationId);
          console.log("📜 Histórico recebido:", history);

          // Pegar a última mensagem do bot
          const botMessages = history.filter((msg) => msg.role === "assistant");
          lastBotMessage = botMessages[botMessages.length - 1];
          console.log("🤖 Última mensagem do bot:", lastBotMessage);
        } catch (err) {
          console.error("Erro ao buscar histórico:", err);
        }

        // Validar usando a mensagem real do backend
        const messageToValidate =
          lastBotMessage?.content || data?.message_content || data?.content;

        if (validateResponse(messageToValidate, responseFormat)) {
          console.log("✅ Resposta válida recebida!");
          validResponse = { ...data, realMessage: lastBotMessage };
        } else {
          console.log("❌ Resposta inválida, tentando novamente...");

          // Se não for a última tentativa, aguardar um pouco antes de tentar novamente
          if (attemptCount < MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // Limpar anexos após envio
      if (onClearAllAttachments) {
        onClearAllAttachments();
      } else {
        // Fallback para compatibilidade
        setAttachedDocumentId(null);
        setAttachedFileName(null);
      }

      // Se conseguiu resposta válida, usar ela. Senão, usar a última tentativa
      const finalData = validResponse || data;

      if (!validResponse) {
        console.warn(
          "⚠️ Não foi possível obter resposta no formato correto após " +
            MAX_RETRIES +
            " tentativas"
        );
      }

      // Verificar diferentes campos possíveis da resposta
      const responseContent =
        finalData?.message_content ||
        finalData?.content ||
        finalData?.response ||
        finalData?.message ||
        finalData?.answer ||
        "Resposta recebida, mas conteúdo não identificado.";

      // Criar objeto da mensagem do bot com todos os campos possíveis do document_id
      const botMessage = {
        role: "assistant",
        sender: "bot",
        content:
          finalData?.message_content ||
          finalData?.content ||
          "Aguarde um pouco.",
        id: crypto.randomUUID(),
        generated_document_id: finalData?.document_id,
        document_id: finalData?.document_id,
        wasRetried: attemptCount > 1,
        attemptCount: attemptCount,
      };

      console.log("Mensagem do bot sendo enviada:", botMessage);

      onMessageSent?.(botMessage);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);

      onMessageSent?.({
        role: "assistant",
        sender: "bot",
        content: "Erro de conexão ou servidor. Tente novamente.",
        id: crypto.randomUUID(),
      });
    } finally {
      setIsSending(false);
      setMessage("");
      // Limpar instruções ocultas após o envio não é mais necessário
      // pois será feito via onRemoveTemplate no componente pai
    }
  };

  function handleRemoveAttachment() {
    setAttachedDocumentId(null);
    setAttachedFileName(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function getPlaceholderText() {
    if (attachedDocumentId) return "Digite suas instruções para o documento...";
    if (isSending) return "Aguardando resposta...";
    return "Digite sua mensagem...";
  }

  return (
    <div className="chat-input-container" style={{ position: "relative" }}>
      {/* Container flutuante para chips e seletor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "100%",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "all" }}>
          <AttachmentChips
            templates={attachedTemplates}
            files={attachedFiles}
            onRemoveTemplate={onRemoveTemplate}
            onRemoveFile={onRemoveFile}
          />
          <ResponseFormatSelector
            value={responseFormat}
            onChange={setResponseFormat}
          />
        </div>
      </div>

      {/* Área de input */}
      <div
        className={`chat-input ${attachedDocumentId ? "has-attachment" : ""}`}
      >
        <button
          className="add-file-btn"
          onClick={onOpenAddFileModal}
          disabled={isSending}
          title="Anexar arquivo"
        >
          <FiPlus className={attachedDocumentId ? "attached-icon" : ""} />
        </button>

        <input
          type="text"
          placeholder={getPlaceholderText()}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onMessageChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />

        <button
          className={`send-btn ${message.trim() ? "active" : ""}`}
          onClick={sendMessage}
          disabled={isSending || (!message.trim() && !attachedDocumentId)}
          title="Enviar mensagem"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
