import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { addEndpoint, HttpMethod } from "@/lib/mockStore";
import { toast } from "sonner";

const defaultResponse = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active"
}`;

interface CreateEndpointDialogProps {
  onCreated: () => void;
}

const CreateEndpointDialog = ({ onCreated }: CreateEndpointDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("/api/v1/");
  const [statusCode, setStatusCode] = useState(200);
  const [responseBody, setResponseBody] = useState(defaultResponse);
  const [delay, setDelay] = useState(0);

  const handleCreate = () => {
    if (!name.trim() || !path.trim()) {
      toast.error("Name and path are required");
      return;
    }

    try {
      JSON.parse(responseBody);
    } catch {
      toast.error("Response body must be valid JSON");
      return;
    }

    addEndpoint({ name, method, path, statusCode, responseBody, delay });
    toast.success("Endpoint created!");
    onCreated();
    setOpen(false);
    setName("");
    setMethod("GET");
    setPath("/api/v1/");
    setStatusCode(200);
    setResponseBody(defaultResponse);
    setDelay(0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Endpoint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Mock Endpoint</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Get all users" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 bg-secondary border-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status Code</Label>
              <Input type="number" value={statusCode} onChange={(e) => setStatusCode(Number(e.target.value))} className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label>Delay (ms)</Label>
              <Input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="mt-1.5 bg-secondary border-border" />
            </div>
          </div>

          <div>
            <Label htmlFor="path">Path</Label>
            <Input id="path" placeholder="/api/v1/users" value={path} onChange={(e) => setPath(e.target.value)} className="mt-1.5 font-mono bg-secondary border-border" />
          </div>

          <div>
            <Label htmlFor="response">Response Body (JSON)</Label>
            <Textarea
              id="response"
              value={responseBody}
              onChange={(e) => setResponseBody(e.target.value)}
              rows={8}
              className="mt-1.5 font-mono text-sm bg-secondary border-border"
            />
          </div>

          <Button onClick={handleCreate} className="w-full">Create Endpoint</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEndpointDialog;
