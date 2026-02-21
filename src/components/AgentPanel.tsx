import { useState, useEffect } from "react";

interface Props {
  workflowData?: any;
  isVisible?: boolean;
}

function AgentPanel({ workflowData, isVisible = false }: Props) {
  const [agentStatus, setAgentStatus] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      fetchAgentStatus();
    }
  }, [isVisible]);

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/agent/status");
      const data = await response.json();
      setAgentStatus(data);
    } catch (error) {
      console.error("Failed to fetch agent status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      case "error":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return "⚙️";
      case "completed":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⏸️";
    }
  };

  const agents = [
    { key: "email_agent", name: "Email Agent", description: "Extracts tasks from emails", icon: "📧" },
    { key: "decision_agent", name: "Decision Agent", description: "Assigns priority & makes decisions", icon: "🧠" },
    { key: "calendar_agent", name: "Calendar Agent", description: "Schedules meetings", icon: "📅" },
    { key: "task_agent", name: "Task Agent", description: "Manages task dashboard", icon: "🗂" },
  ];

  return (
    <div style={{
      marginTop: "28px",
      padding: "28px",
      background: "linear-gradient(145deg, #1a1a24 0%, #0f0f18 100%)",
      borderRadius: "18px",
      border: "1px solid rgba(99, 102, 241, 0.2)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
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
          <span>🤖</span> Multi-Agent Orchestration
        </h2>
        <button
          onClick={fetchAgentStatus}
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
      </div>

      {/* Agent Workflow Display */}
      {workflowData && workflowData.agents && (
        <div style={{
          marginBottom: "24px",
          padding: "18px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "14px", fontWeight: "600" }}>
            🎯 Active Workflow
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {workflowData.agents.map((agent: any, index: number) => (
              <div
                key={index}
                style={{
                  padding: "10px 18px",
                  background: agent.status === "completed" 
                    ? "rgba(16, 185, 129, 0.15)" 
                    : "rgba(245, 158, 11, 0.15)",
                  borderRadius: "20px",
                  border: `1px solid ${agent.status === "completed" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                  color: agent.status === "completed" ? "#10b981" : "#f59e0b",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {agent.status === "completed" ? "✅" : "⚙️"} {agent.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
      }}>
        {agents.map((agent) => {
          const status = agentStatus?.agents?.[agent.key] || { status: "idle", last_run: null };
          return (
            <div
              key={agent.key}
              style={{
                padding: "22px",
                background: "linear-gradient(145deg, #1e1e2e 0%, #16161f 100%)",
                borderRadius: "14px",
                border: `2px solid ${getStatusColor(status.status)}`,
                transition: "all 0.25s ease",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "14px",
              }}>
                <span style={{ fontSize: "28px" }}>{getStatusIcon(status.status)}</span>
                <div>
                  <p style={{ color: "#f8fafc", fontWeight: "700", margin: 0, fontSize: "15px" }}>
                    {agent.icon} {agent.name}
                  </p>
                  <p style={{ color: getStatusColor(status.status), fontSize: "12px", margin: 0, fontWeight: "600", textTransform: "uppercase" }}>
                    {status.status}
                  </p>
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                {agent.description}
              </p>
              {status.last_run && (
                <p style={{ color: "#475569", fontSize: "11px", marginTop: "12px" }}>
                  Last run: {new Date(status.last_run).toLocaleTimeString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Orchestration Demo Line */}
      <div style={{
        marginTop: "24px",
        padding: "18px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
      }}>
        <p style={{ color: "white", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          🔥 "FlowPilot orchestrates multiple AI agents to automate enterprise workflows."
        </p>
      </div>
    </div>
  );
}

export default AgentPanel;
