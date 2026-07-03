import ClientPage from './client-page'

export function generateStaticParams() {
  return [{ id: 'static', expenseId: 'static' }]
}


export default function Page() {
  return <ClientPage />
}
