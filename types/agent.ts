export type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'approved' 
  | 'retry' 
  | 'waiting_for_input'
  | 'failed' 
  | 'sent' 
  | 'partial'

export type EmailDraft = {
  to: string
  subject: string
  body: string
  note?: string
  investor_name?: string
  firm?: string
  skipped?: boolean
}

export type SendResult = {
  to: string
  success: boolean
  error?: string
}

export type AgentTask = {
  task_id: string
  createdAt: string
  tenantId: string
  goal: string
  agentType: string
  status: TaskStatus
  output: {
    bd_agent?: EmailDraft[]
    send_results?: SendResult[]
    step_log?: string[]
    user_prompt?: string
  } | null
  critic_feedback: string | null
  retryCount: number
}


export type ApproveResponse = {
  total: number
  sent: number
  failed: number
  skipped: number
  results: SendResult[]
  task_id: string
}

export type AgentRunResponse = {
  task_id: string
  status: TaskStatus
  output: AgentTask['output']
  critic_feedback: string | null
}
