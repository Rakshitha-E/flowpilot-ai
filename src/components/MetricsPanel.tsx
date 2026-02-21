import { useState, useEffect } from "react";

interface Metrics {
  total_emails_processed: number;
  total_tasks_created: number;
  total_tasks_completed: number;
  total_meetings_scheduled: number;
  total_slack_messages: number;
  autonomous_approvals: number;
  human_approvals: number;
  time_saved_minutes: number;
  time_saved_hours: number;
  efficiency_score: number;
  uptime_hours: number;
}

interface EnterpriseMetrics {
  roi_indicator: string;
  automation_rate: string;
  tasks_per_day: number;
  email_processing_rate: number;
}

interface MetricsData {
  success: boolean;
  metrics: Metrics;
  enterprise_metrics: EnterpriseMetrics;
}

interface Props {
  refreshTrigger?: number;
}

function MetricsPanel({ refreshTrigger = 0 }: Props) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [refreshTrigger]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/metrics/dashboard");
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
    setLoading(false);
  };

  const resetMetrics = async () => {
    try {
      await fetch("http://127.0.0.1:8000/metrics/reset", {
        method: "POST",
      });
      fetchMetrics();
    } catch (error) {
      console.error("Failed to reset metrics:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const metricCards = metrics ? [
    { 
      title: "Emails Processed", 
      value: metrics.metrics.total_emails_processed, 
      icon: "📧", 
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
    },
    { 
      title: "Tasks Created", 
      value: metrics.metrics.total_tasks_created, 
      icon: "✅", 
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    { 
      title: "Tasks Completed", 
      value: metrics.metrics.total_tasks_completed, 
      icon: "🎯", 
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    { 
      title: "Meetings Scheduled", 
      value: metrics.metrics.total_meetings_scheduled, 
      icon: "📅", 
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    { 
      title: "Slack Messages", 
      value: metrics.metrics.total_slack_messages, 
      icon: "💬", 
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
    },
    { 
      title: "Time Saved (hrs)", 
      value: metrics.metrics.time_saved_hours, 
      icon: "⏰", 
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      isDecimal: true
    },
  ] : [];

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
          <span>📊</span> Automation Metrics
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={resetMetrics}
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
            🗑️ Reset
          </button>
        </div>
      </div>

      {/* Enterprise Value Proposition */}
      <div style={{
        marginBottom: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, #1e1e2e 0%, #0f0f18 100%)",
        borderRadius: "12px",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        textAlign: "center",
      }}>
        <p style={{ color: "#94a3b8", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          📈 "FlowPilot demonstrates measurable enterprise value through automation metrics."
        </p>
      </div>

      {/* Key Metrics Grid */}
      {metrics && (
        <div>
          {/* Primary Metrics */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}>
            {metricCards.map((card, index) => (
              <div
                key={index}
                style={{
                  padding: "24px",
                  background: card.gradient,
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                <p style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  margin: "0 0 8px 0",
                }}>
                  {card.isDecimal ? card.value.toFixed(1) : card.value}
                </p>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  margin: 0,
                  opacity: 0.9,
                }}>
                  {card.icon} {card.title}
                </p>
              </div>
            ))}
          </div>

          {/* Efficiency Score */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "28px",
          }}>
            {/* Efficiency Score Circle */}
            <div style={{
              padding: "28px",
              background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              textAlign: "center",
            }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#94a3b8",
                marginBottom: "20px",
              }}>
                🤖 Automation Efficiency Score
              </h3>
              <div style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: `conic-gradient(${getScoreColor(metrics.metrics.efficiency_score)} ${metrics.metrics.efficiency_score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}>
                <div style={{
                  width: "115px",
                  height: "115px",
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #1a1a24 0%, #0f0f18 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <span style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    color: getScoreColor(metrics.metrics.efficiency_score),
                  }}>
                    {metrics.metrics.efficiency_score}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: "12px",
                color: "#64748b",
                marginTop: "16px",
              }}>
                Autonomous vs Human Approval Ratio
              </p>
            </div>

            {/* Approval Breakdown */}
            <div style={{
              padding: "28px",
              background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#94a3b8",
                marginBottom: "20px",
              }}>
                👥 Approval Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>
                      🤖 Autonomous
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#10b981" }}>
                      {metrics.metrics.autonomous_approvals}
                    </span>
                  </div>
                  <div style={{
                    height: "10px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${metrics.metrics.total_tasks_created > 0 
                        ? (metrics.metrics.autonomous_approvals / metrics.metrics.total_tasks_created) * 100 
                        : 0}%`,
                      background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                      borderRadius: "10px",
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}>
                    <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>
                      👤 Human
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#6366f1" }}>
                      {metrics.metrics.human_approvals}
                    </span>
                  </div>
                  <div style={{
                    height: "10px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${metrics.metrics.total_tasks_created > 0 
                        ? (metrics.metrics.human_approvals / metrics.metrics.total_tasks_created) * 100 
                        : 0}%`,
                      background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
                      borderRadius: "10px",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Metrics */}
          <div style={{
            padding: "24px",
            background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(99, 102, 241, 0.2)",
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#f8fafc",
              marginBottom: "20px",
              textAlign: "center",
            }}>
              🏢 Enterprise Metrics
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}>
              <div style={{
                padding: "20px",
                background: "rgba(15, 15, 24, 0.8)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#10b981",
                  margin: "0 0 6px 0",
                }}>
                  {metrics.enterprise_metrics.roi_indicator}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: "500",
                }}>
                  💰 ROI Value
                </p>
              </div>
              <div style={{
                padding: "20px",
                background: "rgba(15, 15, 24, 0.8)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#6366f1",
                  margin: "0 0 6px 0",
                }}>
                  {metrics.enterprise_metrics.automation_rate}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: "500",
                }}>
                  🤖 Automation Rate
                </p>
              </div>
              <div style={{
                padding: "20px",
                background: "rgba(15, 15, 24, 0.8)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#f59e0b",
                  margin: "0 0 6px 0",
                }}>
                  {metrics.enterprise_metrics.tasks_per_day}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: "500",
                }}>
                  📋 Tasks/Day
                </p>
              </div>
              <div style={{
                padding: "20px",
                background: "rgba(15, 15, 24, 0.8)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#06b6d4",
                  margin: "0 0 6px 0",
                }}>
                  {metrics.enterprise_metrics.email_processing_rate}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: "500",
                }}>
                  📧 Emails/Day
                </p>
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div style={{
            marginTop: "20px",
            padding: "14px",
            background: "rgba(15, 15, 24, 0.8)",
            borderRadius: "10px",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0, fontWeight: "500" }}>
              🕐 System Uptime: <strong style={{ color: "#10b981" }}>{metrics.metrics.uptime_hours.toFixed(1)} hours</strong>
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
          Loading metrics...
        </div>
      )}

      {/* Empty State */}
      {!metrics && !loading && (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "15px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <p style={{ fontWeight: "500", color: "#94a3b8" }}>No metrics available yet</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>Start using FlowPilot to see automation metrics!</p>
        </div>
      )}
    </div>
  );
}

export default MetricsPanel;
