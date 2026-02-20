import { useState } from "react";
import EmailInput from "../components/EmailInput";
import TaskResult from "../components/TaskResult";

function Dashboard() {
  const [result, setResult] = useState<any>(null);

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      maxWidth: "900px",
      width: "90%",
      padding: "40px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        textAlign: "center",
        marginBottom: "40px",
      }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "800",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "10px",
        }}>🚀 FlowPilot AI</h1>
        <p style={{
          color: "#666",
          fontSize: "16px",
          fontWeight: "500",
        }}>Intelligent Email Task Manager</p>
      </div>

      <EmailInput setResult={setResult} />

      {result && <TaskResult result={result} />}
    </div>
  );
}

export default Dashboard;