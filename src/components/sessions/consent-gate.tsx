"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

interface ConsentGateProps {
  onConfirm: () => void;
}

export function ConsentGate({ onConfirm }: ConsentGateProps): React.JSX.Element {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
            <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Patient Consent Required
        </h2>
        <p className="mb-8 text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Before recording, confirm that your patient has given verbal consent
          for this session to be recorded and transcribed by AI.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Yes, consent has been given
          </button>
          <button
            onClick={() => router.push("/sessions")}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel — go back
          </button>
        </div>
      </div>
    </div>
  );
}
