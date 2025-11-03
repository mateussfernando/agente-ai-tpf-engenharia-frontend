import React from "react";
import "../../style/response-format-selector.css";

export default function ResponseFormatSelector({ value, onChange }) {
  return (
    <div className="response-format-selector-floating">
      <label htmlFor="response-format" className="response-format-label">
        Formato da <strong>resposta da IA</strong>:
      </label>
      <select
        id="response-format"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="response-format-select"
      >
        <option value="text">Texto (mensagem comum)</option>
        <option value="pdf">Arquivo PDF</option>
        <option value="docx">Arquivo Word (DOCX)</option>
        <option value="excel">Arquivo Excel (XLSX)</option>
      </select>
    </div>
  );
}
