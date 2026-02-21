import { useState, useEffect } from "react";

interface Props {
  emailText?: string;
  refreshTrigger?: number;
  onScoreCalculated?: () => void;
}

interface PriorityScore {
  success: boolean;
  priority_level: string;
  total_score: number;
  scores: {
    urgency_score: number;
    importance_score: number;
    deadline_score: number;
    sender_score: number;
    keyword_score: number;
  };
  reasons: string[];
  decision_explanation: string;
  is_low_priority: boolean;
}

function PriorityScoring({ emailText = "", refreshTrigger = 0, onScoreCalculated }: Props) {
  const [score, setScore] = useState<PriorityScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState(emailText);

useEffect(() => {
    if (emailText) {
      setInputText(emailText);
    }
  }, [emailText]);

  // Handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      // Optional: Auto-refresh or clear state when triggered
    }
  }, [refreshTrigger]);

const calculatePriority = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/priority/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText: inputText }),
      });
      const data = await response.json();
      setScore(data);
      
      // Notify parent that priority was calculated
      if (onScoreCalculated) {
        onScoreCalculated();
      }
    } catch (error) {
      console.error("Failed to calculate priority:", error);
    }
    setLoading(false);
  };

  const getScoreColor = (scoreValue: number, maxScore: number = 100) => {
    const percentage = (scoreValue / maxScore) * 100;
    if (percentage >= 70) return "#ef4444";
    if (percentage >= 40) return "#f59e0b";
    return "#10b981";
  };

  const getPriorityBadgeColor = (level: string) => {
    switch (level) {
      case "High": return "#ef4444";
      case "Medium": return "#f59e0b";
      case "Low": return "#10b981";
      default: return "#64748b";
    }
  };

  const scoreCategories = score ? [
    { name: "Urgency", value: score.scores.urgency_score, max: 40, icon: "🔥" },
    { name: "Importance", value: score.scores.importance_score, max: 30, icon: "⭐" },
    { name: "Deadline", value: score.scores.deadline_score, max: 50, icon: "📅" },
    { name: "Sender VIP", value: score.scores.sender_score, max: 20, icon: "👤" },
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
          <span>🎯</span> Priority Scoring System
        </h2>
        <span style={{
          padding: "8px 16px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: "20px",
          color: "white",
          fontSize: "12px",
          fontWeight: "600",
        }}>
          🧠 AI Decision-Making
        </span>
      </div>

      {/* AI Decision Demo Line */}
      <div style={{
        marginBottom: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, #1e1e2e 0%, #0f0f18 100%)",
        borderRadius: "12px",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        textAlign: "center",
      }}>
        <p style={{ color: "#94a3b8", fontWeight: "600", margin: 0, fontSize: "14px" }}>
          💡 "FlowPilot's AI analyzes multiple factors to determine priority with transparent scoring."
        </p>
      </div>

      {/* Input Section */}
      <div style={{
        marginBottom: "24px",
        padding: "20px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste email text to analyze priority..."
          style={{
            width: "100%",
            height: "100px",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: "14px",
            background: "#0f0f18",
            color: "#f8fafc",
          }}
        />
        <button
          onClick={calculatePriority}
          disabled={loading || !inputText.trim()}
          style={{
            padding: "12px 24px",
            background: loading || !inputText.trim() 
              ? "#3f3f5a" 
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
            boxShadow: loading || !inputText.trim() ? "none" : "0 4px 16px rgba(99, 102, 241, 0.4)",
          }}
        >
          {loading ? "🔄 Analyzing..." : "🎯 Calculate Priority Score"}
        </button>
      </div>

      {/* Results Section */}
      {score && (
        <div>
          {/* Main Score Display */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}>
            {/* Total Score Circle */}
            <div style={{
              padding: "28px",
              background: "linear-gradient(145deg, #1a1a24 0%, #0f0f18 100%)",
              borderRadius: "16px",
              border: `3px solid ${getScoreColor(score.total_score)}`,
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
              <p style={{
                fontSize: "56px",
                fontWeight: "800",
                color: getScoreColor(score.total_score),
                margin: 0,
                lineHeight: 1,
              }}>
                {score.total_score}
              </p>
              <p style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "10px 0 0 0",
              }}>
                / 100
              </p>
            </div>

            {/* Priority Level Badge */}
            <div style={{
              padding: "28px",
              background: "linear-gradient(145deg, #1a1a24 0%, #0f0f18 100%)",
              borderRadius: "16px",
              border: `3px solid ${getPriorityBadgeColor(score.priority_level)}`,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
              <span style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "12px",
                fontWeight: "500",
              }}>
                AI Decision
              </span>
              <span style={{
                padding: "14px 28px",
                background: getPriorityBadgeColor(score.priority_level),
                borderRadius: "10px",
                color: "white",
                fontSize: "22px",
                fontWeight: "700",
              }}>
                {score.priority_level.toUpperCase()}
              </span>
              {score.is_low_priority && (
                <span style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#10b981",
                  fontWeight: "600",
                }}>
                  📧 Low Priority (FYI)
                </span>
              )}
            </div>
          </div>

          {/* Score Breakdown */}
          <div style={{
            marginBottom: "24px",
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#f8fafc",
              marginBottom: "16px",
            }}>
              📊 AI Decision Breakdown
            </h3>
            {scoreCategories.map((category) => (
              <div key={category.name} style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "14px",
              }}>
                <span style={{
                  width: "100px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  fontWeight: "500",
                }}>
                  {category.icon} {category.name}
                </span>
                <div style={{
                  flex: 1,
                  height: "24px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginRight: "14px",
                }}>
                  <div style={{
                    width: `${(category.value / category.max) * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${getScoreColor(category.value, category.max)} 0%, ${getScoreColor(category.value, category.max)}cc 100%)`,
                    borderRadius: "12px",
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <span style={{
                  width: "50px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                  fontWeight: "600",
                  textAlign: "right",
                }}>
                  {category.value}/{category.max}
                </span>
              </div>
            ))}
          </div>

          {/* AI Reasoning */}
          <div style={{
            padding: "18px",
            background: "linear-gradient(145deg, #1e1e2e 0%, #16161f 100%)",
            borderRadius: "12px",
            borderLeft: "4px solid #6366f1",
          }}>
            <h4 style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#f8fafc",
              margin: "0 0 14px 0",
            }}>
              🧠 AI Decision Reasoning
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: "20px",
              fontSize: "13px",
              color: "#94a3b8",
            }}>
              {score.reasons.length > 0 ? (
                score.reasons.map((reason, index) => (
                  <li key={index} style={{ marginBottom: "8px" }}>
                    {reason}
                  </li>
                ))
              ) : (
                <li>No specific factors detected - using default priority</li>
              )}
            </ul>
            <p style={{
              marginTop: "14px",
              padding: "12px",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#a5b4fc",
              textAlign: "center",
            }}>
              {score.decision_explanation}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!score && !loading && (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "15px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
          <p style={{ fontWeight: "500", color: "#94a3b8" }}>Enter email text above</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>Click "Calculate Priority Score" to see AI decision-making in action!</p>
        </div>
      )}
    </div>
  );
}

export default PriorityScoring;
