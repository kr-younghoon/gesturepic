import { AuthButton } from '@/features/auth/ui/auth-button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">GesturePic</h1>
        <AuthButton />
      </div>
    </main>
  )
}