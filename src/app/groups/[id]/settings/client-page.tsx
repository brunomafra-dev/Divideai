import { redirect } from 'next/navigation'

export default function LegacyGroupSettingsPage({ params }: { params: { id: string } }) {
  redirect(`/group/${params.id}/settings`)
}
