import { useState } from "react";

interface Props {
  task?: any;
  autonomousMode?: boolean;
  onTaskApproved?: () => void;
}

function ApprovalButtons({ task, autonomousMode = false, onTaskApproved }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/approve-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: task,
          autonomous: autonomousMode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        if (onTaskApproved) {
          onTaskApproved();
        }
        
        // Record metrics - task created
        try {
          await fetch("http://127.0.0.1:8000/metrics/record-task", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autonomous: autonomousMode })
          });
        } catch {}
        
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to approve task");
    }
    setLoading(false);
  };

  const handleReject = () => {
    setMessage("Task rejected");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div>
      <div style={{
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        marginTop: "20px",
      }}>
        <button
          onClick={handleApprove}
          disabled={loading}
          style={{
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: "600",
            color: "white",
            background: loading ? "#3f3f5a" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 16px rgba(16, 185, 129, 0.4)",
            transition: "all 0.25s ease",
          }}
        >
          {loading ? "⏳ Approving..." : "✅ Approve Task"}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          style={{
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: "600",
            color: "white",
            background: loading ? "#3f3f5a" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 16px rgba(239, 68, 68, 0.4)",
            transition: "all 0.25s ease",
          }}
        >
          ❌ Reject
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: "16px",
          padding: "12px 16px",
          background: message.includes("approved") || message.includes("Auto") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          color: message.includes("approved") || message.includes("Auto") ? "#6ee7b7" : "#fca5a5",
          borderRadius: "8px",
          border: `1px solid ${message.includes("approved") || message.includes("Auto") ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "500",
        }}>
          ✨ {message}
        </div>
      )}
    </div>
  );
}

export default ApprovalButtons;
