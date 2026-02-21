import { useState, useEffect } from "react";

interface Conflict {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: string;
}

interface Suggestion {
  time: string;
  reason: string;
  confidence: string;
  date?: string;
}

interface ConflictData {
  success: boolean;
  date: string;
  time: string;
  has_conflicts: boolean;
  conflicts: Conflict[];
  suggestions: Suggestion[];
  conflict_count: number;
}

interface Props {
  refreshTrigger?: number;
  defaultDate?: string;
  onConflictChecked?: () => void;
}

function ConflictDetection({ refreshTrigger = 0, defaultDate = "", onConflictChecked }: Props) {
  const [conflicts, setConflicts] = useState<ConflictData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [refreshTrigger]);

  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate]);

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/calendar/events");
      const data = await response.json();
      setCalendarEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    }
  };

const checkConflicts = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/conflict/detect?date=${selectedDate}&time=${selectedTime}`
      );
      const data = await response.json();
      setConflicts(data);
      
      // Notify parent that conflict check was performed
      if (onConflictChecked) {
        onConflictChecked();
      }
    } catch (error) {
      console.error("Failed to check conflicts:", error);
    }
    setLoading(false);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "#10b981";
      case "medium": return "#f59e0b";
      case "low": return "#ef4444";
      default: return "#64748b";
    }
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

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
          <span>⚠️</span> Conflict Detection
        </h2>
        <span style={{
          padding: "8px 16px",
          background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
          borderRadius: "20px",
          color: "white",
          fontSize: "12px",
          fontWeight: "600",
        }}>
          🔍 Real-Time Detection
        </span>
      </div>

      {/* Real-World Problem Solving Demo */}
      <div style={{
        marginBottom: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)",
        borderRadius: "12px",
        textAlign: "center",
        border: "1px solid rgba(245, 158, 11, 0.2)",
      }}>
        <p style={{ color: "#94a3b8", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          💡 "FlowPilot detects meeting conflicts and suggests optimal alternative times."
        </p>
      </div>

      {/* Check Conflicts Form */}
      <div style={{
        marginBottom: "24px",
        padding: "20px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: "14px",
          alignItems: "end",
        }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#94a3b8",
              marginBottom: "8px",
            }}>
              📅 Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "14px",
                background: "#0f0f18",
                color: "#f8fafc",
              }}
            />
          </div>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#94a3b8",
              marginBottom: "8px",
            }}>
              🕐 Select Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "14px",
                background: "#0f0f18",
                color: "#f8fafc",
              }}
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <button
            onClick={checkConflicts}
            disabled={loading || !selectedDate}
            style={{
              padding: "12px 24px",
              background: loading || !selectedDate 
                ? "#3f3f5a" 
                : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading || !selectedDate ? "not-allowed" : "pointer",
              boxShadow: loading || !selectedDate ? "none" : "0 4px 16px rgba(245, 158, 11, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "🔄 Checking..." : "⚠️ Check Conflicts"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {conflicts && (
        <div>
          {/* Conflict Status Banner */}
          <div style={{
            padding: "20px",
            background: conflicts.has_conflicts 
              ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)"
              : "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)",
            borderRadius: "14px",
            marginBottom: "24px",
            textAlign: "center",
            border: `2px solid ${conflicts.has_conflicts ? "#ef4444" : "#10b981"}`,
          }}>
            <span style={{
              fontSize: "36px",
              marginBottom: "10px",
              display: "block",
            }}>
              {conflicts.has_conflicts ? "⚠️" : "✅"}
            </span>
            <p style={{
              fontSize: "18px",
              fontWeight: "700",
              color: conflicts.has_conflicts ? "#ef4444" : "#10b981",
              margin: 0,
            }}>
              {conflicts.has_conflicts 
                ? `${conflicts.conflict_count} Meeting Conflict${conflicts.conflict_count > 1 ? "s" : ""} Detected!`
                : "No Conflicts - Time Slot Available!"
              }
            </p>
          </div>

          {/* Conflicting Meetings */}
          {conflicts.has_conflicts && conflicts.conflicts.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#f8fafc",
                marginBottom: "14px",
              }}>
                📅 Conflicting Meetings
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {conflicts.conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    style={{
                      padding: "18px",
                      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
                      borderRadius: "12px",
                      border: "2px solid #ef4444",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#f8fafc",
                        margin: "0 0 8px 0",
                      }}>
                        📅 {conflict.title}
                      </h4>
                      <p style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        margin: 0,
                      }}>
                        🕐 {conflict.time} • ⏱️ {conflict.duration}
                      </p>
                    </div>
                    <span style={{
                      padding: "6px 14px",
                      background: "rgba(239, 68, 68, 0.2)",
                      borderRadius: "20px",
                      color: "#ef4444",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}>
                      CONFLICT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          {conflicts.has_conflicts && conflicts.suggestions.length > 0 && (
            <div style={{
              padding: "18px",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
              borderRadius: "12px",
              border: "2px solid #10b981",
            }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#f8fafc",
                marginBottom: "14px",
              }}>
                💡 Smart Alternative Suggestions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {conflicts.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "14px",
                      background: "rgba(15, 15, 24, 0.8)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#f8fafc",
                        margin: "0 0 4px 0",
                      }}>
                        🕐 {suggestion.time}
                      </p>
                      <p style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: 0,
                      }}>
                        {suggestion.reason}
                      </p>
                    </div>
                    <span style={{
                      padding: "6px 14px",
                      background: `${getConfidenceColor(suggestion.confidence)}20`,
                      borderRadius: "20px",
                      color: getConfidenceColor(suggestion.confidence),
                      fontSize: "11px",
                      fontWeight: "600",
                    }}>
                      {suggestion.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar Overview */}
      <div style={{ marginTop: "28px" }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#f8fafc",
          marginBottom: "14px",
        }}>
          📅 Upcoming Calendar Events
        </h3>
        {calendarEvents.length === 0 ? (
          <div style={{
            padding: "24px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            background: "rgba(15, 15, 24, 0.8)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
            <p>No calendar events yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {calendarEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                style={{
                  padding: "14px",
                  background: "rgba(15, 15, 24, 0.8)",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div>
                  <p style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#f8fafc",
                    margin: 0,
                  }}>
                    📅 {event.title}
                  </p>
                  <p style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "6px 0 0 0",
                  }}>
                    {event.date} at {event.time}
                  </p>
                </div>
                <span style={{
                  padding: "5px 12px",
                  background: "rgba(16, 185, 129, 0.2)",
                  borderRadius: "20px",
                  color: "#10b981",
                  fontSize: "11px",
                  fontWeight: "600",
                }}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!conflicts && !loading && (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "15px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <p style={{ fontWeight: "500", color: "#94a3b8" }}>Select a date and time</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>Click "Check Conflicts" to detect meeting conflicts!</p>
        </div>
      )}
    </div>
  );
}

export default ConflictDetection;
