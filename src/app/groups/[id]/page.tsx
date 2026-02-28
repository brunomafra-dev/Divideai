'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function LegacyGroupPageRedirect() {
  const params = useParams()
  const router = useRouter()
  const groupId = String(params.id || '')

  useEffect(() => {
    if (!groupId) {
      router.replace('/')
      return
    }
    router.replace(`/group/${groupId}`)
  }, [groupId, router])

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <p className="text-gray-600">Carregando...</p>
    </div>
  )
}

