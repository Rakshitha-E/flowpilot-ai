from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import json
import uuid
from typing import List, Optional

# Load environment variables
load_dotenv()

app = FastAPI()

# In-memory storage
tasks = []
task_id_counter = 0

# Audit log storage
audit_logs = []

# Calendar events storage
calendar_events = []

# Slack messages storage
slack_messages = []

# Multi-Agent state
agent_states = {
    "email_agent": {"status": "idle", "last_run": None},
    "decision_agent": {"status": "idle", "last_run": None},
    "calendar_agent": {"status": "idle", "last_run": None},
    "task_agent": {"status": "idle", "last_run": None},
}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Pydantic Models ==============

class EmailRequest(BaseModel):
    emailText: str

class TaskUpdate(BaseModel):
    task_id: int
    status: str

class ApprovalRequest(BaseModel):
    task: dict
    autonomous: bool = False

class CalendarEventRequest(BaseModel):
    title: str
    date: str
    time: str
    attendees: Optional[List[str]] = []

class SlackMessageRequest(BaseModel):
    channel: str
    message: str
    action: Optional[str] = None

class AgentRequest(BaseModel):
    agent_name: str
    action: str
    payload: dict = {}

# ============== Multi-Agent System ==============

class EmailAgent:
    """Agent responsible for extracting tasks from emails"""
    
    @staticmethod
    def process(email_text: str) -> dict:
        agent_states["email_agent"]["status"] = "processing"
        agent_states["email_agent"]["last_run"] = datetime.now().isoformat()
        
        result = extract_task_info(email_text)
        
        # Add agent metadata
        result["agent"] = "Email Agent"
        result["agent_status"] = "completed"
        result["timestamp"] = datetime.now().isoformat()
        
        agent_states["email_agent"]["status"] = "completed"
        
        # Log to audit
        add_audit_log("Email Agent", "extract_task", f"Extracted task: {result.get('task', 'N/A')}")
        
        return result


class DecisionAgent:
    """Agent responsible for priority assignment and decision making"""
    
    @staticmethod
    def process(task_data: dict, email_text: str) -> dict:
        agent_states["decision_agent"]["status"] = "processing"
        agent_states["decision_agent"]["last_run"] = datetime.now().isoformat()
        
        # Apply smart priority rules
        priority = apply_priority_rules(task_data, email_text, task_data.get("priority", "Medium"))
        
        # Determine if approval needed
        needs_approval = priority != "High"
        
        result = {
            **task_data,
            "priority": priority,
            "needs_approval": needs_approval,
            "agent": "Decision Agent",
            "agent_status": "completed",
            "timestamp": datetime.now().isoformat()
        }
        
        agent_states["decision_agent"]["status"] = "completed"
        
        # Log to audit
        add_audit_log("Decision Agent", "assign_priority", f"Assigned priority: {priority}, needs_approval: {needs_approval}")
        
        return result


class CalendarAgent:
    """Agent responsible for scheduling meetings"""
    
    @staticmethod
    def process(task_data: dict, create_event: bool = False) -> dict:
        agent_states["calendar_agent"]["status"] = "processing"
        agent_states["calendar_agent"]["last_run"] = datetime.now().isoformat()
        
        result = {
            "calendar_suggestion": None,
            "calendar_event_id": None,
            "agent": "Calendar Agent",
            "agent_status": "completed",
            "timestamp": datetime.now().isoformat()
        }
        
        if create_event and task_data.get("deadline") != "Not specified":
            # Create calendar event
            event = {
                "id": str(uuid.uuid4()),
                "title": task_data.get("task", "Task Meeting"),
                "date": task_data.get("deadline"),
                "time": "09:00 AM",
                "attendees": [],
                "created_at": datetime.now().isoformat(),
                "status": "scheduled"
            }
            calendar_events.append(event)
            result["calendar_event_id"] = event["id"]
            result["calendar_suggestion"] = f"Meeting scheduled for {task_data.get('deadline')} at 09:00 AM"
            
            add_audit_log("Calendar Agent", "create_event", f"Created calendar event: {event['id']}")
        else:
            # Suggest meeting time
            days_until = task_data.get("days_until", 1)
            suggested_time = "09:00 AM"
            if days_until == 0:
                suggested_time = "02:00 PM"
            elif days_until == 1:
                suggested_time = "09:00 AM (tomorrow)"
            
            result["calendar_suggestion"] = f"Recommend meeting on {task_data.get('deadline', 'TBD')} at {suggested_time}"
            add_audit_log("Calendar Agent", "suggest_time", f"Suggested time: {suggested_time}")
        
        agent_states["calendar_agent"]["status"] = "completed"
        
        return result


class TaskAgent:
    """Agent responsible for task management and dashboard updates"""
    
    @staticmethod
    def process(task_data: dict, action: str = "create") -> dict:
        global task_id_counter
        
        agent_states["task_agent"]["status"] = "processing"
        agent_states["task_agent"]["last_run"] = datetime.now().isoformat()
        
        result = {
            "task_id": None,
            "action": action,
            "agent": "Task Agent",
            "agent_status": "completed",
            "timestamp": datetime.now().isoformat()
        }
        
        if action == "create":
            task_id_counter += 1
            task_record = {
                "id": task_id_counter,
                "task": task_data.get("task"),
                "deadline": task_data.get("deadline"),
                "priority": task_data.get("priority"),
                "status": "Pending",
                "reminder": task_data.get("reminder"),
                "created_at": datetime.now().isoformat(),
                "autonomous": task_data.get("autonomous", False),
                "calendar_event_id": task_data.get("calendar_event_id"),
                "email_text": task_data.get("email_text", ""),
                "approved_at": datetime.now().isoformat(),
                "approved_by": "system" if task_data.get("autonomous") else "user"
            }
            tasks.append(task_record)
            result["task_id"] = task_id_counter
            result["message"] = f"Task {task_id_counter} created successfully"
            
            add_audit_log("Task Agent", "create_task", f"Created task: {task_id_counter}")
        
        agent_states["task_agent"]["status"] = "completed"
        
        return result


# ============== Helper Functions ==============

def add_audit_log(agent: str, action: str, details: str):
    """Add entry to audit log"""
    log_entry = {
        "id": len(audit_logs) + 1,
        "timestamp": datetime.now().isoformat(),
        "agent": agent,
        "action": action,
        "details": details
    }
    audit_logs.append(log_entry)


def check_conflicts(date: str, time: str) -> dict:
    """Check for calendar conflicts - Human-in-the-Loop Safety"""
    conflicts = []
    for event in calendar_events:
        if event.get("date") == date:
            conflicts.append({
                "event": event.get("title"),
                "date": event.get("date"),
                "time": event.get("time")
            })
    
    # Suggest alternate times
    suggestions = []
    if conflicts:
        suggestions = [
            {"time": "11:00 AM", "reason": "Morning slot available"},
            {"time": "02:00 PM", "reason": "Afternoon slot available"},
            {"time": "04:00 PM", "reason": "End of day slot available"}
        ]
    
    return {
        "has_conflicts": len(conflicts) > 0,
        "conflicts": conflicts,
        "suggestions": suggestions
    }


def interpret_deadline(deadline_str: str) -> tuple:
    """Convert relative dates to actual dates. Returns (formatted_date, days_until)"""
    now = datetime.now()
    deadline_lower = deadline_str.lower()
    
    # Check for relative dates
    if "tomorrow" in deadline_lower:
        target = now + timedelta(days=1)
        return (target.strftime("%A, %B %d"), 1)
    
    if "today" in deadline_lower:
        return (now.strftime("%A, %B %d"), 0)
    
    if "next monday" in deadline_lower or "monday" in deadline_lower:
        days_ahead = 0 - now.weekday()  # Monday is 0
        if days_ahead <= 0:
            days_ahead += 7
        target = now + timedelta(days=days_ahead)
        return (target.strftime("%A, %B %d"), days_ahead)
    
    # Pattern for "by Friday", "by end of week"
    days_map = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6
    }
    
    for day_name, day_num in days_map.items():
        if day_name in deadline_lower:
            days_ahead = day_num - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            target = now + timedelta(days=days_ahead)
            return (target.strftime("%A, %B %d"), days_ahead)
    
    # Pattern for "end of week"
    if "end of week" in deadline_lower or "eow" in deadline_lower:
        days_ahead = 4 - now.weekday()  # Friday
        if days_ahead <= 0:
            days_ahead += 7
        target = now + timedelta(days=days_ahead)
        return (target.strftime("%A, %B %d"), days_ahead)
    
    # Default: return as-is with high priority
    return (deadline_str, 1)


def apply_priority_rules(task: dict, email_text: str, priority_base: str) -> str:
    """Apply smart rule-based priority override"""
    email_lower = email_text.lower()
    days_until = 999
    
    # Parse deadline to get days_until
    if task.get("deadline") and task["deadline"] != "Not specified":
        _, days_until = interpret_deadline(task["deadline"])
    
    # Rule 1: Urgent keywords override to HIGH
    urgent_keywords = ["urgent", "asap", "immediately", "critical", "emergency", "now"]
    for keyword in urgent_keywords:
        if keyword in email_lower:
            return "High"
    
    # Rule 2: Deadline within 24 hours = HIGH
    if days_until == 0 or (days_until == 1 and "today" in email_lower):
        return "High"
    
    # Rule 3: FYI or informational = LOW
    if email_lower.startswith("fyi") or "fyi" in email_lower[:20]:
        return "Low"
    if "for your information" in email_lower:
        return "Low"
    if "just letting you know" in email_lower or "heads up" in email_lower:
        return "Low"
    
    # Rule 4: Deadline > 7 days with no urgency = LOW
    if days_until > 7 and priority_base != "High":
        return "Low"
    
    return priority_base


def extract_task_info(email_text: str) -> dict:
    """Extract task information from email using pattern matching"""
    
    email_lower = email_text.lower()
    
    # Task extraction
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
    
    # Base priority (before rules)
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
    
    # Convert deadline and apply priority rules
    actual_deadline, days_until = interpret_deadline(deadline) if deadline != "Not specified" else (deadline, 999)
    priority = apply_priority_rules({"deadline": actual_deadline}, email_text, priority)
    
    # Draft reply
    draft_reply = f"""Thank you for your email. 

I have received your request to {task.lower().rstrip('.')}. 

I will ensure this is handled {
        'immediately' if priority == 'High' else 'as soon as possible' if priority == 'Medium' else 'at my earliest convenience'
}.

{'Please let me know if you need any additional information.' if priority != 'High' else 'I appreciate your patience and will prioritize this accordingly.'}

Best regards"""
    
    # Schedule reminder
    reminder_time = "09:00 AM"
    if days_until == 0:
        reminder_time = "02:00 PM (today)"
    elif days_until == 1:
        reminder_time = "09:00 AM (tomorrow)"
    
    return {
        "task": task,
        "deadline": actual_deadline,
        "priority": priority,
        "draftReply": draft_reply,
        "reminder": f"Reminder scheduled for {reminder_time}",
        "days_until": days_until
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


@app.post("/approve-task")
def approve_task(request: ApprovalRequest):
    """Approve and store task"""
    global task_id_counter
    
    try:
        task_id_counter += 1
        
        task_record = {
            "id": task_id_counter,
            "task": request.task.get("task"),
            "deadline": request.task.get("deadline"),
            "priority": request.task.get("priority"),
            "status": "Pending",
            "reminder": request.task.get("reminder"),
            "created_at": datetime.now().isoformat(),
            "autonomous": request.autonomous
        }
        
        tasks.append(task_record)
        
        return {
            "success": True,
            "message": f"Task approved and stored! {'(Auto-approved in autonomous mode)' if request.autonomous else ''}",
            "task_id": task_id_counter,
            "total_tasks": len(tasks)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/tasks")
def get_tasks():
    """Get all stored tasks"""
    return {
        "tasks": tasks,
        "total": len(tasks),
        "pending": len([t for t in tasks if t["status"] == "Pending"]),
        "completed": len([t for t in tasks if t["status"] == "Completed"])
    }


@app.post("/task/{task_id}/complete")
def complete_task(task_id: int):
    """Mark task as completed"""
    for task in tasks:
        if task["id"] == task_id:
            task["status"] = "Completed"
            task["completed_at"] = datetime.now().isoformat()
            add_audit_log("Task Agent", "complete_task", f"Completed task: {task_id}")
            return {"success": True, "message": f"Task marked as completed!"}
    
    return {"success": False, "error": "Task not found"}


# ============== Multi-Agent Orchestration Endpoints ==============

@app.post("/agent/email")
def run_email_agent(request: EmailRequest):
    """Run Email Agent to extract task from email"""
    try:
        result = EmailAgent.process(request.emailText)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/agent/decision")
def run_decision_agent(request: AgentRequest):
    """Run Decision Agent to assign priority"""
    try:
        result = DecisionAgent.process(
            request.payload.get("task_data", {}),
            request.payload.get("email_text", "")
        )
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/agent/calendar")
def run_calendar_agent(request: AgentRequest):
    """Run Calendar Agent to suggest or create meeting"""
    try:
        result = CalendarAgent.process(
            request.payload.get("task_data", {}),
            request.payload.get("create_event", False)
        )
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/agent/task")
def run_task_agent(request: AgentRequest):
    """Run Task Agent to create/update tasks"""
    try:
        result = TaskAgent.process(
            request.payload.get("task_data", {}),
            request.payload.get("action", "create")
        )
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/agent/orchestrate")
def orchestrate_agents(request: EmailRequest):
    """Orchestrate all agents for complete workflow"""
    try:
        workflow_result = {
            "workflow_id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "agents": [],
            "final_result": {}
        }
        
        # Step 1: Email Agent extracts task
        email_result = EmailAgent.process(request.emailText)
        workflow_result["agents"].append({
            "name": "Email Agent",
            "status": "completed",
            "output": email_result.get("task")
        })
        
        # Step 2: Decision Agent assigns priority
        decision_result = DecisionAgent.process(email_result, request.emailText)
        workflow_result["agents"].append({
            "name": "Decision Agent",
            "status": "completed",
            "output": f"Priority: {decision_result.get('priority')}"
        })
        
        # Step 3: Calendar Agent suggests meeting
        calendar_result = CalendarAgent.process(decision_result, False)
        workflow_result["agents"].append({
            "name": "Calendar Agent",
            "status": "completed",
            "output": calendar_result.get("calendar_suggestion")
        })
        
        # Combine results
        workflow_result["final_result"] = {
            **email_result,
            "needs_approval": decision_result.get("needs_approval"),
            "calendar_suggestion": calendar_result.get("calendar_suggestion")
        }
        
        add_audit_log("Orchestrator", "workflow_complete", f"Workflow {workflow_result['workflow_id']} completed")
        
        return {"success": True, "data": workflow_result}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/agent/status")
def get_agent_status():
    """Get status of all agents"""
    return {
        "agents": agent_states,
        "timestamp": datetime.now().isoformat()
    }


# ============== Audit Log Endpoints ==============

@app.get("/audit")
def get_audit_logs():
    """Get all audit logs"""
    return {
        "logs": audit_logs,
        "total": len(audit_logs)
    }


@app.post("/audit/clear")
def clear_audit_logs():
    """Clear audit logs"""
    global audit_logs
    audit_logs = []
    return {"success": True, "message": "Audit logs cleared"}


# ============== Calendar Integration Endpoints ==============

@app.post("/calendar/event")
def create_calendar_event(request: CalendarEventRequest):
    """Create a calendar event"""
    # Check for conflicts first
    conflict_check = check_conflicts(request.date, request.time)
    
    event = {
        "id": str(uuid.uuid4()),
        "title": request.title,
        "date": request.date,
        "time": request.time,
        "attendees": request.attendees or [],
        "created_at": datetime.now().isoformat(),
        "status": "scheduled",
        "conflict_check": conflict_check
    }
    
    calendar_events.append(event)
    add_audit_log("Calendar Agent", "create_event", f"Created event: {event['id']}")
    
    return {
        "success": True,
        "event": event,
        "conflict_warning": conflict_check
    }


@app.get("/calendar/events")
def get_calendar_events():
    """Get all calendar events"""
    return {
        "events": calendar_events,
        "total": len(calendar_events)
    }


@app.get("/calendar/check-conflicts")
def get_conflicts(date: str, time: str):
    """Check for calendar conflicts"""
    return check_conflicts(date, time)


# ============== Slack/Teams Integration Endpoints ==============

@app.post("/slack/message")
def send_slack_message(request: SlackMessageRequest):
    """Send message to Slack (simulated)"""
    message = {
        "id": str(uuid.uuid4()),
        "channel": request.channel,
        "message": request.message,
        "action": request.action,
        "created_at": datetime.now().isoformat(),
        "status": "sent"
    }
    
    slack_messages.append(message)
    add_audit_log("Slack Agent", "send_message", f"Sent to {request.channel}: {request.message[:50]}...")
    
    return {
        "success": True,
        "message": f"Message sent to {request.channel}",
        "data": message
    }


@app.get("/slack/messages")
def get_slack_messages():
    """Get all Slack messages"""
    return {
        "messages": slack_messages,
        "total": len(slack_messages)
    }


@app.post("/slack/command")
def slack_command(request: SlackMessageRequest):
    """Process Slack command like /schedule meeting"""
    # Parse Slack command
    command_response = {
        "response_type": "in_channel",
        "text": ""
    }
    
    if "schedule meeting" in request.message.lower() or "meeting" in request.message.lower():
        # Extract meeting details
        meeting_match = re.search(r"meeting\s+(.+?)(?:\s+tomorrow|\s+today|\s+next)?", request.message.lower())
        meeting_detail = meeting_match.group(1) if meeting_match else "discussion"
        
        command_response["text"] = f" Meeting scheduled: {meeting_detail} - I'll create a task and set up a calendar invite."
        
        # Auto-create task from Slack command
        task_data = {
            "task": f"Slack: {meeting_detail}",
            "deadline": "Tomorrow",
            "priority": "Medium",
            "source": "slack"
        }
        TaskAgent.process(task_data, "create")
        
        add_audit_log("Slack Agent", "command", f"Processed schedule command: {request.message}")
    
    elif "urgent" in request.message.lower() or "asap" in request.message.lower():
        command_response["text"] = f"⚠️ Understood! I'll mark this as HIGH priority and notify the team."
        
        task_data = {
            "task": f"Slack (Urgent): {request.message[:50]}",
            "deadline": "Today",
            "priority": "High",
            "source": "slack"
        }
        TaskAgent.process(task_data, "create")
        
        add_audit_log("Slack Agent", "command", f"Processed urgent command: {request.message}")
    
    else:
        command_response["text"] = f"✅ Received: '{request.message}' - I'll analyze and create a task if needed."
    
    return command_response


# ============== Context-Aware Reply Enhancement ==============

@app.post("/reply/smart")
def generate_smart_reply(request: EmailRequest):
    """Generate context-aware suggested reply"""
    try:
        # First analyze the email
        analysis = extract_task_info(request.emailText)
        
        # Generate context-aware reply based on task
        task = analysis.get("task", "request")
        priority = analysis.get("priority", "Medium")
        deadline = analysis.get("deadline", "TBD")
        
        # Context-aware replies
        if priority == "High":
            smart_reply = f"""Hi,

I've received your message about "{task}" and understand this is urgent. 

I'm immediately prioritizing this and will ensure it's completed {
    'today' if 'today' in deadline.lower() else 'by ' + deadline
}.

I'll keep you updated on progress.

Best regards"""
        elif "meeting" in task.lower() or "schedule" in task.lower():
            smart_reply = f"""Hi,

Thank you for your email about {task}.

I've noted the deadline of {deadline} and will prepare accordingly. I'll send a calendar invite for the proposed time.

Please let me know if you have any specific agenda items you'd like to discuss.

Best regards"""
        elif "review" in task.lower() or "approve" in task.lower():
            smart_reply = f"""Hi,

I've received your request to "{task}".

I'll review the materials and provide my feedback by {deadline}. Please send any relevant documents or context you'd like me to consider.

Best regards"""
        else:
            # Default smart reply
            smart_reply = f"""Hi,

Thank you for your email regarding "{task}".

I've noted this for {deadline} and will work on it accordingly.

Please let me know if you need any additional information.

Best regards"""
        
        return {
            "success": True,
            "reply": smart_reply,
            "context": {
                "task": task,
                "priority": priority,
                "deadline": deadline
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============== Safety Panel Endpoint ==============

@app.get("/safety/check")
def safety_check(task_id: int):
    """Human-in-the-loop safety panel - check for risks"""
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return {"success": False, "error": "Task not found"}
    
    warnings = []
    
    # Check for calendar conflicts
    if task.get("deadline") and task["deadline"] != "Not specified":
        conflicts = check_conflicts(task["deadline"], "09:00 AM")
        if conflicts["has_conflicts"]:
            warnings.append({
                "type": "calendar_conflict",
                "message": f"Meeting overlaps with existing event",
                "conflicts": conflicts["conflicts"],
                "suggestions": conflicts["suggestions"]
            })
    
    # Check for overloaded day (more than 3 tasks)
    deadline_tasks = [t for t in tasks if t.get("deadline") == task.get("deadline")]
    if len(deadline_tasks) > 3:
        warnings.append({
            "type": "overload",
            "message": f"High workload: {len(deadline_tasks)} tasks due on {task.get('deadline')}",
            "suggestions": ["Consider spreading tasks across days", "Delegate to team members"]
        })
    
    # Check for high priority without much time
    if task.get("priority") == "High" and task.get("days_until", 999) <= 0:
        warnings.append({
            "type": "time_critical",
            "message": "High priority task with deadline passed or today",
            "suggestions": ["Escalate to team", "Notify stakeholders of delay risk"]
        })
    
    return {
        "success": True,
        "task_id": task_id,
        "warnings": warnings,
        "is_safe": len(warnings) == 0
    }


# ============== Priority Scoring System ==============

@app.post("/priority/score")
def score_priority(request: EmailRequest):
    """Calculate priority score with AI decision-making transparency"""
    try:
        email_text = request.emailText
        email_lower = email_text.lower()
        
        # Initialize scoring components
        scores = {
            "urgency_score": 0,
            "importance_score": 0,
            "deadline_score": 0,
            "sender_score": 0,
            "keyword_score": 0
        }
        
        reasons = []
        
        # Urgency scoring (0-100)
        urgent_keywords = {
            "urgent": 30, "asap": 30, "immediately": 35, "critical": 40,
            "emergency": 40, "now": 25, "rush": 25, "deadline": 15,
            "time-sensitive": 20, "quick": 15
        }
        for keyword, score in urgent_keywords.items():
            if keyword in email_lower:
                scores["urgency_score"] = max(scores["urgency_score"], score)
                reasons.append(f"Found urgency keyword: '{keyword}' (+{score})")
        
        # Importance scoring based on content
        important_keywords = {
            "important": 20, "priority": 25, "key": 15, "critical": 30,
            "essential": 20, "required": 15, "mandatory": 25, "must": 15
        }
        for keyword, score in important_keywords.items():
            if keyword in email_lower:
                scores["importance_score"] = max(scores["importance_score"], score)
                reasons.append(f"Found importance keyword: '{keyword}' (+{score})")
        
        # Deadline scoring
        deadline_match = re.search(r"(by|due|deadline)\s+(.+?)(?:\.|$)", email_lower)
        if deadline_match:
            deadline_text = deadline_match.group(2).strip()
            if "today" in deadline_text:
                scores["deadline_score"] = 50
                reasons.append("Deadline: Today (+50)")
            elif "tomorrow" in deadline_text:
                scores["deadline_score"] = 45
                reasons.append("Deadline: Tomorrow (+45)")
            elif any(day in deadline_text for day in ["monday", "tuesday", "wednesday", "thursday", "friday"]):
                scores["deadline_score"] = 30
                reasons.append("Deadline: This week (+30)")
            elif "next week" in deadline_text:
                scores["deadline_score"] = 15
                reasons.append("Deadline: Next week (+15)")
        
        # Sender scoring (VIP detection)
        vip_patterns = ["ceo", "cto", "cfo", "director", "vp ", "president", "founder", "boss"]
        for pattern in vip_patterns:
            if pattern in email_lower[:200]:
                scores["sender_score"] = 20
                reasons.append(f"VIP sender detected: '{pattern}' (+20)")
                break
        
        # FYI/Low priority detection (negative scoring)
        low_priority = ["fyi", "for your information", "just letting you know", 
                       "heads up", "when possible", "at your leisure"]
        is_low_priority = any(term in email_lower for term in low_priority)
        
        if is_low_priority:
            scores["urgency_score"] = max(0, scores["urgency_score"] - 30)
            scores["importance_score"] = max(0, scores["importance_score"] - 20)
            reasons.append("Low priority indicators found (FYI/Info)")
        
        # Calculate total score
        total_score = sum(scores.values())
        
        # Determine priority level
        if total_score >= 70:
            priority_level = "High"
        elif total_score >= 40:
            priority_level = "Medium"
        else:
            priority_level = "Low"
        
        # AI Decision explanation
        decision_explanation = f"AI calculated priority score: {total_score}/100 → {priority_level} priority"
        
        return {
            "success": True,
            "priority_level": priority_level,
            "total_score": total_score,
            "scores": scores,
            "reasons": reasons,
            "decision_explanation": decision_explanation,
            "is_low_priority": is_low_priority
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============== Conflict Detection System ==============

@app.get("/conflict/detect")
def detect_conflicts(date: str, time: str = "09:00 AM"):
    """Detect meeting conflicts with smart suggestions"""
    try:
        conflicts = []
        
        # Check existing calendar events
        for event in calendar_events:
            if event.get("date") == date:
                conflicts.append({
                    "id": event.get("id"),
                    "title": event.get("title"),
                    "time": event.get("time"),
                    "duration": "1 hour",
                    "type": "calendar_conflict"
                })
        
        # Generate smart suggestions
        suggestions = []
        if conflicts:
            # Suggest alternative times
            occupied_times = [c["time"] for c in conflicts]
            all_times = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
            available_times = [t for t in all_times if t not in occupied_times]
            
            for available_time in available_times[:3]:
                suggestions.append({
                    "time": available_time,
                    "reason": "Available slot" if len(conflicts) < 3 else "Best alternative",
                    "confidence": "high" if len(conflicts) < 2 else "medium"
                })
            
            # Suggest next day if today is fully booked
            if len(available_times) == 0:
                suggestions.append({
                    "time": "Next available day",
                    "reason": "Today is fully booked",
                    "date": "Next business day",
                    "confidence": "low"
                })
        
        return {
            "success": True,
            "date": date,
            "time": time,
            "has_conflicts": len(conflicts) > 0,
            "conflicts": conflicts,
            "suggestions": suggestions,
            "conflict_count": len(conflicts)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/conflict/check-range")
def check_conflicts_range(start_date: str, end_date: str):
    """Check conflicts for a date range"""
    try:
        from datetime import datetime as dt
        
        start = dt.strptime(start_date, "%Y-%m-%d")
        end = dt.strptime(end_date, "%Y-%m-%d")
        
        conflicts_summary = []
        
        current = start
        while current <= end:
            date_str = current.strftime("%Y-%m-%d")
            day_conflicts = [e for e in calendar_events if e.get("date") == date_str]
            
            if day_conflicts:
                conflicts_summary.append({
                    "date": date_str,
                    "day": current.strftime("%A"),
                    "count": len(day_conflicts),
                    "events": [e.get("title") for e in day_conflicts]
                })
            
            current += timedelta(days=1)
        
        return {
            "success": True,
            "start_date": start_date,
            "end_date": end_date,
            "busy_days": conflicts_summary,
            "total_conflicts": sum(c["count"] for c in conflicts_summary)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============== Automation Metrics Panel ==============

# In-memory metrics storage
automation_metrics = {
    "total_emails_processed": 0,
    "total_tasks_created": 0,
    "total_tasks_completed": 0,
    "total_meetings_scheduled": 0,
    "total_slack_messages": 0,
    "autonomous_approvals": 0,
    "human_approvals": 0,
    "start_time": datetime.now().isoformat(),
    "time_saved_minutes": 0,
    "efficiency_score": 0
}


@app.post("/metrics/record-email")
def record_email_processed():
    """Record an email being processed"""
    automation_metrics["total_emails_processed"] += 1
    # Estimate time saved: ~3 min per email automation
    automation_metrics["time_saved_minutes"] += 3
    return {"success": True, "emails_processed": automation_metrics["total_emails_processed"]}


@app.post("/metrics/record-task")
def record_task_created(autonomous: bool = False):
    """Record a task being created"""
    automation_metrics["total_tasks_created"] += 1
    if autonomous:
        automation_metrics["autonomous_approvals"] += 1
    else:
        automation_metrics["human_approvals"] += 1
    # Estimate time saved: ~5 min per task automation
    automation_metrics["time_saved_minutes"] += 5
    return {"success": True, "tasks_created": automation_metrics["total_tasks_created"]}


@app.post("/metrics/record-completion")
def record_task_completed():
    """Record a task completion"""
    automation_metrics["total_tasks_completed"] += 1
    return {"success": True, "tasks_completed": automation_metrics["total_tasks_completed"]}


@app.post("/metrics/record-meeting")
def record_meeting_scheduled():
    """Record a meeting being scheduled"""
    automation_metrics["total_meetings_scheduled"] += 1
    # Estimate time saved: ~10 min per meeting scheduling
    automation_metrics["time_saved_minutes"] += 10
    return {"success": True, "meetings_scheduled": automation_metrics["total_meetings_scheduled"]}


@app.post("/metrics/record-slack")
def record_slack_message():
    """Record a Slack message processed"""
    automation_metrics["total_slack_messages"] += 1
    return {"success": True, "slack_messages": automation_metrics["total_slack_messages"]}


@app.get("/metrics/dashboard")
def get_metrics_dashboard():
    """Get comprehensive metrics dashboard"""
    try:
        # Calculate efficiency score
        total_actions = (
            automation_metrics["total_emails_processed"] +
            automation_metrics["total_tasks_created"] +
            automation_metrics["total_meetings_scheduled"]
        )
        
        if total_actions > 0:
            automation_metrics["efficiency_score"] = min(100, int(
                (automation_metrics["autonomous_approvals"] / total_actions) * 100
            ))
        
        # Calculate time savings in hours
        time_saved_hours = automation_metrics["time_saved_minutes"] / 60
        
        # Calculate uptime
        start = datetime.fromisoformat(automation_metrics["start_time"])
        uptime_hours = (datetime.now() - start).total_seconds() / 3600
        
        return {
            "success": True,
            "metrics": {
                "total_emails_processed": automation_metrics["total_emails_processed"],
                "total_tasks_created": automation_metrics["total_tasks_created"],
                "total_tasks_completed": automation_metrics["total_tasks_completed"],
                "total_meetings_scheduled": automation_metrics["total_meetings_scheduled"],
                "total_slack_messages": automation_metrics["total_slack_messages"],
                "autonomous_approvals": automation_metrics["autonomous_approvals"],
                "human_approvals": automation_metrics["human_approvals"],
                "time_saved_minutes": automation_metrics["time_saved_minutes"],
                "time_saved_hours": round(time_saved_hours, 2),
                "efficiency_score": automation_metrics["efficiency_score"],
                "uptime_hours": round(uptime_hours, 2)
            },
            "enterprise_metrics": {
                "roi_indicator": f"${round(time_saved_hours * 50, 2)}/hr value",
                "automation_rate": f"{automation_metrics['efficiency_score']}%",
                "tasks_per_day": round(automation_metrics["total_tasks_created"] / max(1, uptime_hours * 24), 2),
                "email_processing_rate": round(automation_metrics["total_emails_processed"] / max(1, uptime_hours * 24), 2)
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/metrics/reset")
def reset_metrics():
    """Reset all metrics"""
    global automation_metrics
    automation_metrics = {
        "total_emails_processed": 0,
        "total_tasks_created": 0,
        "total_tasks_completed": 0,
        "total_meetings_scheduled": 0,
        "total_slack_messages": 0,
        "autonomous_approvals": 0,
        "human_approvals": 0,
        "start_time": datetime.now().isoformat(),
        "time_saved_minutes": 0,
        "efficiency_score": 0
    }
    return {"success": True, "message": "Metrics reset successfully"}
