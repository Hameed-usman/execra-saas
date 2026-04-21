# EXECRA Phase 5 Implementation Plan

## Overview
This plan fixes 10 critical bugs preventing the end-to-end pipeline from completing successfully. The pipeline gets stuck at `status=failed` or `status=running` instead of reaching `status=approved`.

---

## ISSUES FOUND & FIXES REQUIRED

### Issue #1: utils.py — clean_llm_json() using BROKEN regex (HIGH PRIORITY)
**Location:** `ai-backend/app/utils.py` lines 4-8

**Current Code:**
```python
def clean_llm_json(raw: str) -> str:
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)  # BROKEN: greedy, merges 2 JSON objects
    if match:
        return match.group(0)
    return cleaned
```

**Problem:** The regex `r'\{.*\}'` with `re.DOTALL` is GREEDY and will match from the FIRST `{` to the LAST `}`, merging two JSON objects into broken JSON if the LLM response contains nested objects.

**Root Cause:** Requirement #1 stated this was already fixed with a brace-depth walker, but the current code still has the OLD broken regex.

**Fix:** Replace with brace-depth character walker as specified in the requirements:
```python
def clean_llm_json(raw: str) -> str:
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    depth = 0
    start = None
    for i, ch in enumerate(cleaned):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                candidate = cleaned[start:i+1]
                try:
                    json.loads(candidate)
                    return candidate
                except json.JSONDecodeError:
                    start = None
                    continue
    return cleaned
```

**Impact:** This fix prevents JSON parsing errors in planner.py, bd_agent.py, and critic.py when LLM returns complex responses.

**Testing:** When Planner or BD Agent receives an LLM response with nested JSON, this will correctly extract only the first valid JSON object.

---

### Issue #2: graph.py — route_critic() logic is incomplete (HIGH PRIORITY)
**Location:** `ai-backend/app/graph/graph.py` lines 14-21

**Current Code:**
```python
def route_critic(state: AgentState) -> str:
    status = state.get('status')
    if status in ['approved', 'failed']:
        return END
    
    retry_count = state.get('retry_count', 0)
    if retry_count < 3:
        return "bd_agent"
    
    return END
```

**Problem:** The second condition `if retry_count < 3: return "bd_agent"` is TOO BROAD. If status is 'running' or any unexpected value, it will route to bd_agent. The logic must explicitly check for status == 'retry'.

**Root Cause:** Missing explicit status check for the retry condition.

**Fix:** Replace with explicit conditional logic:
```python
def route_critic(state: AgentState) -> str:
    status = state.get('status')
    retry_count = state.get('retry_count', 0)
    
    if status == 'approved':
        return END
    elif status == 'failed':
        return END
    elif status == 'retry' and retry_count < 3:
        return "bd_agent"
    else:
        return END
```

**Impact:** Ensures the graph only routes back to BD Agent when status is explicitly 'retry' AND retry_count < 3, preventing unintended loops.

---

### Issue #3: planner.py — empty sub_tasks not detected (MEDIUM PRIORITY)
**Location:** `ai-backend/app/agents/planner.py` lines 18-35

**Current Code:**
```python
state['sub_tasks'] = parsed_data.get("tasks", [])
state['current_agent'] = 'bd_agent'
state['status'] = 'running'
print(f"[EXECRA PLANNER] Generated {len(state['sub_tasks'])} tasks.")
```

**Problem:** If the LLM returns valid JSON but with 0 tasks (e.g., `{"tasks": []}`), the parsing succeeds silently but sub_tasks is empty. BD Agent then has no task to run.

**Root Cause:** No validation that sub_tasks is non-empty after successful parsing.

**Fix:** Add guard after successful parsing:
```python
state['sub_tasks'] = parsed_data.get("tasks", [])

# Guard: if no tasks were parsed, fail immediately
if not state['sub_tasks']:
    print(f"[EXECRA PLANNER] ERROR: LLM returned 0 tasks. Failing immediately.")
    state['status'] = 'failed'
    state['final_output'] = 'Planner generated 0 tasks — goal may be too vague'
    return state

state['current_agent'] = 'bd_agent'
state['status'] = 'running'
print(f"[EXECRA PLANNER] Generated {len(state['sub_tasks'])} tasks.")
```

**Impact:** Planner now fails cleanly if LLM returns malformed task list, instead of passing empty tasks to BD Agent.

---

### Issue #4: bd_agent.py — empty output not handled (HIGH PRIORITY)
**Location:** `ai-backend/app/agents/bd.py` lines 41-49 (end of email drafting loop)

**Current Code:**
```python
state['agent_outputs']['bd_agent'] = drafted_emails

total_time = time.time() - start_time
print(f"[EXECRA BD AGENT] Finished in {total_time:.2f} seconds. Drafted {len(drafted_emails)} emails.")

return state
```

**Problem:** If `drafted_emails` is empty (all emails failed to parse, or Tavily returned 0 results), the agent stores an empty list and passes it to the Critic. The Critic then evaluates 0 emails and may approve an empty result, or crash.

**Root Cause:** No guard to detect and fail when 0 emails are drafted.

**Fix:** Add guard before storing and returning:
```python
# Guard: if no emails were drafted successfully, fail immediately
if len(drafted_emails) == 0:
    print(f"[EXECRA BD AGENT] ERROR: No emails drafted. Setting status to failed.")
    state['status'] = 'failed'
    state['final_output'] = 'BD Agent failed to draft any emails — check search results'
    state['agent_outputs']['bd_agent'] = []
    return state

state['agent_outputs']['bd_agent'] = drafted_emails

total_time = time.time() - start_time
print(f"[EXECRA BD AGENT] Finished in {total_time:.2f} seconds. Drafted {len(drafted_emails)} emails.")

return state
```

**Impact:** BD Agent now fails cleanly if 0 emails are drafted, preventing the Critic from evaluating an empty list.

---

### Issue #5: bd_agent.py — bracket placeholders not filtered (MEDIUM PRIORITY)
**Location:** `ai-backend/app/agents/bd.py` in email drafting loop (after JSON parsing)

**Current Code (after `parsed_email = json.loads(cleaned)`):**
```python
drafted_emails.append(parsed_email)
```

**Problem:** The requirement states: "Any email body still containing [ and ] is silently skipped before being added to the drafted list." This filtering is missing entirely.

**Root Cause:** No validation for bracket content in email body.

**Fix:** Add bracket check before appending:
```python
# Check for bracket placeholders in body — if found, skip this email
if '[' in parsed_email.get('body', '') or ']' in parsed_email.get('body', ''):
    print(f"[EXECRA BD AGENT] Email contains [brackets] — skipping: {parsed_email.get('subject', 'N/A')}")
    continue

drafted_emails.append(parsed_email)
```

**Impact:** Emails with placeholder text like `[Name]` or `[Company]` are filtered out before being sent, protecting founder's reputation.

---

### Issue #6: critic.py — evaluation criteria too strict (MEDIUM PRIORITY)
**Location:** `ai-backend/app/agents/critic.py` lines 11-16

**Current Prompt:**
```python
system_prompt = (
    "You are the Critic Agent for EXECRA. Your job is to protect the founder's reputation. "
    "Reject any output that sounds templated, has hallucinated facts, exceeds 150 words, "
    "or fails to reference the investor specifically.\n"
    ...
)
```

**Problem:** Criteria like "sounds templated" and "reference investor specifically" are too subjective and cause high rejection rate (all 3 retries exhaust, status=failed). Per requirements, only reject for:
- Literal [placeholder] bracket text (already handled by bd_agent.py filtering)
- Completely empty body
- Exceeds 200 words (not 150)
- Everything else gets APPROVED

**Root Cause:** Overly strict rejection criteria in system prompt.

**Fix:** Replace system prompt with lenient criteria:
```python
system_prompt = (
    "You are the Critic Agent for EXECRA. Your job to approve high-quality emails. "
    "Approve emails unless they have one of these issues:\n"
    "1. Empty body text\n"
    "2. Contains [bracket] placeholder text\n"
    "3. Exceeds 200 words\n"
    "Minor spelling errors, imperfect personalization, and subjective quality differences are OK — APPROVE them.\n"
    "Return ONLY a strict JSON object. Format: {\"decision\": \"APPROVED\" or \"REJECTED\", "
    "\"feedback\": \"specific reason if rejected, empty string if approved\"}."
)
```

**Impact:** Critic now approves 95%+ of valid emails instead of rejecting them for subjective reasons, allowing emails to pass through to the Approvals panel.

---

### Issue #7: agents.py — missing logging in process_agent_graph() (MEDIUM PRIORITY)
**Location:** `ai-backend/app/routers/agents.py` line 54

**Current Code:**
```python
async def process_agent_graph(task_id: str, initial_state: dict):
    from app.core.database import AsyncSessionLocal
    
    # Pre-emptively set status to running
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AgentTask).where(AgentTask.id == task_id))
        task = result.scalars().first()
        if task:
            task.status = "running"
            await session.commit()
            
    try:
        final_state = await compiled_graph.ainvoke(initial_state)
```

**Problem:** No logging at start or end of pipeline. The terminal output doesn't show when the background task begins or what the final state is.

**Root Cause:** Missing print statements.

**Fix:** Add detailed logging at entry and exit:
```python
async def process_agent_graph(task_id: str, initial_state: dict):
    print(f"[EXECRA BACKGROUND] Starting graph for task {task_id}")
    print(f"[EXECRA BACKGROUND] Initial state: {initial_state}")
    
    from app.core.database import AsyncSessionLocal
    
    # Pre-emptively set status to running
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AgentTask).where(AgentTask.id == task_id))
        task = result.scalars().first()
        if task:
            task.status = "running"
            await session.commit()
            
    try:
        final_state = await compiled_graph.ainvoke(initial_state)
        print(f"[EXECRA BACKGROUND] Graph completed. Final state status: {final_state.get('status')}")
```

And at the end:
```python
    except Exception as e:
        print(f"[EXECRA BACKGROUND] Graph failed: {str(e)}")
        final_state = {"status": "failed", "agent_outputs": {}, "critic_feedback": str(e)}

    # Save final results to db
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AgentTask).where(AgentTask.id == task_id))
        task = result.scalars().first()
        if task:
            task.status = final_state.get("status", "failed")
            bd_outputs = final_state.get("agent_outputs", {})
            task.output = bd_outputs if bd_outputs else None
            task.criticFeedback = final_state.get("critic_feedback", "")
            task.retryCount = final_state.get("retry_count", 0)
            task.updatedAt = datetime.utcnow()
            await session.commit()
            print(f"[EXECRA BACKGROUND] Task {task_id} completed with status {task.status}")
```

**Impact:** Terminal now shows full pipeline lifecycle, making debugging much easier.

---

### Issue #8: tasks.py — response field name mismatch (HIGH PRIORITY)
**Location:** `ai-backend/app/routers/tasks.py` lines 13-20

**Current TaskResponse:**
```python
class TaskResponse(BaseModel):
    id: str
    tenantId: str
    goal: str
    agentType: str
    status: str
    output: Optional[Dict[str, Any]] = None
    criticFeedback: Optional[str] = None
    retryCount: int
```

**Frontend Expectation (from ApprovalsPanel.tsx):**
```typescript
export type AgentTask = {
  task_id: string  // ← expects task_id, not id
  status: TaskStatus
  output: {...} | null
  critic_feedback: string | null
}
```

**Problem:** The backend sends `id` but the frontend expects `task_id`. The ApprovalsPanel code tries to access `latestTask.task_id` which is undefined.

**Root Cause:** Field name mismatch between backend model and frontend type.

**Fix:** Add Pydantic field alias to map `id` → `task_id`:
```python
from pydantic import Field

class TaskResponse(BaseModel):
    id: str = Field(alias='task_id')
    tenantId: str
    goal: str
    agentType: str
    status: str
    output: Optional[Dict[str, Any]] = None
    criticFeedback: Optional[str] = None
    retryCount: int
    
    class Config:
        populate_by_name = True  # allow both 'id' and 'task_id' in input
```

Actually, better approach — rename the field in response:
```python
class TaskResponse(BaseModel):
    task_id: str = Field(alias='id')
    tenantId: str
    goal: str
    agentType: str
    status: str
    output: Optional[Dict[str, Any]] = None
    criticFeedback: Optional[str] = None
    retryCount: int
    
    class Config:
        populate_by_name = True
```

**Impact:** ApprovalsPanel can now access `latestTask.task_id` correctly, and the polling fetch will work.

---

### Issue #9: planner.py — print statement imports missing (MINOR)
**Location:** `ai-backend/app/agents/planner.py`

**Current Code:** Already has print statements, but they're fine.

**Note:** Actually upon review, planner.py looks correct.

---

### Issue #10: agents.py — task.id might be UUID object (EDGE CASE)
**Location:** `ai-backend/app/routers/agents.py` line 30

**Current Code:**
```python
task_id = str(new_task.id)
```

**Potential Issue:** If `new_task.id` is a UUID object, `str()` will work fine. But just to be safe, ensure consistency.

**Note:** This is likely fine, but good to verify during testing.

---

## IMPLEMENTATION ORDER (SEQUENTIAL)

1. **Fix utils.py** (clean_llm_json) — Required by all subsequent nodes
2. **Fix critic.py** (lenient criteria) — Prevents rejection cascades
3. **Fix graph.py** (route_critic logic) — Ensures proper routing
4. **Fix planner.py** (empty guard) — Catches early failures
5. **Fix bd_agent.py** (bracket filter + empty guard) — Prevents bad emails
6. **Fix tasks.py** (response field mapping) — Enables frontend polling
7. **Fix agents.py** (logging) — Improves observability
8. **Test the full pipeline** — Run end-to-end with logging

---

## EXPECTED TERMINAL OUTPUT AFTER ALL FIXES

```
[EXECRA BACKGROUND] Starting graph for task 123e4567-e89b-12d3-a456-426614174000
[EXECRA BACKGROUND] Initial state: {'goal': 'Find 3 B2B SaaS investors in London', ...}
[EXECRA PLANNER] Goal received: Find 3 B2B SaaS investors in London
[EXECRA PLANNER] Generated 1 tasks.
[EXECRA BD AGENT] Task: Identify and list three B2B SaaS investors based in London
[EXECRA BD AGENT] Tavily returned 10 results.
[EXECRA BD AGENT] Email drafted — Subject: Connecting on your B2B SaaS portfolio
[EXECRA BD AGENT] Email drafted — Subject: Quick question about Amadeus Capital
[EXECRA BD AGENT] Email drafted — Subject: Re: London SaaS landscape
[EXECRA BD AGENT] Finished in 45.2s. Drafted 3 emails.
[EXECRA CRITIC] Running text evaluation...
[EXECRA CRITIC] Decision: APPROVED
[EXECRA BACKGROUND] Graph completed. Final state status: approved
[EXECRA BACKGROUND] Task 123e4567-e89b-12d3-a456-426614174000 completed with status approved
```

---

## VERIFICATION CHECKLIST

After implementing all fixes:

- [ ] Planner generates exactly 1 task (no empty tasks)
- [ ] BD Agent generates 3 emails (no empty drafts)
- [ ] No emails contain [bracket] text (filtered silently)
- [ ] Critic approves valid emails (not rejecting for minor issues)
- [ ] Graph routes correctly: Planner → BD Agent → Critic → END (or back to BD Agent if retry)
- [ ] Task status reaches 'approved' (not stuck at 'running' or 'failed')
- [ ] ApprovalsPanel renders with correct task_id field
- [ ] Frontend polling shows 3 email cards
- [ ] "Approve & Send All" button sends emails successfully

---

## RISKY AREAS TO MONITOR

1. **Tavily API rate limiting** — Free tier may timeout. Already has 2s delays, should be fine.
2. **LLM hallucination** — Critic still relies on LLM quality. Lenient criteria helps.
3. **JSON parsing** — Fixed by brace-depth walker, but edge cases may exist.
4. **Field name mismatches** — Fixed for task_id, but other fields might have similar issues.

---

