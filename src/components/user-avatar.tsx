'use client'

import { getAvatarPresetUrl } from '@/lib/avatar-presets'

type UserAvatarProps = {
  name: string
  avatarKey?: string | null
  className?: string
  textClassName?: string
}

function getInitials(name: string) {
  const value = String(name || '').trim()
  if (!value) return '?'
  const parts = value.split(' ').filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return value.slice(0, 2).toUpperCase()
}

export default function UserAvatar({
  name,
  avatarKey,
  className = 'w-10 h-10',
  textClassName = 'text-sm',
}: UserAvatarProps) {
  const avatarUrl = getAvatarPresetUrl(avatarKey)

  return (
    <div className={`${className} rounded-full bg-[#5BC5A7] text-white flex items-center justify-center overflow-hidden`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={`font-medium ${textClassName}`}>{getInitials(name)}</span>
      )}
    </div>
  )
}
