import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <AuthForm mode="sign-in" />
      </div>
    </main>
  );
}
