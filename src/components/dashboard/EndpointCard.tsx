import { MockEndpoint, deleteEndpoint, toggleEndpoint } from "@/lib/mockStore";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const methodColors: Record<string, string> = {
  GET: "method-get method-get-bg",
  POST: "method-post method-post-bg",
  PUT: "method-put method-put-bg",
  PATCH: "method-patch method-patch-bg",
  DELETE: "method-delete method-delete-bg",
};

interface EndpointCardProps {
  endpoint: MockEndpoint;
  onRefresh: () => void;
}

const EndpointCard = ({ endpoint, onRefresh }: EndpointCardProps) => {
  const mockUrl = `https://mockapi.dev/m/${endpoint.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockUrl);
    toast.success("URL copied to clipboard");
  };

  const handleDelete = () => {
    deleteEndpoint(endpoint.id);
    onRefresh();
    toast.success("Endpoint deleted");
  };

  const handleToggle = () => {
    toggleEndpoint(endpoint.id);
    onRefresh();
  };

  const [methodColor, methodBg] = (methodColors[endpoint.method] || "text-foreground").split(" ");

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-bold ${methodColor} ${methodBg}`}>
              {endpoint.method}
            </span>
            <span className="font-mono text-sm text-foreground truncate">{endpoint.path}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{endpoint.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Status: {endpoint.statusCode}</span>
            <span>•</span>
            <span>Delay: {endpoint.delay}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Switch checked={endpoint.isActive} onCheckedChange={handleToggle} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
        <code className="flex-1 truncate text-xs font-mono text-muted-foreground">{mockUrl}</code>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="mr-1 h-3 w-3" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default EndpointCard;
