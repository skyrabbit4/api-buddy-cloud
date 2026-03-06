import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, LayoutDashboard, Inbox } from "lucide-react";
import { getEndpoints, MockEndpoint } from "@/lib/mockStore";
import EndpointCard from "@/components/dashboard/EndpointCard";
import CreateEndpointDialog from "@/components/dashboard/CreateEndpointDialog";

const Dashboard = () => {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);

  const refresh = () => setEndpoints(getEndpoints());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">MockAPI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">Free Plan</span>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Your Endpoints
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <CreateEndpointDialog onCreated={refresh} />
        </div>

        {endpoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold">No endpoints yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Create your first mock endpoint to start building your frontend without waiting for the backend.
            </p>
            <CreateEndpointDialog onCreated={refresh} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {endpoints.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
