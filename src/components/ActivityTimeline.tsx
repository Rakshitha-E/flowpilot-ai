interface TimelineEntry {
  id: number;
  timestamp: Date;
  action: string;
  details: string;
  type: "email" | "priority" | "conflict" | "approval" | "schedule" | "notification";
}

interface Props {
  entries: TimelineEntry[];
  onClear?: () => void;
}

function ActivityTimeline({ entries = [], onClear }: Props) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "email": return "#6366f1";
      case "priority": return "#a855f7";
      case "conflict": return "#f59e0b";
      case "approval": return "#10b981";
      case "schedule": return "#06b6d4";
      case "notification": return "#ec4899";
      default: return "#64748b";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return "📧";
      case "priority": return "🎯";
      case "conflict": return "⚠️";
      case "approval": return "✅";
      case "schedule": return "📅";
      case "notification": return "💬";
      default: return "🤖";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{
      padding: "20px",
      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#f8fafc",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span>⚡</span> Activity Timeline
        </h3>
        {onClear && entries.length > 0 && (
          <button
            onClick={onClear}
            style={{
              padding: "6px 12px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "6px",
              color: "#f87171",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{
          padding: "30px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "13px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "12px",
        }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📋</div>
          <p style={{ margin: 0, fontWeight: "500" }}>No activity yet</p>
          <p style={{ margin: "6px 0 0 0", fontSize: "12px" }}>Workflow events will appear here</p>
        </div>
      ) : (
        <div style={{
          maxHeight: "300px",
          overflowY: "auto",
        }}>
          {entries.slice().reverse().map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                gap: "12px",
                padding: "12px",
                marginBottom: "8px",
                background: "rgba(15, 15, 24, 0.6)",
                borderRadius: "10px",
                borderLeft: `3px solid ${getTypeColor(entry.type)}`,
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <span style={{ fontSize: "18px" }}>{getTypeIcon(entry.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                  <span style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#f8fafc",
                  }}>
                    {entry.action}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontFamily: "monospace",
                  }}>
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#94a3b8",
                }}>
                  {entry.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: "16px",
        padding: "12px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "8px",
        textAlign: "center",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <p style={{ color: "#64748b", fontSize: "12px", margin: 0, fontWeight: "500" }}>
          Total events: <strong style={{ color: "#f8fafc" }}>{entries.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default ActivityTimeline;
