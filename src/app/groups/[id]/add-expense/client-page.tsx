import { redirect } from 'next/navigation'

export default function LegacyAddExpensePage({ params }: { params: { id: string } }) {
  redirect(`/group/${params.id}/add-expense`)
}
