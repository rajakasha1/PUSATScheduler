import { ScheduleView } from "@/components/schedule-view";
import { ConflictsView } from "@/components/conflicts-view";

export default function Schedules() {
  return (
    <>
      <header className="bg-white shadow p-4">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">
          Schedules
        </h2>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <ScheduleView />
          <ConflictsView />
        </div>
      </main>
    </>
  );
}
