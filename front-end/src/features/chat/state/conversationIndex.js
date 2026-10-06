const STORAGE_KEY = 'bible-ai-assistant.conversations.v1'

function storageKey(userId) {
  return `${STORAGE_KEY}:${encodeURIComponent(userId || 'unknown-user')}`
}

export function readConversationIndex(userId, storage) {
  try {
    const saved = (storage ?? globalThis.localStorage)?.getItem(storageKey(userId))
    const conversations = saved ? JSON.parse(saved) : []
    return Array.isArray(conversations)
      ? conversations.filter((item) => typeof item?.id === 'string' && typeof item?.title === 'string')
      : []
  } catch {
    return []
  }
}

export function writeConversationIndex(conversations, userId, storage) {
  try {
    const targetStorage = storage ?? globalThis.localStorage
    targetStorage?.setItem(storageKey(userId), JSON.stringify(conversations))
  } catch {
    return false
  }
  return true
}

export function upsertConversationIndex(conversations, id, title) {
  if (!id) return conversations

  const previous = conversations.find((conversation) => conversation.id === id)
  const next = {
    id,
    title: title?.trim() || previous?.title || 'محادثة جديدة',
    updatedAt: Date.now(),
  }

  return [next, ...conversations.filter((conversation) => conversation.id !== id)]
}