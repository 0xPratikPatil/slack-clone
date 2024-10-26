import { SignInButton, SignInFallback } from "@/components/auth/sign-in-btn";
import { Suspense } from "react";

export default async function Home() {
  const features = [
    "Email & Password",
    "Organization | Teams",
    "Passkeys",
    "Multi Factor",
    "Password Reset",
    "Email Verification",
    "Roles & Permissions",
    "Rate Limiting",
    "Session Management",
  ];
  return (
    <div className="min-h-[80vh] flex items-center justify-center overflow-hidden no-visible-scrollbar px-6 md:px-0">
      <main className="flex flex-col gap-4 row-start-2 items-center justify-center">
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-4xl text-black dark:text-white text-center">
            Welcome.
          </h3>
          <Suspense fallback={<SignInFallback />}>
            <SignInButton />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
