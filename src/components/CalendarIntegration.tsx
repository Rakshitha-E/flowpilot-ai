import { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  status: string;
  created_at: string;
}

interface PrefillData {
  task: string;
  deadline: string;
  priority: string;
  sender?: string;
}

interface Props {
  refreshTrigger?: number;
  prefillData?: PrefillData | null;
}

function CalendarIntegration({ refreshTrigger = 0, prefillData }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: prefillData?.task || "",
    date: prefillData?.deadline || "",
    time: "09:00 AM",
    attendees: prefillData?.sender || ""
  });

  // Auto-show form when prefillData is available
  useEffect(() => {
    if (prefillData?.task) {
      setShowForm(true);
      setNewEvent({
        title: prefillData.task,
        date: prefillData.deadline || "",
        time: "09:00 AM",
        attendees: prefillData.sender || ""
      });
    }
  }, [prefillData]);

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/calendar/events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    }
    setLoading(false);
  };

const createEvent = async () => {
    // Clear previous errors
    setError(null);
    
    // Validate inputs
    if (!newEvent.title.trim()) {
      setError("Please enter a meeting title");
      return;
    }
    
    if (!newEvent.date) {
      setError("Please select a date");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/calendar/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          attendees: newEvent.attendees ? newEvent.attendees.split(",").map(e => e.trim()) : []
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvents([...events, data.event]);
        setShowForm(false);
        setNewEvent({ title: "", date: "", time: "09:00 AM", attendees: "" });
        
        if (data.conflict_warning?.has_conflicts) {
          alert("⚠️ Warning: Calendar conflict detected! Please review suggestions.");
        }

        // Record metrics - meeting scheduled
        try {
          await fetch("http://127.0.0.1:8000/metrics/record-meeting", {
            method: "POST"
          });
        } catch (metricError) {
          console.error("Failed to record meeting metric:", metricError);
        }
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      setError("Failed to create meeting. Please check if the backend is running.");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "#10b981";
      case "cancelled": return "#ef4444";
      case "completed": return "#6366f1";
      default: return "#64748b";
    }
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
        Loading calendar events...
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
          <span>📅</span> Google Calendar Integration
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchEvents}
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
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 18px",
              background: showForm ? "#3f3f5a" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: showForm ? "none" : "0 4px 16px rgba(16, 185, 129, 0.3)",
            }}
          >
            {showForm ? "✖ Cancel" : "+ New Meeting"}
          </button>
        </div>
      </div>

      {/* Google Calendar Demo Badge */}
      <div style={{
        marginBottom: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%)",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 16px rgba(66, 133, 244, 0.3)",
      }}>
        <p style={{ color: "white", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          📅 Auto-create meetings on approval - Connected to Google Calendar
        </p>
      </div>

      {/* Create Event Form */}
      {showForm && (
        <div style={{
          marginBottom: "24px",
          padding: "24px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "14px",
          border: "2px solid #6366f1",
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#f8fafc", fontWeight: "700" }}>
            📅 Schedule New Meeting
          </h3>
          
          {/* Error Message */}
          {error && (
            <div style={{
              padding: "12px 16px",
              marginBottom: "16px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#fca5a5",
              fontSize: "13px",
              fontWeight: "500",
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <div style={{ display: "grid", gap: "14px" }}>
            <input
              type="text"
              placeholder="Meeting title *"
              value={newEvent.title}
              onChange={(e) => {
                setNewEvent({ ...newEvent, title: e.target.value });
                setError(null);
              }}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: error && !newEvent.title ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "14px",
                background: "#0f0f18",
                color: "#f8fafc",
                outline: "none",
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => {
                  setNewEvent({ ...newEvent, date: e.target.value });
                  setError(null);
                }}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: error && !newEvent.date ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "14px",
                  background: "#0f0f18",
                  color: "#f8fafc",
                  outline: "none",
                }}
              />
              <select
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "14px",
                  background: "#0f0f18",
                  color: "#f8fafc",
                  outline: "none",
                }}
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>02:00 PM</option>
                <option>03:00 PM</option>
                <option>04:00 PM</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Attendees (comma separated emails)"
              value={newEvent.attendees}
              onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "14px",
                background: "#0f0f18",
                color: "#f8fafc",
                outline: "none",
              }}
            />
            <button
              onClick={createEvent}
              disabled={isCreating}
              style={{
                padding: "14px",
                background: isCreating 
                  ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" 
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isCreating ? "not-allowed" : "pointer",
                boxShadow: isCreating ? "none" : "0 4px 16px rgba(16, 185, 129, 0.3)",
                opacity: isCreating ? 0.7 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {isCreating ? "⏳ Creating..." : "📅 Create Meeting"}
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "15px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
          <p style={{ fontWeight: "500", color: "#94a3b8" }}>No calendar events yet</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>Create a meeting to see it here!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                padding: "18px",
                background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#f8fafc", fontWeight: "600" }}>
                  📅 {event.title}
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                  🕐 {event.date} at {event.time}
                </p>
                {event.attendees && event.attendees.length > 0 && (
                  <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                    👥 {event.attendees.join(", ")}
                  </p>
                )}
              </div>
              <span style={{
                padding: "6px 14px",
                background: `${getStatusColor(event.status)}20`,
                borderRadius: "20px",
                color: getStatusColor(event.status),
                fontSize: "12px",
                fontWeight: "600",
              }}>
                {event.status.toUpperCase()}
              </span>
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
          Total meetings scheduled: <strong style={{ color: "#f8fafc" }}>{events.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default CalendarIntegration;
