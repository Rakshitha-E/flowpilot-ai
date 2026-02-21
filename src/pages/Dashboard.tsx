import { useState, useCallback } from "react";
import EmailInput from "../components/EmailInput";
import TaskResult from "../components/TaskResult";
import TasksList from "../components/TasksList";
import AgentPanel from "../components/AgentPanel";
import AuditLog from "../components/AuditLog";
import CalendarIntegration from "../components/CalendarIntegration";
import SlackIntegration from "../components/SlackIntegration";
import SafetyPanel from "../components/SafetyPanel";
import PriorityScoring from "../components/PriorityScoring";
import ConflictDetection from "../components/ConflictDetection";
import MetricsPanel from "../components/MetricsPanel";
import ProgressBar from "../components/ProgressBar";
import ActivityTimeline from "../components/ActivityTimeline";

type SectionType = "inbox" | "workflow" | "integrations" | "insights";
type TabType = "email" | "tasks" | "agents" | "calendar" | "slack" | "audit" | "safety" | "priority" | "conflicts" | "metrics";

interface TimelineEntry {
  id: number;
  timestamp: Date;
  action: string;
  details: string;
  type: "email" | "priority" | "conflict" | "approval" | "schedule" | "notification";
}

interface ActiveWorkflow {
  email: string;
  task: string;
  deadline: string;
  priority: string;
  sender?: string;
}

function Dashboard() {
  const [result, setResult] = useState<any>(null);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("email");
  const [activeSection, setActiveSection] = useState<SectionType>("inbox");
  const [tasksRefresh, setTasksRefresh] = useState(0);
  const [selectedTaskId] = useState<number | undefined>(undefined);
  
  // New state for unified workflow
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow | null>(null);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelineIdCounter, setTimelineIdCounter] = useState(0);

  // Add entry to timeline
  const addTimelineEntry = useCallback((action: string, details: string, type: TimelineEntry["type"]) => {
    setTimeline(prev => [...prev, {
      id: timelineIdCounter,
      timestamp: new Date(),
      action,
      details,
      type
    }]);
    setTimelineIdCounter(prev => prev + 1);
  }, [timelineIdCounter]);

  // Clear timeline
  const clearTimeline = useCallback(() => {
    setTimeline([]);
  }, []);

  const handleTaskApproved = () => {
    setTasksRefresh(tasksRefresh + 1);
    // Auto-trigger workflow progression
    setWorkflowStep(3);
    addTimelineEntry("Task Approved", "Task has been approved and created", "approval");
    
    // Auto-trigger calendar and notifications
    setTimeout(() => {
      setWorkflowStep(4);
      addTimelineEntry("Meeting Scheduled", "Calendar event created automatically", "schedule");
    }, 1500);
    
    setTimeout(() => {
      setWorkflowStep(5);
      addTimelineEntry("Notification Sent", "Slack notification sent to team", "notification");
    }, 3000);
  };

  const handleEmailAnalyzed = (data: any) => {
    setResult(data);
    
    // Extract sender from email if available
    let sender = "client@example.com";
    if (data.workflowData?.agents) {
      const emailAgent = data.workflowData.agents.find((a: any) => a.name?.includes("Email"));
      if (emailAgent) {
        sender = "client@company.com";
      }
    }
    
    // Set active workflow
    setActiveWorkflow({
      email: data.task || "Meeting request",
      task: data.task || "",
      deadline: data.deadline || "",
      priority: data.priority || "Medium",
      sender
    });
    
    // Update workflow progress
    setWorkflowStep(0);
    addTimelineEntry("Email Analyzed", `Task: ${data.task || "Unknown"} | Priority: ${data.priority || "Medium"}`, "email");
    
    // Auto-trigger priority scoring after a short delay
    setTimeout(() => {
      setWorkflowStep(1);
      addTimelineEntry("Priority Assigned", `Priority level: ${data.priority || "Medium"}`, "priority");
    }, 1000);
  };

  const handlePriorityCalculated = () => {
    if (workflowStep < 1) {
      setWorkflowStep(1);
      addTimelineEntry("Priority Calculated", "AI priority scoring completed", "priority");
    }
  };

  const handleConflictChecked = () => {
    if (workflowStep < 2) {
      setWorkflowStep(2);
      addTimelineEntry("Conflict Checked", "Calendar conflicts analyzed", "conflict");
    }
  };

  // 4 Smart Sections with colors
  const sections = [
    { id: "inbox" as SectionType, label: "Inbox & Analysis", icon: "📨", color: "#22c55e" },
    { id: "workflow" as SectionType, label: "Workflow", icon: "⚙️", color: "#eab308" },
    { id: "integrations" as SectionType, label: "Integrations", icon: "🔗", color: "#3b82f6" },
    { id: "insights" as SectionType, label: "Insights & Safety", icon: "📊", color: "#6366f1" },
  ];

  // Tabs per section
  const sectionTabs: Record<SectionType, { id: TabType; label: string; icon: string }[]> = {
    inbox: [
      { id: "email" as TabType, label: "Email Input", icon: "📧" },
      { id: "priority" as TabType, label: "Priority Scoring", icon: "🎯" },
      { id: "conflicts" as TabType, label: "Conflict Detection", icon: "⚠️" },
    ],
    workflow: [
      { id: "agents" as TabType, label: "Workflow", icon: "🔄" },
      { id: "tasks" as TabType, label: "Tasks", icon: "📋" },
    ],
    integrations: [
      { id: "calendar" as TabType, label: "Calendar", icon: "📅" },
      { id: "slack" as TabType, label: "Slack", icon: "💬" },
    ],
    insights: [
      { id: "metrics" as TabType, label: "Metrics", icon: "📈" },
      { id: "audit" as TabType, label: "Audit Log", icon: "📋" },
      { id: "safety" as TabType, label: "Safety Rules", icon: "🛡️" },
    ],
  };

  const handleSectionChange = (sectionId: SectionType) => {
    setActiveSection(sectionId);
    // Set first tab of this section as active
    setActiveTab(sectionTabs[sectionId][0].id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "email":
        return (
          <>
            <EmailInput setResult={handleEmailAnalyzed} />
            {result && (
              <TaskResult
                result={result}
                autonomousMode={autonomousMode}
                onTaskApproved={handleTaskApproved}
              />
            )}
          </>
        );
      case "tasks":
        return <TasksList refreshTrigger={tasksRefresh} />;
      case "agents":
        return <AgentPanel workflowData={result?.workflowData} isVisible={activeTab === "agents"} />;
      case "priority":
        return (
          <PriorityScoring 
            emailText={activeWorkflow?.task ? `${activeWorkflow.task} ${activeWorkflow.deadline || ""}` : ""} 
            refreshTrigger={tasksRefresh}
            onScoreCalculated={handlePriorityCalculated}
          />
        );
      case "conflicts":
        return (
          <ConflictDetection 
            refreshTrigger={tasksRefresh}
            defaultDate={activeWorkflow?.deadline || ""}
            onConflictChecked={handleConflictChecked}
          />
        );
      case "calendar":
        return (
          <CalendarIntegration 
            refreshTrigger={tasksRefresh}
            prefillData={activeWorkflow}
          />
        );
      case "slack":
        return <SlackIntegration refreshTrigger={tasksRefresh} />;
      case "metrics":
        return <MetricsPanel refreshTrigger={tasksRefresh} />;
      case "audit":
        return <AuditLog refreshTrigger={tasksRefresh} />;
      case "safety":
        return <SafetyPanel taskId={selectedTaskId} emailText={activeWorkflow?.task || ""} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: "rgba(26, 26, 36, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: "24px",
      boxShadow: `
        0 25px 50px -12px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.05)
      `,
      maxWidth: "1400px",
      width: "100%",
      padding: "32px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative glow effects */}
      <div style={{
        position: "absolute",
        top: "-100px",
        right: "-100px",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-50px",
        left: "-50px",
        width: "200px",
        height: "200px",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        position: "relative",
        zIndex: 1,
      }}>
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
            }}>
              🚀
            </div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px",
              margin: 0,
            }}>FlowPilot</h1>
          </div>
          <p style={{ 
            color: "#94a3b8", 
            fontSize: "14px", 
            fontWeight: "500",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: autonomousMode ? "#10b981" : "#6366f1",
              boxShadow: autonomousMode ? "0 0 12px #10b981" : "0 0 12px #6366f1",
            }} />
            {autonomousMode ? "Autonomous Mode" : "Manual Mode"} • Multi-Agent AI Automation
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <style>{`
            .mode-toggle {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .mode-toggle:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5) !important;
            }
            .mode-toggle:active {
              transform: translateY(0);
            }
          `}</style>
          <button
            onClick={() => setAutonomousMode(!autonomousMode)}
            className="mode-toggle"
            style={{
              padding: "14px 24px",
              fontSize: "14px",
              fontWeight: "700",
              color: "white",
              background: autonomousMode
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              border: `2px solid ${autonomousMode ? "#10b981" : "#6366f1"}`,
              borderRadius: "14px",
              cursor: "pointer",
              boxShadow: autonomousMode 
                ? "0 6px 20px rgba(16, 185, 129, 0.4)" 
                : "0 6px 20px rgba(99, 102, 241, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: autonomousMode ? "#34d399" : "#a5b4fc",
              boxShadow: autonomousMode ? "0 0 12px #10b981" : "0 0 12px #6366f1",
            }} />
            {autonomousMode ? "🤖 Auto" : "👤 Manual"}
          </button>
        </div>
      </div>

      {/* Progress Bar - Shows workflow progress */}
      <ProgressBar 
        currentStep={workflowStep} 
        workflowEmail={activeWorkflow ? `From: ${activeWorkflow.sender} | Task: ${activeWorkflow.task}` : ""}
      />

      {/* Main Content Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "24px",
      }}>
        {/* Left Column - Main Content */}
        <div>
          {/* Section Navigation - 4 Smart Sections */}
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            overflowX: "auto",
            paddingBottom: "8px",
            position: "relative",
            zIndex: 1,
          }}>
            <style>{`
              .section-button {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .section-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
              }
            `}</style>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className="section-button"
                style={{
                  padding: "12px 20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: activeSection === section.id ? "#f8fafc" : "#cbd5e1",
                  background: activeSection === section.id
                    ? `linear-gradient(135deg, ${section.color} 0%, ${section.color}99 100%)`
                    : "rgba(30, 30, 46, 0.9)",
                  border: activeSection === section.id
                    ? `1px solid ${section.color}`
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: activeSection === section.id 
                    ? `0 6px 20px ${section.color}40`
                    : "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                <span style={{ marginRight: "8px" }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          {/* Sub-Tab Navigation for Current Section */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            overflowX: "auto",
            paddingBottom: "8px",
            position: "relative",
            zIndex: 1,
          }}>
            <style>{`
              .tab-button {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .tab-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3) !important;
              }
            `}</style>
            {sectionTabs[activeSection].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="tab-button"
                style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: activeTab === tab.id ? "#f8fafc" : "#cbd5e1",
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "rgba(30, 30, 46, 0.9)",
                  border: activeTab === tab.id
                    ? "1px solid rgba(139, 92, 246, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: activeTab === tab.id 
                    ? "0 6px 20px rgba(99, 102, 241, 0.4)" 
                    : "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                <span style={{ marginRight: "6px" }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{
            minHeight: "400px",
            position: "relative",
            zIndex: 1,
          }}>
            {renderContent()}
          </div>
        </div>

        {/* Right Column - Activity Timeline */}
        <div style={{
          position: "sticky",
          top: "20px",
          height: "fit-content",
        }}>
          <ActivityTimeline 
            entries={timeline} 
            onClear={clearTimeline}
          />
        </div>
      </div>

      {/* Footer - Impact Line */}
      <div style={{
        marginTop: "32px",
        padding: "20px",
        background: "linear-gradient(135deg, #1e1e2e 0%, #0f0f18 100%)",
        borderRadius: "14px",
        textAlign: "center",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)",
        }} />
        <p style={{ 
          color: "#cbd5e1", 
          fontWeight: "600", 
          margin: 0, 
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#ef4444",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          "FlowPilot orchestrates multiple AI agents to automate enterprise workflows."
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
