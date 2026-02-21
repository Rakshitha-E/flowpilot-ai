import { useState, useEffect } from "react";

interface LogEntry {
  id: number;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
}

interface Props {
  refreshTrigger?: number;
}

function AuditLog({ refreshTrigger = 0 }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/audit");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    }
    setLoading(false);
  };

  const clearLogs = async () => {
    try {
      await fetch("http://127.0.0.1:8000/audit/clear", {
        method: "POST"
      });
      setLogs([]);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  const getAgentIcon = (agent: string) => {
    if (agent.includes("Email")) return "📧";
    if (agent.includes("Decision")) return "🧠";
    if (agent.includes("Calendar")) return "📅";
    if (agent.includes("Task")) return "🗂";
    if (agent.includes("Slack")) return "💬";
    if (agent.includes("Orchestrator")) return "🎯";
    return "🤖";
  };

  const getAgentColor = (agent: string) => {
    if (agent.includes("Email")) return "#6366f1";
    if (agent.includes("Decision")) return "#a855f7";
    if (agent.includes("Calendar")) return "#f59e0b";
    if (agent.includes("Task")) return "#10b981";
    if (agent.includes("Slack")) return "#06b6d4";
    if (agent.includes("Orchestrator")) return "#ef4444";
    return "#64748b";
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "60px", 
        textAlign: "center", 
        color: "#64748b",
        background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
        Loading audit logs...
      </div>
    );
  }

  return (
    <div style={{
      padding: "24px",
      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}>
        <h2 style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#f8fafc",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <span>📋</span> Workflow History / Audit Log
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchLogs}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={clearLogs}
            style={{
              padding: "10px 18px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              color: "#f87171",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Enterprise Ready Badge */}
      <div style={{
        marginBottom: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
      }}>
        <p style={{ color: "white", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          🔒 Enterprise-grade audit trail - Complete workflow visibility
        </p>
      </div>

      {logs.length === 0 ? (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "15px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <p style={{ fontWeight: "500", color: "#94a3b8" }}>No audit logs yet</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>Process some emails to see the workflow history!</p>
        </div>
      ) : (
        <div style={{
          maxHeight: "450px",
          overflowY: "auto",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
          }}>
            <thead>
              <tr style={{ background: "rgba(15, 15, 24, 0.9)" }}>
                <th style={{ padding: "14px", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Timestamp</th>
                <th style={{ padding: "14px", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Agent</th>
                <th style={{ padding: "14px", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Action</th>
                <th style={{ padding: "14px", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice().reverse().map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
                >
                  <td style={{ padding: "14px", fontSize: "12px", color: "#64748b" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      background: `${getAgentColor(log.agent)}15`,
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: getAgentColor(log.agent),
                    }}>
                      {getAgentIcon(log.agent)} {log.agent}
                    </span>
                  </td>
                  <td style={{ padding: "14px", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                    {log.action}
                  </td>
                  <td style={{ padding: "14px", fontSize: "12px", color: "#94a3b8" }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: "20px",
        padding: "14px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "10px",
        textAlign: "center",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, fontWeight: "500" }}>
          Total workflow events: <strong style={{ color: "#f8fafc" }}>{logs.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default AuditLog;
