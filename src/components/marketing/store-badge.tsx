'use client'

import Link from 'next/link'

type StoreBadgeProps = {
  href: string
  platform: 'android' | 'ios'
  title: string
  subtitle: string
  className?: string
  newTab?: boolean
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fill="#34A853" d="M3 3.8L13.5 12 3 20.2z" />
      <path fill="#4285F4" d="M13.5 12l3-2.2L20.8 12l-4.3 2.2z" />
      <path fill="#FBBC05" d="M3 3.8l8.6 6.7 2.9-2.1-5.8-3.6z" />
      <path fill="#EA4335" d="M3 20.2l8.6-6.7 2.9 2.1-5.8 3.6z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
      <path d="M16.37 12.14c.03 3.09 2.72 4.12 2.75 4.14-.02.07-.43 1.5-1.42 2.97-.86 1.27-1.74 2.54-3.15 2.57-1.38.03-1.82-.82-3.4-.82s-2.07.8-3.35.85c-1.36.05-2.4-1.37-3.27-2.63C2.77 16.58 1.34 11.82 3.18 8.63c.92-1.58 2.56-2.58 4.34-2.6 1.35-.03 2.62.9 3.4.9.78 0 2.24-1.12 3.77-.95.64.03 2.44.26 3.59 1.95-.09.06-2.14 1.25-2.11 3.71zM13.8 4.38c.72-.87 1.2-2.08 1.07-3.28-1.04.04-2.28.69-3.03 1.56-.66.76-1.24 1.99-1.08 3.16 1.16.09 2.32-.59 3.04-1.44z" />
    </svg>
  )
}

export default function StoreBadge({
  href,
  platform,
  title,
  subtitle,
  className = '',
  newTab = false,
}: StoreBadgeProps) {
  const base =
    'group inline-flex min-w-[220px] items-center gap-3 rounded-xl bg-[#111111] text-white px-4 py-3 border border-[#2A2A2A] shadow-[0_6px_20px_rgba(0,0,0,0.18)] hover:bg-[#1b1b1b] hover:-translate-y-0.5 transition-all'

  const content = (
    <>
      <span className="shrink-0 rounded-lg bg-white/10 p-1.5 border border-white/10 group-hover:border-white/20">
        {platform === 'android' ? <PlayMark /> : <AppleMark />}
      </span>
      <span className="leading-tight">
        <span className="block text-[10px] text-white/70">{subtitle}</span>
        <span className="block text-sm font-semibold tracking-tight">{title}</span>
      </span>
    </>
  )

  if (newTab) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`}>
        {content}
      </Link>
    )
  }

  return (
    <Link href={href} className={`${base} ${className}`}>
      {content}
    </Link>
  )
}
