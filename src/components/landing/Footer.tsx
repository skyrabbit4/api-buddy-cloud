import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
          <Zap className="h-3 w-3 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold">MockAPI</span>
      </div>
      <p className="text-xs text-muted-foreground">
        © 2026 MockAPI. Built for developers who ship fast.
      </p>
    </div>
  </footer>
);

export default Footer;
