// sustain-wear/src/app/debug/page.tsx
import DashboardDebugSwitcher from "./DashboardDebugSwitcher";

export default async function DebugPage() {
  return (
    <main className="mx-auto max-w-6xl py-8">
      <DashboardDebugSwitcher donations={[]} />
    </main>
  );
}
