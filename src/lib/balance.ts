export interface BalanceTransaction {
  id: string
  group_id: string
  value: number
  payer_id: string
  participants?: string[] | null
  splits?: Record<string, number> | null
  status?: string | null
}

export interface BalancePayment {
  group_id: string
  from_user: string
  to_user: string
  amount: number
}

export interface UserBalanceResult {
  totalSpent: number
  paidByMe: number
  myShare: number
  balance: number
}

const EPSILON = 0.009

function isPaidStatus(status?: string | null) {
  return String(status || '').toLowerCase() === 'paid'
}

function getParticipants(tx: BalanceTransaction): string[] {
  if (Array.isArray(tx.participants) && tx.participants.length > 0) {
    return tx.participants
  }

  if (tx.splits && typeof tx.splits === 'object') {
    return Object.keys(tx.splits)
  }

  return []
}

export function calculateUserBalance(
  expenses: BalanceTransaction[],
  currentUserId: string,
  payments: BalancePayment[] = []
): UserBalanceResult {
  const totalSpent = expenses.reduce((acc, tx) => acc + (Number(tx.value) || 0), 0)

  let paidByMe = 0
  let myShare = 0

  for (const tx of expenses) {
    const value = Number(tx.value) || 0
    if (value <= 0 || isPaidStatus(tx.status)) continue

    if (String(tx.payer_id) === String(currentUserId)) {
      paidByMe += value
    }

    const participants = getParticipants(tx)
    if (!participants.includes(currentUserId)) continue

    const splitValue = tx.splits?.[currentUserId]
    if (typeof splitValue === 'number' && Number.isFinite(splitValue)) {
      myShare += splitValue
      continue
    }

    if (participants.length > 0) {
      myShare += value / participants.length
    }
  }

  let balance = paidByMe - myShare
  for (const payment of payments) {
    const amount = Number(payment.amount) || 0
    if (amount <= 0) continue
    if (String(payment.from_user) === String(currentUserId)) balance -= amount
    if (String(payment.to_user) === String(currentUserId)) balance += amount
  }

  if (Math.abs(balance) <= EPSILON) {
    balance = 0
  }

  return {
    totalSpent,
    paidByMe: Number(paidByMe.toFixed(2)),
    myShare: Number(myShare.toFixed(2)),
    balance: Number(balance.toFixed(2)),
  }
}
