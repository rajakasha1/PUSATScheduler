import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Download, RotateCcw, Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
  };
  
  const handleReset = () => {
    toast({
      title: "Reset Complete",
      description: "Settings have been reset to defaults",
    });
  };
  
  return (
    <>
      <header className="bg-white shadow p-4">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">
          Settings
        </h2>
      </header>

      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure how the PUSAT Scheduler works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Auto-save schedules</h3>
                      <p className="text-sm text-neutral-500">
                        Automatically save changes to schedules
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Conflict detection</h3>
                      <p className="text-sm text-neutral-500">
                        Show warnings when scheduling conflicts occur
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Dark mode</h3>
                      <p className="text-sm text-neutral-500">
                        Use dark theme for the interface
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Data Management</h3>
                  
                  <div className="flex space-x-2">
                    <Button className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export Schedules
                    </Button>
                    
                    <Button variant="outline" className="flex items-center">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleReset}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
