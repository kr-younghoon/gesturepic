import { AuthButton } from '@/features/auth/ui/auth-button'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Welcome to GesturePic</h1>
        <AuthButton />
      </div>
    </main>
  )
}