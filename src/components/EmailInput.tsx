import { useState } from "react";

interface Props {
  setResult: (data: any) => void;
}

function EmailInput({ setResult }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [useOrchestration, setUseOrchestration] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample email for demo
  const sampleEmail = `From: john.manager@company.com
Subject: Urgent - Q4 Budget Review Meeting

Hi Team,

We need to schedule an urgent meeting to review the Q4 budget before the deadline this Friday at 5 PM.

Please confirm your availability for tomorrow or Thursday.

Also, I've attached some confidential financial documents - please handle with care.

Best regards,
John Manager
Senior Finance Director`;

  const handleAnalyze = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!email.trim()) {
        setError("Please enter an email to analyze");
        setLoading(false);
        return;
      }

      let response;
      if (useOrchestration) {
        response = await fetch("http://127.0.0.1:8000/agent/orchestrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailText: email }),
        });
      } else {
        response = await fetch("http://127.0.0.1:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailText: email }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (useOrchestration && data.success) {
        setResult({
          ...data.data.final_result,
          workflowData: { workflow_id: data.data.workflow_id, agents: data.data.agents }
        });
      } else {
        setResult(data);
      }
      
      // Record metrics - email processed
      try {
        await fetch("http://127.0.0.1:8000/metrics/record-email", { method: "POST" });
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze email");
      console.error("Error analyzing email:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartReply = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!email.trim()) {
        setError("Please enter an email to generate smart reply");
        setLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/reply/smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText: email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult({
          task: data.context.task,
          deadline: data.context.deadline,
          priority: data.context.priority,
          draftReply: data.reply,
          reminder: "Reply generated - ready to send"
        });
        
        // Record metrics - email processed
        try {
          await fetch("http://127.0.0.1:8000/metrics/record-email", { method: "POST" });
        } catch {}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate smart reply");
      console.error("Error generating smart reply:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: "24px",
      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    }}>
      <h2 style={{
        fontSize: "20px",
        fontWeight: "700",
        color: "#f8fafc",
        margin: "0 0 20px 0",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <span>📧</span> Email Analysis
      </h2>

      <textarea
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Paste email content here to analyze..."
        style={{
          width: "100%",
          minHeight: "160px",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "14px",
          background: "#0f0f18",
          color: "#f8fafc",
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />

      {/* Multi-Agent Toggle */}
      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={useOrchestration}
            onChange={(e) => setUseOrchestration(e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
            🤖 Use Multi-Agent Orchestration
          </span>
        </label>
      </div>

      <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <button 
          onClick={() => setEmail(sampleEmail)}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#a5b4fc",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          📝 Load Sample Email
        </button>
        <button 
          onClick={handleAnalyze}
          disabled={!email.trim() || loading}
          style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: "600",
            color: "white",
            background: email.trim() && !loading ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "#3f3f5a",
            border: "none",
            borderRadius: "10px",
            cursor: email.trim() && !loading ? "pointer" : "not-allowed",
            boxShadow: email.trim() && !loading ? "0 4px 16px rgba(99, 102, 241, 0.4)" : "none",
          }}
        >
          {loading ? "⏳ Processing..." : "📊 Analyze Email"}
        </button>
        
        <button 
          onClick={handleSmartReply}
          disabled={!email.trim() || loading}
          style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: "600",
            color: "white",
            background: email.trim() && !loading ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" : "#3f3f5a",
            border: "none",
            borderRadius: "10px",
            cursor: email.trim() && !loading ? "pointer" : "not-allowed",
            boxShadow: email.trim() && !loading ? "0 4px 16px rgba(245, 158, 11, 0.4)" : "none",
          }}
        >
          ✨ Smart Reply
        </button>
      </div>

      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.15)",
          color: "#fca5a5",
          fontSize: "14px",
          borderRadius: "8px",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default EmailInput;
