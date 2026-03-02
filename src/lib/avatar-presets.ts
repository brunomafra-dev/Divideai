export type AvatarPreset = {
  key: string
  label: string
  style: 'fun-emoji' | 'bottts-neutral' | 'adventurer-neutral'
  seed: string
  query?: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { key: 'neo', label: 'Neo', style: 'fun-emoji', seed: 'divideai-neo' },
  { key: 'luna', label: 'Luna', style: 'fun-emoji', seed: 'divideai-luna' },
  { key: 'rex', label: 'Rex', style: 'fun-emoji', seed: 'divideai-rex' },
  { key: 'ivy', label: 'Ivy', style: 'fun-emoji', seed: 'divideai-ivy' },
  { key: 'volt', label: 'Volt', style: 'fun-emoji', seed: 'divideai-volt' },
  { key: 'echo', label: 'Echo', style: 'fun-emoji', seed: 'divideai-echo' },
  { key: 'nora', label: 'Nora', style: 'fun-emoji', seed: 'divideai-nora' },
  { key: 'max', label: 'Max', style: 'fun-emoji', seed: 'divideai-max' },

  { key: 'sky', label: 'Sky', style: 'bottts-neutral', seed: 'divideai-sky' },
  { key: 'zara', label: 'Zara', style: 'bottts-neutral', seed: 'divideai-zara' },
  { key: 'jin', label: 'Jin', style: 'bottts-neutral', seed: 'divideai-jin' },
  { key: 'kai', label: 'Kai', style: 'bottts-neutral', seed: 'divideai-kai' },
  { key: 'mila', label: 'Mila', style: 'bottts-neutral', seed: 'divideai-mila' },
  { key: 'orion', label: 'Orion', style: 'bottts-neutral', seed: 'divideai-orion' },
  { key: 'nova', label: 'Nova', style: 'adventurer-neutral', seed: 'divideai-nova' },
  { key: 'atlas', label: 'Atlas', style: 'bottts-neutral', seed: 'divideai-atlas' },
  { key: 'riven', label: 'Riven', style: 'bottts-neutral', seed: 'divideai-riven' },
  { key: 'pixel', label: 'Pixel', style: 'bottts-neutral', seed: 'divideai-pixel' },
  { key: 'ruby', label: 'Ruby', style: 'adventurer-neutral', seed: 'divideai-ruby', query: 'backgroundColor=ef4444,f87171' },
  { key: 'emberx', label: 'EmberX', style: 'bottts-neutral', seed: 'divideai-emberx', query: 'backgroundColor=b91c1c,dc2626' },

  { key: 'aurora', label: 'Aurora', style: 'adventurer-neutral', seed: 'divideai-aurora' },
  { key: 'blaze', label: 'Blaze', style: 'adventurer-neutral', seed: 'divideai-blaze' },
  { key: 'cedar', label: 'Cedar', style: 'adventurer-neutral', seed: 'divideai-cedar' },
  { key: 'dahlia', label: 'Dahlia', style: 'adventurer-neutral', seed: 'divideai-dahlia' },
  { key: 'ember', label: 'Ember', style: 'adventurer-neutral', seed: 'divideai-ember' },
  { key: 'flint', label: 'Flint', style: 'adventurer-neutral', seed: 'divideai-flint' },
  { key: 'gaia', label: 'Gaia', style: 'adventurer-neutral', seed: 'divideai-gaia' },
  { key: 'helix', label: 'Helix', style: 'adventurer-neutral', seed: 'divideai-helix' },
]

const LEGACY_KEY_ALIAS: Record<string, string> = {
  cat: 'neo',
  dog: 'max',
  fox: 'jin',
  panda: 'echo',
  koala: 'sky',
  frog: 'rex',
  tiger: 'volt',
  penguin: 'kai',
  rabbit: 'zara',
  owl: 'luna',
  unicorn: 'nora',
  bear: 'jin',
  sun: 'volt',
  moon: 'echo',
  leaf: 'max',
  rocket: 'neo',
  wave: 'sky',
  fire: 'jin',
  coffee: 'rex',
  star: 'luna',
}

function resolveAvatarKey(avatarKey?: string | null): string | null {
  if (!avatarKey) return null
  if (AVATAR_PRESETS.some((item) => item.key === avatarKey)) return avatarKey
  return LEGACY_KEY_ALIAS[avatarKey] || null
}

export function isValidAvatarPresetKey(value: string | null | undefined): value is string {
  if (!value) return false
  return Boolean(resolveAvatarKey(value))
}

export function getAvatarPresetUrl(avatarKey?: string | null): string | null {
  const resolved = resolveAvatarKey(avatarKey)
  if (!resolved) return null
  const preset = AVATAR_PRESETS.find((item) => item.key === resolved)
  if (!preset) return null

  const base = `https://api.dicebear.com/9.x/${preset.style}/svg?seed=${encodeURIComponent(preset.seed)}`
  return preset.query ? `${base}&${preset.query}` : base
}

export function getDefaultAvatarKey(seed: string): string {
  if (!seed) return AVATAR_PRESETS[0].key

  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }

  const index = Math.abs(hash) % AVATAR_PRESETS.length
  return AVATAR_PRESETS[index].key
}

