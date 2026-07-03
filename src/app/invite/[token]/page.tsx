import ClientPage from './client-page'

export function generateStaticParams() {
  return [{ token: 'static' }]
}


export default function Page() {
  return <ClientPage />
}
