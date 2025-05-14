import { Button } from "@/components/ui/button";
import { ClassForm } from "@/components/class-form";
import { ScheduleView } from "@/components/schedule-view";
import { ConflictsView } from "@/components/conflicts-view";
import { RecentActions } from "@/components/recent-actions";
import { StatsSummary } from "@/components/stats-summary";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const handleSaveSchedule = () => {
    toast({
      title: "Schedule Saved",
      description: "Your schedule has been saved successfully",
    });
  };

  return (
    <>
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">
          Class Routine Management
        </h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            className="bg-secondary-500 hover:bg-secondary-600"
            onClick={handleSaveSchedule}
          >
            <Save className="h-4 w-4 mr-2" /> Save Schedule
          </Button>
          <div className="relative">
            <div className="flex items-center space-x-2 text-neutral-700">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                <span className="text-sm font-medium">AD</span>
              </div>
              <span>Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-1">
              <ClassForm />
              <RecentActions />
            </div>

            {/* Right Column - Schedule View */}
            <div className="lg:col-span-2">
              <ScheduleView />
              <ConflictsView />
            </div>
          </div>
        </div>

        <StatsSummary />
      </main>
    </>
  );
}
