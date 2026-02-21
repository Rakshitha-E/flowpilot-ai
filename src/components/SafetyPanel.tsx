import { useState, useEffect, useMemo } from "react";

interface SecurityEvent {
  id: number;
  timestamp: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details: string;
}

interface SafetyCheck {
  category: string;
  passed: boolean;
  details: string;
  risk_level: string;
  reason?: string;
}

interface Props {
  taskId?: number | null;
  emailText?: string;
  onSafetyBlock?: (blocked: boolean, reason: string) => void;
}

function SafetyPanel({ taskId, emailText = "", onSafetyBlock }: Props) {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSafe, setIsSafe] = useState(true);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [scanResults, setScanResults] = useState<any>(null);

  // Calculate risk score (0-100)
  const riskScore = useMemo(() => {
    if (safetyChecks.length === 0) return 0;
    
    let score = 0;
    safetyChecks.forEach(check => {
      switch (check.risk_level) {
        case "critical": score += 30; break;
        case "high": score += 20; break;
        case "medium": score += 10; break;
        case "low": score += 0; break;
      }
    });
    return Math.min(score, 100);
  }, [safetyChecks]);

  // Auto-scan email content when provided
  useEffect(() => {
    if (emailText) {
      analyzeContent(emailText);
    }
  }, [emailText]);

  useEffect(() => {
    if (taskId) {
      checkSafety();
    }
  }, [taskId]);

  // Get color for risk score
  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return "#ef4444";
    if (score >= 40) return "#f59e0b";
    return "#10b981";
  };

  // Get risk level from score
  const getRiskLevel = (score: number): string => {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  };

  // Comprehensive content analysis
  const analyzeContent = async (content: string) => {
    setLoading(true);
    
    // Perform local content analysis
    const checks: SafetyCheck[] = [];
    
    // 1. Check for PII (Personal Identifiable Information)
    const piiPatterns = {
      ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
      creditCard: /\b\d{4}[-]?\d{4}[-]?\d{4}[-]?\d{4}\b/,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    };
    
    let piiFound: string[] = [];
    if (piiPatterns.ssn.test(content)) piiFound.push("SSN");
    if (piiPatterns.creditCard.test(content)) piiFound.push("Credit Card");
    if (piiPatterns.phone.test(content)) piiFound.push("Phone Number");
    
    checks.push({
      category: "PII Detection",
      passed: piiFound.length === 0,
      details: piiFound.length > 0 ? `Found: ${piiFound.join(", ")}` : "No personal data detected",
      risk_level: piiFound.length > 0 ? "high" : "low",
      reason: piiFound.length > 0 ? `Contains ${piiFound.length} type(s) of personally identifiable information` : "No sensitive personal data found"
    });

    // 2. Check for sensitive keywords
    const sensitiveKeywords = [
      "password", "secret", "confidential", "private key", "api key", 
      "token", "auth", "credential", "otp", "one-time", "verify",
      "bank", "account", "routing", "social security"
    ];
    
    const foundSensitive = sensitiveKeywords.filter(kw => 
      content.toLowerCase().includes(kw)
    );
    
    checks.push({
      category: "Sensitive Content",
      passed: foundSensitive.length === 0,
      details: foundSensitive.length > 0 ? `Found: ${foundSensitive.join(", ")}` : "No sensitive keywords",
      risk_level: foundSensitive.length > 2 ? "high" : foundSensitive.length > 0 ? "medium" : "low",
      reason: foundSensitive.length > 0 ? `Contains ${foundSensitive.length} sensitive keyword(s): ${foundSensitive.slice(0, 3).join(", ")}${foundSensitive.length > 3 ? '...' : ''}` : "No sensitive keywords detected"
    });

    // 3. Check for dangerous actions
    const dangerousPatterns = [
      { pattern: /wire transfer/i, action: "Wire Transfer Request" },
      { pattern: /gift card/i, action: "Gift Card Purchase" },
      { pattern: /urgent.*payment/i, action: "Urgent Payment" },
      { pattern: /click.*link/i, action: "Suspicious Link" },
      { pattern: /update.*payment/i, action: "Payment Update Request" },
    ];
    
    const dangerousActions = dangerousPatterns
      .filter(d => d.pattern.test(content))
      .map(d => d.action);
    
    checks.push({
      category: "Dangerous Actions",
      passed: dangerousActions.length === 0,
      details: dangerousActions.length > 0 ? `Detected: ${dangerousActions.join(", ")}` : "No dangerous patterns",
      risk_level: dangerousActions.length > 0 ? "critical" : "low",
      reason: dangerousActions.length > 0 ? `Contains potentially fraudulent request(s): ${dangerousActions.join(", ")}` : "No dangerous patterns found"
    });

    // 4. Check for external recipient risks
    const externalPatterns = [
      { pattern: /@gmail\.com/i, domain: "Gmail" },
      { pattern: /@yahoo\.com/i, domain: "Yahoo" },
      { pattern: /@hotmail\.com/i, domain: "Hotmail" },
      { pattern: /@outlook\.com/i, domain: "Outlook" },
    ];
    
    const externalEmails = externalPatterns
      .filter(p => p.pattern.test(content))
      .map(p => p.domain);
    
    checks.push({
      category: "External Recipients",
      passed: externalEmails.length === 0,
      details: externalEmails.length > 0 ? `External domains: ${externalEmails.join(", ")}` : "Internal only",
      risk_level: externalEmails.length > 0 ? "medium" : "low",
      reason: externalEmails.length > 0 ? `Email involves external domain(s): ${externalEmails.join(", ")}` : "Internal communication only"
    });

    // 5. Check for approval requirements
    const approvalRequired = [
      { pattern: /approve/i, action: "Requires Approval" },
      { pattern: /authorize/i, action: "Requires Authorization" },
      { pattern: /budget.*\$\d+/i, action: "Budget Request" },
    ];
    
    const needsApproval = approvalRequired
      .filter(a => a.pattern.test(content))
      .map(a => a.action);
    
    checks.push({
      category: "Approval Workflow",
      passed: needsApproval.length === 0,
      details: needsApproval.length > 0 ? `Required: ${needsApproval.join(", ")}` : "Auto-approval OK",
      risk_level: needsApproval.length > 0 ? "medium" : "low",
      reason: needsApproval.length > 0 ? `Request requires ${needsApproval.length} type(s) of approval` : "No approval requirements detected"
    });

    // Calculate overall safety
    const highRiskCount = checks.filter(c => c.risk_level === "high" || c.risk_level === "critical").length;
    const overallSafe = highRiskCount === 0;
    
    setSafetyChecks(checks);
    setIsSafe(overallSafe);
    setScanResults({
      contentScanned: content.length,
      piiCount: piiFound.length,
      sensitiveCount: foundSensitive.length,
      dangerousCount: dangerousActions.length,
      externalCount: externalEmails.length,
      needsApproval: needsApproval.length > 0
    });

    // Notify parent if there's a block
    if (onSafetyBlock) {
      onSafetyBlock(!overallSafe, highRiskCount > 0 ? "High-risk content detected" : "");
    }

    // Add security event
    addSecurityEvent({
      type: "content_scan",
      severity: overallSafe ? "low" : "high",
      message: overallSafe ? "Content scan passed" : "Risky content detected",
      details: `Found ${highRiskCount} high-risk issues`
    });

    setLoading(false);
  };

  const addSecurityEvent = (event: Omit<SecurityEvent, "id" | "timestamp">) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    setSecurityEvents(prev => [newEvent, ...prev].slice(0, 10));
  };

  const checkSafety = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/safety/check?task_id=${taskId}`);
      const data = await response.json();
      
      if (data.success) {
        setWarnings(data.warnings || []);
        setIsSafe(data.is_safe);
        
        addSecurityEvent({
          type: "task_check",
          severity: data.is_safe ? "low" : "medium",
          message: data.is_safe ? "Task safety check passed" : "Task has warnings",
          details: `Task ID: ${taskId}`
        });
      }
    } catch (error) {
      console.error("Failed to check safety:", error);
    }
    setLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "#dc2626";
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#64748b";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return "🚨";
      case "high": return "⚠️";
      case "medium": return "⚡";
      case "low": return "✅";
      default: return "ℹ️";
    }
  };

  return (
    <div style={{
      padding: "24px",
      background: "linear-gradient(145deg, #1a1a24 0%, #16161f 100%)",
      borderRadius: "16px",
      border: isSafe ? "2px solid rgba(16, 185, 129, 0.3)" : "2px solid rgba(239, 68, 68, 0.3)",
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
          <span>🛡️</span> Safety & Security Panel
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => emailText && analyzeContent(emailText)}
            disabled={loading || !emailText}
            style={{
              padding: "8px 14px",
              background: loading ? "#3f3f5a" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
              cursor: loading || !emailText ? "not-allowed" : "pointer",
            }}
          >
            🔍 Scan Content
          </button>
          <button
            onClick={checkSafety}
            disabled={loading || !taskId}
            style={{
              padding: "8px 14px",
              background: loading ? "#3f3f5a" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
              cursor: loading || !taskId ? "not-allowed" : "pointer",
            }}
          >
            🔄 Re-check
          </button>
        </div>
      </div>

      {/* Risk Score Meter - VISUAL & CLEAR */}
      <div style={{
        marginBottom: "24px",
        padding: "20px",
        background: "rgba(15, 15, 24, 0.8)",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
            🎯 Risk Score
          </h3>
          <span style={{
            padding: "6px 14px",
            background: `${getRiskScoreColor(riskScore)}20`,
            color: getRiskScoreColor(riskScore),
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
          }}>
            {getRiskLevel(riskScore)} RISK ({riskScore}%)
          </span>
        </div>
        
        {/* Risk Score Bar */}
        <div style={{
          height: "16px",
          background: "rgba(30, 30, 46, 0.8)",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            width: `${riskScore}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${getRiskScoreColor(riskScore)} 0%, ${getRiskScoreColor(riskScore)}80 100%)`,
            borderRadius: "8px",
            transition: "width 0.5s ease",
          }} />
          {/* Score markers */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "40%",
            height: "100%",
            width: "2px",
            background: "rgba(255,255,255,0.3)",
          }} />
          <div style={{
            position: "absolute",
            top: 0,
            left: "70%",
            height: "100%",
            width: "2px",
            background: "rgba(255,255,255,0.3)",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#64748b" }}>
          <span>0%</span>
          <span>Safe</span>
          <span>40%</span>
          <span>Medium</span>
          <span>70%</span>
          <span>High</span>
          <span>100%</span>
        </div>
      </div>

      {/* Safety Status */}
      <div style={{
        marginBottom: "24px",
        padding: "20px",
        background: isSafe 
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)"
          : "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)",
        borderRadius: "14px",
        textAlign: "center",
        border: `2px solid ${isSafe ? "#10b981" : "#ef4444"}`,
      }}>
        <p style={{ color: isSafe ? "#10b981" : "#ef4444", fontWeight: "700", margin: 0, fontSize: "18px" }}>
          {isSafe ? "✅ SAFE - Content approved for automation" : "⚠️ BLOCKED - Manual review required"}
        </p>
        {!isSafe && (
          <p style={{ color: "#fca5a5", fontSize: "13px", margin: "8px 0 0 0" }}>
            High-risk content detected. Human approval required before proceeding.
          </p>
        )}
      </div>

      {/* Legacy Warnings from Backend */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
            ⚠️ System Warnings
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {warnings.map((warning, index) => (
              <div
                key={index}
                style={{
                  padding: "14px",
                  background: "rgba(245, 158, 11, 0.1)",
                  borderRadius: "10px",
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
                  ⚠️ {warning.type || "Warning"}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                  {warning.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Results Summary */}
      {scanResults && (
        <div style={{
          marginBottom: "24px",
          padding: "16px",
          background: "rgba(15, 15, 24, 0.8)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
            📊 Scan Results Summary
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div style={{ textAlign: "center", padding: "10px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "8px" }}>
              <p style={{ fontSize: "20px", fontWeight: "700", color: "#6366f1", margin: 0 }}>{scanResults.contentScanned}</p>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Chars Scanned</p>
            </div>
            <div style={{ textAlign: "center", padding: "10px", background: scanResults.piiCount > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", borderRadius: "8px" }}>
              <p style={{ fontSize: "20px", fontWeight: "700", color: scanResults.piiCount > 0 ? "#ef4444" : "#10b981", margin: 0 }}>{scanResults.piiCount}</p>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>PII Items</p>
            </div>
            <div style={{ textAlign: "center", padding: "10px", background: scanResults.needsApproval ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)", borderRadius: "8px" }}>
              <p style={{ fontSize: "20px", fontWeight: "700", color: scanResults.needsApproval ? "#f59e0b" : "#10b981", margin: 0 }}>{scanResults.needsApproval ? "YES" : "NO"}</p>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Needs Approval</p>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAINABLE AI - Show WHY decisions were made */}
      {safetyChecks.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
            🧠 AI Decision Reasoning
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {safetyChecks.map((check, index) => (
              <div
                key={index}
                style={{
                  padding: "14px",
                  background: check.passed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  borderRadius: "10px",
                  borderLeft: `4px solid ${getRiskColor(check.risk_level)}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
                    {check.passed ? "✅" : "⚠️"} {check.category}
                  </p>
                  <span style={{
                    padding: "4px 10px",
                    background: `${getRiskColor(check.risk_level)}20`,
                    color: getRiskColor(check.risk_level),
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}>
                    {check.risk_level}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  {check.details}
                </p>
                {/* Show the reasoning why */}
                {check.reason && (
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#a5b4fc", fontStyle: "italic" }}>
                    💡 AI Reason: {check.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Events Log */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
          📋 Security Events Log
        </h3>
        {securityEvents.length === 0 ? (
          <div style={{
            padding: "20px",
            background: "rgba(15, 15, 24, 0.8)",
            borderRadius: "10px",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>No security events recorded</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {securityEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: "12px",
                  background: "rgba(15, 15, 24, 0.8)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <span style={{ fontSize: "16px" }}>{getSeverityIcon(event.severity)}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#f8fafc" }}>{event.message}</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>{event.details}</p>
                </div>
                <span style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace" }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enterprise Security Badge */}
      <div style={{
        marginTop: "24px",
        padding: "16px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
      }}>
        <p style={{ color: "white", fontSize: "13px", margin: 0, fontWeight: "600" }}>
          🔒 Enterprise Security: PII Detection • Content Filtering • Approval Enforcement
        </p>
      </div>
    </div>
  );
}

export default SafetyPanel;
