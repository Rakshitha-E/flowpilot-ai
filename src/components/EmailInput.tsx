import { useState } from "react";

interface Props {
  setResult: (data: any) => void;
}

function EmailInput({ setResult }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setError(null);
      if (!email.trim()) {
        setError("Please enter an email to analyze");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailText: email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze email");
      console.error("Error analyzing email:", err);
    }
  };

  return (
    <div>
      <textarea
        rows={8}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "14px",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          border: "2px solid #e0e0e0",
          borderRadius: "8px",
          resize: "vertical",
          transition: "border-color 0.3s ease",
          outline: "none",
          minHeight: "120px",
        }}
        placeholder="Paste your email here for analysis..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
        onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
      />

      <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <button 
          onClick={handleAnalyze}
          disabled={!email.trim()}
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: "600",
            color: "white",
            background: email.trim() ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#ccc",
            border: "none",
            borderRadius: "8px",
            cursor: email.trim() ? "pointer" : "not-allowed",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxShadow: email.trim() ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none",
          }}
          onMouseEnter={(e) => {
            if (email.trim()) {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
            }
          }}
          onMouseLeave={(e) => {
            if (email.trim()) {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
            }
          }}
        >
          📊 Analyze Email
        </button>
      </div>

      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px 16px",
          background: "#fee",
          color: "#c33",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid #fcc",
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default EmailInput;