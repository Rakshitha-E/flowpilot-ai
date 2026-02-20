from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS (allow frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    emailText: str


def extract_task_info(email_text: str) -> dict:
    """Extract task information from email using pattern matching"""
    
    email_lower = email_text.lower()
    
    # Task extraction - look for action words
    action_verbs = [
        "review", "check", "approve", "update", "create", "fix", "submit", "send",
        "confirm", "verify", "complete", "finish", "provide", "prepare", "arrange",
        "schedule", "organize", "delegate", "analyze", "evaluate", "assess"
    ]
    
    task = "Review email and take action"
    for verb in action_verbs:
        pattern = rf"{verb}[^.!?]*[.!?]"
        match = re.search(pattern, email_lower)
        if match:
            task = match.group(0).strip()
            break
    
    # If no specific task found, extract first meaningful sentence
    if task == "Review email and take action":
        sentences = email_text.split('.')
        if sentences:
            task = sentences[0].strip()[:100]
    
    # Deadline extraction
    deadline = "Not specified"
    deadline_patterns = [
        r"by\s+(?:end\s+of\s+)?(\w+\s+\d{1,2}|\d{1,2}/\d{1,2})",
        r"(?:deadline|due)\s*(?:is|:)?\s*(?:on\s+)?(\w+\s+\d{1,2}|\d{1,2}/\d{1,2})",
        r"before\s+(?:end\s+of\s+)?(\w+)",
        r"by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)",
        r"by\s+(?:this\s+)?(evening|tomorrow|next\s+week|end\s+of\s+week)",
    ]
    
    for pattern in deadline_patterns:
        match = re.search(pattern, email_lower)
        if match:
            deadline = match.group(1) if match.groups() else match.group(0)
            deadline = deadline.title()
            break
    
    # Priority extraction based on urgency keywords
    priority = "Medium"
    high_priority_keywords = ["urgent", "asap", "immediately", "critical", "emergency", "today", "now", "rush"]
    low_priority_keywords = ["when possible", "at your leisure", "whenever", "optional", "no rush"]
    
    for keyword in high_priority_keywords:
        if keyword in email_lower:
            priority = "High"
            break
    
    for keyword in low_priority_keywords:
        if keyword in email_lower:
            priority = "Low"
            break
    
    # Draft reply generation
    draft_reply = f"""Thank you for your email. 

I have received your request to {task.lower().rstrip('.')}. 

I will ensure this is handled {
        'immediately' if priority == 'High' else 'as soon as possible' if priority == 'Medium' else 'at my earliest convenience'
}.

{'Please let me know if you need any additional information.' if priority != 'High' else 'I appreciate your patience and will prioritize this accordingly.'}

Best regards"""
    
    return {
        "task": task,
        "deadline": deadline,
        "priority": priority,
        "draftReply": draft_reply
    }


@app.post("/analyze")
def analyze_email(request: EmailRequest):
    try:
        if not request.emailText.strip():
            return {
                "task": "Error",
                "deadline": "Unknown",
                "priority": "Unknown",
                "draftReply": "Please provide an email to analyze"
            }
        
        result = extract_task_info(request.emailText)
        return result
    
    except Exception as e:
        return {
            "task": "Error",
            "deadline": "Unknown",
            "priority": "Unknown",
            "draftReply": f"Server error: {str(e)}"
        }