'use client'

import { getAvatarPresetUrl } from '@/lib/avatar-presets'
import { useTheme } from 'next-themes'

type UserAvatarProps = {
  name: string
  avatarKey?: string | null
  isPremium?: boolean
  premiumStyle?: 'glow' | 'neon'
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
  isPremium = false,
  premiumStyle,
  className = 'w-10 h-10',
  textClassName = 'text-sm',
}: UserAvatarProps) {
  const { resolvedTheme } = useTheme()
  const avatarUrl = getAvatarPresetUrl(avatarKey)
  const resolvedPremiumStyle = premiumStyle || (resolvedTheme === 'dark' ? 'neon' : 'glow')

  const premiumOuterClass =
    resolvedPremiumStyle === 'neon'
      ? 'p-[2px] bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-400 shadow-[0_0_0_1px_rgba(168,85,247,0.35),0_0_18px_rgba(59,130,246,0.35)] dark:shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_20px_rgba(59,130,246,0.45)]'
      : 'p-[2px] bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 shadow-[0_0_0_1px_rgba(251,191,36,0.38),0_0_16px_rgba(245,158,11,0.30)] dark:shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_0_20px_rgba(245,158,11,0.4)]'

  const premiumInnerClass =
    resolvedPremiumStyle === 'neon'
      ? 'ring-1 ring-violet-100/85 dark:ring-neutral-900/85'
      : 'ring-1 ring-amber-50/85 dark:ring-neutral-900/85'

  return (
    <div
      className={`${className} rounded-full ${isPremium ? premiumOuterClass : ''}`}
      title={name}
    >
      <div className={`w-full h-full rounded-full bg-[#5BC5A7] text-white flex items-center justify-center overflow-hidden ${isPremium ? premiumInnerClass : ''}`}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={`font-medium ${textClassName}`}>{getInitials(name)}</span>
        )}
      </div>
    </div>
  )
}