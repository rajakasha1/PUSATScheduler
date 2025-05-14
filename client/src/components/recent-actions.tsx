import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Edit, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export function RecentActions() {
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["/api/actions"],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "add":
        return <Check className="h-4 w-4 text-success" />;
      case "remove":
        return <X className="h-4 w-4 text-error" />;
      case "modify":
        return <Edit className="h-4 w-4 text-primary-500" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getIconText = (type: string) => {
    switch (type) {
      case "add":
        return <span className="text-success">Added:</span>;
      case "remove":
        return <span className="text-error">Removed:</span>;
      case "modify":
        return <span className="text-primary-500">Modified:</span>;
      default:
        return <span className="text-neutral-500">Action:</span>;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-heading font-semibold mb-4">Recent Actions</h3>
      <div className="space-y-2 max-h-44 overflow-y-auto">
        {isLoading ? (
          <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-sm">
            Loading recent actions...
          </div>
        ) : actions.length === 0 ? (
          <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-sm">
            No recent actions to display.
          </div>
        ) : (
          actions.map((action: any) => (
            <div key={action.id} className="bg-neutral-50 p-3 rounded border border-neutral-200 text-sm">
              <div className="flex items-start">
                <div className="flex items-center">
                  {getIcon(action.type)}
                  <span className="ml-1 mr-1">{getIconText(action.type)}</span>
                </div>
                <div className="flex-1">
                  {action.description.split(': ')[1]}
                </div>
                <div className="text-xs text-neutral-500 ml-2">
                  {getTimeAgo(action.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
