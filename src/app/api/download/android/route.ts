import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apkPath = join(process.cwd(), 'android', 'app', 'release', 'divideai-beta.apk')

  if (!existsSync(apkPath)) {
    return new Response('Arquivo APK não encontrado.', { status: 404 })
  }

  const fileBuffer = readFileSync(apkPath)

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="divideai-beta.apk"',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

