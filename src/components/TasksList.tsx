import { useState, useEffect } from "react";
import { API_BASE_URL } from "../lib/api";

interface Task {
  id: number;
  task: string;
  deadline: string;
  priority: string;
  status: string;
  reminder: string;
  created_at: string;
  autonomous?: boolean;
}

interface Props {
  refreshTrigger: number;
  onBack?: () => void;
}

function TasksList({ refreshTrigger }: Props) {
  const [tasks, setTasks] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
    setLoading(false);
  };

const markComplete = async (taskId: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/task/${taskId}/complete`, {
        method: "POST",
      });
      
      // Record metrics - task completed
      try {
        await fetch("http://127.0.0.1:8000/metrics/record-completion", {
          method: "POST"
        });
      } catch (metricError) {
        console.error("Failed to record completion metric:", metricError);
      }
      
      fetchTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "#ef4444";
    if (priority === "Medium") return "#f59e0b";
    return "#10b981";
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "Completed" ? "#10b981" : "#f59e0b";
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
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (!tasks || tasks.total === 0) {
    return (
      <div style={{
        padding: "60px",
        textAlign: "center",
        color: "#64748b",
        fontSize: "15px",
        background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
        <p style={{ fontWeight: "500", color: "#94a3b8" }}>No tasks yet</p>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>Analyze an email and approve it to create a task!</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "28px",
      }}>
        <div style={{
          padding: "24px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: "14px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
        }}>
          <p style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{tasks.total}</p>
          <p style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500" }}>Total Tasks</p>
        </div>
        <div style={{
          padding: "24px",
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          borderRadius: "14px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(245, 158, 11, 0.4)",
        }}>
          <p style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{tasks.pending}</p>
          <p style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500" }}>Pending</p>
        </div>
        <div style={{
          padding: "24px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "14px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
        }}>
          <p style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{tasks.completed}</p>
          <p style={{ fontSize: "13px", opacity: 0.9, fontWeight: "500" }}>Completed</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {tasks.tasks.map((task: Task) => (
          <div
            key={task.id}
            style={{
              padding: "22px",
              background: task.status === "Completed" 
                ? "rgba(15, 15, 24, 0.6)" 
                : "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
              borderRadius: "14px",
              border: `2px solid ${task.status === "Completed" ? "rgba(255,255,255,0.05)" : getPriorityColor(task.priority)}`,
              opacity: task.status === "Completed" ? 0.7 : 1,
              transition: "all 0.25s ease",
              boxShadow: task.status !== "Completed" ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: "16px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "10px",
                }}>
                  <p style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#f8fafc",
                    margin: 0,
                  }}>
                    {task.task}
                  </p>
                  <span style={{
                    padding: "5px 12px",
                    background: `${getStatusBadgeColor(task.status)}20`,
                    color: getStatusBadgeColor(task.status),
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}>
                    {task.status}
                  </span>
                </div>
                <p style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  margin: "0 0 8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  📅 Deadline: <strong style={{ color: "#e2e8f0" }}>{task.deadline}</strong>
                </p>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px 0" }}>
                  ⏰ {task.reminder}
                </p>
                {task.autonomous && (
                  <p style={{ fontSize: "12px", color: "#a855f7", fontWeight: "600", margin: 0 }}>
                    🤖 Auto-approved
                  </p>
                )}
              </div>

              {task.status === "Pending" && (
                <button
                  onClick={() => markComplete(task.id)}
                  style={{
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "white",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.25s ease",
                  }}
                >
                  ✓ Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TasksList;
