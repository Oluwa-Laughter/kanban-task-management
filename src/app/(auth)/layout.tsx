import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-light-grey px-4 dark:bg-very-dark-grey">
      <div className="mb-8 flex items-center">
        <Image
          src="/assets/logo-dark.svg"
          alt="kanban"
          width={153}
          height={26}
          className="block dark:hidden"
          priority
        />
        <Image
          src="/assets/logo-light.svg"
          alt="kanban"
          width={153}
          height={26}
          className="hidden dark:block"
          priority
        />
      </div>
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm dark:bg-dark-grey">
        {children}
      </div>
      <div className="mt-6 flex w-full max-w-md flex-col items-center gap-2">
        <p className="text-body-m text-medium-grey">Appearance</p>
        <ThemeToggle />
      </div>
    </main>
  );
}
