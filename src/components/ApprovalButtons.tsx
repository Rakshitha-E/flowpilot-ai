function ApprovalButtons() {
  return (
    <div style={{
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginTop: "20px",
    }}>
      <button
        style={{
          padding: "10px 24px",
          fontSize: "14px",
          fontWeight: "600",
          color: "white",
          background: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 12px rgba(81, 207, 102, 0.3)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(81, 207, 102, 0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(81, 207, 102, 0.3)";
        }}
      >
        ✅ Approve Task
      </button>
      <button
        style={{
          padding: "10px 24px",
          fontSize: "14px",
          fontWeight: "600",
          color: "white",
          background: "linear-gradient(135deg, #ff8c8c 0%, #ff6b6b 100%)",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(255, 107, 107, 0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.3)";
        }}
      >
        ❌ Reject
      </button>
    </div>
  );
}

export default ApprovalButtons;