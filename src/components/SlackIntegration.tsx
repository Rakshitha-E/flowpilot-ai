import { useState, useEffect } from "react";

interface SlackMessage {
  id: string;
  channel: string;
  message: string;
  action: string;
  status: string;
  created_at: string;
}

interface Props {
  refreshTrigger?: number;
}

function SlackIntegration({ refreshTrigger = 0 }: Props) {
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState({
    channel: "#general",
    message: ""
  });
  const [slackCommand, setSlackCommand] = useState("");
  const [commandResponse, setCommandResponse] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [refreshTrigger]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/slack/messages");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to fetch Slack messages:", error);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.message.trim()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/slack/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: newMessage.channel,
          message: newMessage.message
        })
      });
      const data = await response.json();
      
if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage({ channel: "#general", message: "" });
        
        // Record slack metric
        try { await fetch("http://127.0.0.1:8000/metrics/record-slack", { method: "POST" }); } catch {}
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const sendSlackCommand = async () => {
    if (!slackCommand.trim()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/slack/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "#general",
          message: slackCommand
        })
      });
      const data = await response.json();
      
      setCommandResponse(data.text || "Command processed");
      setSlackCommand("");
      fetchMessages();
      
      setTimeout(() => setCommandResponse(null), 5000);
    } catch (error) {
      console.error("Failed to send command:", error);
    }
  };

  const presetCommands = [
    { cmd: "@FlowPilot schedule meeting tomorrow", label: "📅 Schedule Meeting" },
    { cmd: "@FlowPilot urgent: review budget", label: "⚡ Urgent Task" },
    { cmd: "@FlowPilot create task for Q1 review", label: "✅ Create Task" },
    { cmd: "@FlowPilot what's on my calendar today", label: "📋 Check Calendar" },
  ];

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
        Loading Slack integration...
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
          <span>💬</span> Slack / Teams Integration
        </h2>
        <button
          onClick={fetchMessages}
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

      {/* Slack/Teams Demo Badge */}
      <div style={{
        marginBottom: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, #4A154B 0%, #36C5F0 100%)",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 16px rgba(74, 21, 75, 0.3)",
      }}>
        <p style={{ color: "white", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          💬 Create tasks from Slack: "@FlowPilot schedule meeting tomorrow"
        </p>
      </div>

      {/* Slack Command Interface */}
      <div style={{
        marginBottom: "28px",
        padding: "24px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#f8fafc", fontWeight: "700" }}>
          ⚡ Slack Commands
        </h3>
        
        {/* Command Response */}
        {commandResponse && (
          <div style={{
            marginBottom: "18px",
            padding: "14px",
            background: "rgba(99, 102, 241, 0.15)",
            borderRadius: "10px",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#a5b4fc",
            fontSize: "14px",
          }}>
            💬 {commandResponse}
          </div>
        )}

        {/* Preset Commands */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px", fontWeight: "500" }}>
            Quick Commands:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {presetCommands.map((preset, index) => (
              <button
                key={index}
                onClick={() => setSlackCommand(preset.cmd)}
                style={{
                  padding: "10px 14px",
                  background: "rgba(74, 21, 75, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "#e2e8f0",
                  fontWeight: "500",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Type Slack command..."
            value={slackCommand}
            onChange={(e) => setSlackCommand(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendSlackCommand()}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "14px",
              background: "#0f0f18",
              color: "#f8fafc",
            }}
          />
          <button
            onClick={sendSlackCommand}
            style={{
              padding: "14px 24px",
              background: "linear-gradient(135deg, #4A154B 0%, #36C5F0 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(74, 21, 75, 0.4)",
            }}
          >
            🚀 Send
          </button>
        </div>
      </div>

      {/* Send Message Form */}
      <div style={{
        marginBottom: "28px",
        padding: "24px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#f8fafc", fontWeight: "700" }}>
          📤 Send Message
        </h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={newMessage.channel}
            onChange={(e) => setNewMessage({ ...newMessage, channel: e.target.value })}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "14px",
              background: "#0f0f18",
              color: "#f8fafc",
            }}
          >
            <option>#general</option>
            <option>#team</option>
            <option>#project-alpha</option>
            <option>#notifications</option>
          </select>
          <input
            type="text"
            placeholder="Type message..."
            value={newMessage.message}
            onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "14px",
              background: "#0f0f18",
              color: "#f8fafc",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "14px 24px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages History */}
      <h3 style={{ margin: "0 0 18px 0", fontSize: "16px", color: "#f8fafc", fontWeight: "700" }}>
        📬 Message History
      </h3>
      
      {messages.length === 0 ? (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "15px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <p style={{ fontWeight: "500", color: "#94a3b8" }}>No messages yet</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>Try sending a command or message!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.slice().reverse().map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: "18px",
                background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{
                  padding: "6px 12px",
                  background: "rgba(74, 21, 75, 0.3)",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                  fontWeight: "600",
                }}>
                  {msg.channel}
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0" }}>
                {msg.message}
              </p>
            </div>
          ))}
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
          Total messages: <strong style={{ color: "#f8fafc" }}>{messages.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default SlackIntegration;
