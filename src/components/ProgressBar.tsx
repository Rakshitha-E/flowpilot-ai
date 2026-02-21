interface Props {
  currentStep: number;
  workflowEmail?: string;
}

function ProgressBar({ currentStep = 0, workflowEmail = "" }: Props) {
  const steps = [
    { id: 0, label: "Email Analyzed", icon: "📧" },
    { id: 1, label: "Priority Assigned", icon: "🎯" },
    { id: 2, label: "Conflict Checked", icon: "⚠️" },
    { id: 3, label: "Approved", icon: "✅" },
    { id: 4, label: "Scheduled", icon: "📅" },
    { id: 5, label: "Notified", icon: "💬" },
  ];

  return (
    <div style={{
      padding: "20px 24px",
      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      marginBottom: "24px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    }}>
      {/* Active Workflow Banner */}
      {workflowEmail && (
        <div style={{
          marginBottom: "20px",
          padding: "12px 18px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
          borderRadius: "10px",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "fadeIn 0.5s ease-out",
        }}>
          <span style={{ fontSize: "18px" }}>🎯</span>
          <div>
            <p style={{ 
              margin: 0, 
              color: "#a5b4fc", 
              fontSize: "13px", 
              fontWeight: "600" 
            }}>
              Active Workflow
            </p>
            <p style={{ 
              margin: "4px 0 0 0", 
              color: "#f8fafc", 
              fontSize: "12px",
              fontWeight: "500",
              maxWidth: "400px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {workflowEmail}
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
      }}>
        {/* Progress Line Background */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "30px",
          right: "30px",
          height: "4px",
          background: "#3f3f5a",
          borderRadius: "2px",
          zIndex: 0,
        }} />

        {/* Progress Line Fill with animation */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "30px",
          height: "4px",
          background: "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #10b981 100%)",
          borderRadius: "2px",
          zIndex: 1,
          width: currentStep > 0 ? `calc(${(currentStep / (steps.length - 1)) * 100}% - 60px * ${currentStep / (steps.length - 1)})` : "0px",
          maxWidth: "calc(100% - 60px)",
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />

        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
              position: "relative",
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: step.id < currentStep
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : step.id === currentStep
                  ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  : "#3f3f5a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: step.id <= currentStep
                ? step.id < currentStep
                  ? "0 4px 12px rgba(16, 185, 129, 0.4)"
                  : "0 4px 16px rgba(99, 102, 241, 0.5)"
                : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: step.id === currentStep ? "scale(1.1)" : "scale(1)",
              animation: step.id === currentStep ? "pulse 2s ease-in-out infinite" : "none",
            }}>
              {step.id < currentStep ? "✓" : step.icon}
            </div>
            <span style={{
              marginTop: "8px",
              fontSize: "11px",
              fontWeight: step.id === currentStep ? "700" : "500",
              color: step.id <= currentStep ? "#f8fafc" : "#64748b",
              textAlign: "center",
              maxWidth: "80px",
              transition: "all 0.3s ease",
            }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(99, 102, 241, 0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ProgressBar;
