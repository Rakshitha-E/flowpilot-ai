import ApprovalButtons from "./ApprovalButtons";

interface Props {
  result: any;
  autonomousMode?: boolean;
  onTaskApproved?: () => void;
}

function TaskResult({ result, autonomousMode = false, onTaskApproved }: Props) {
  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "#ef4444";
    if (priority === "Medium") return "#f59e0b";
    return "#10b981";
  };

  const getPriorityBg = (priority: string) => {
    if (priority === "High") return "rgba(239, 68, 68, 0.15)";
    if (priority === "Medium") return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  return (
    <div style={{
      marginTop: "28px",
      padding: "28px",
      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
      borderRadius: "18px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      animation: "fadeIn 0.4s ease-out",
    }}>
      <h2 style={{
        fontSize: "20px",
        fontWeight: "700",
        marginBottom: "24px",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <span>📋</span> Task Analysis
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <div style={{
          padding: "18px",
          background: "#0f0f18",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Task
          </p>
          <p style={{ color: "#f8fafc", fontSize: "15px", fontWeight: "600", lineHeight: "1.5" }}>
            {result.task || "Not specified"}
          </p>
        </div>

        <div style={{
          padding: "18px",
          background: "#0f0f18",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Deadline
          </p>
          <p style={{ color: "#f8fafc", fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            📅 {result.deadline || "Not specified"}
          </p>
        </div>
      </div>

      <div style={{
        padding: "20px",
        background: getPriorityBg(result.priority),
        borderRadius: "12px",
        border: `2px solid ${getPriorityColor(result.priority)}`,
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Priority
          </p>
          <p style={{
            color: getPriorityColor(result.priority),
            fontSize: "20px",
            fontWeight: "700",
          }}>
            {result.priority || "Medium"}
          </p>
        </div>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${getPriorityColor(result.priority)}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}>
          {result.priority === "High" ? "🔴" : result.priority === "Medium" ? "🟡" : "🟢"}
        </div>
      </div>

      {/* Reminder Section */}
      {result.reminder && (
        <div style={{
          padding: "14px 18px",
          background: "rgba(99, 102, 241, 0.1)",
          borderRadius: "10px",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          marginBottom: "24px",
          color: "#a5b4fc",
          fontSize: "14px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          ⏰ {result.reminder}
        </div>
      )}

      <div style={{
        padding: "18px",
        background: "#0f0f18",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        marginBottom: "24px",
      }}>
        <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          💬 Suggested Reply
        </p>
        <p style={{
          color: "#e2e8f0",
          fontSize: "14px",
          lineHeight: "1.7",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}>
          {result.draftReply || "No reply generated"}
        </p>
      </div>

      {autonomousMode && (
        <div style={{
          padding: "14px 18px",
          background: "rgba(16, 185, 129, 0.15)",
          borderRadius: "10px",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          marginBottom: "24px",
          color: "#34d399",
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          ✨ Auto-approving in autonomous mode...
        </div>
      )}

      <ApprovalButtons task={result} autonomousMode={autonomousMode} onTaskApproved={onTaskApproved} />
    </div>
  );
}

export default TaskResult;
