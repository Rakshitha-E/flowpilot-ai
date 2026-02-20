import ApprovalButtons from "./ApprovalButtons";

interface Props {
  result: any;
}

function TaskResult({ result }: Props) {
  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "#ff6b6b";
    if (priority === "Medium") return "#ffa94d";
    return "#51cf66";
  };

  return (
    <div style={{
      marginTop: "30px",
      padding: "24px",
      background: "#f8f9fa",
      borderRadius: "12px",
      border: "1px solid #e9ecef",
    }}>
      <h2 style={{
        fontSize: "20px",
        fontWeight: "700",
        marginBottom: "20px",
        color: "#2c3e50",
      }}>📋 Task Analysis</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <div style={{
          padding: "16px",
          background: "white",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}>
          <p style={{ color: "#666", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>TASK</p>
          <p style={{ color: "#2c3e50", fontSize: "15px", fontWeight: "600" }}>{result.task || "Not specified"}</p>
        </div>

        <div style={{
          padding: "16px",
          background: "white",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}>
          <p style={{ color: "#666", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>DEADLINE</p>
          <p style={{ color: "#2c3e50", fontSize: "15px", fontWeight: "600" }}>📅 {result.deadline || "Not specified"}</p>
        </div>
      </div>

      <div style={{
        padding: "16px",
        background: "white",
        borderRadius: "8px",
        border: `2px solid ${getPriorityColor(result.priority)}`,
        marginBottom: "24px",
      }}>
        <p style={{ color: "#666", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>PRIORITY</p>
        <p style={{
          color: getPriorityColor(result.priority),
          fontSize: "18px",
          fontWeight: "700",
        }}>
          {result.priority || "Medium"}
        </p>
      </div>

      <div style={{
        padding: "16px",
        background: "white",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        marginBottom: "24px",
      }}>
        <p style={{ color: "#666", fontSize: "12px", fontWeight: "600", marginBottom: "12px" }}>✉️ SUGGESTED REPLY</p>
        <p style={{
          color: "#2c3e50",
          fontSize: "14px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}>
          {result.draftReply || "No reply generated"}
        </p>
      </div>

      <ApprovalButtons />
    </div>
  );
}

export default TaskResult;