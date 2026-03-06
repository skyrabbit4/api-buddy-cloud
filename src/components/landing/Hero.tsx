import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

const Hero = () => {
  const codeSnippet = `fetch("https://mockapi.dev/api/v1/users")
  .then(res => res.json())
  .then(data => console.log(data))`;

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now in public beta
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            Mock APIs in{" "}
            <span className="text-gradient">seconds</span>,
            <br />not hours
          </h1>

          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Generate instant mock endpoints with custom JSON responses. Stop waiting for the backend — start building now.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 text-base font-semibold px-8 animate-pulse-glow">
                Start Mocking <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8">
                See how it works
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg shadow-black/20">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippet);
                  toast.success("Copied to clipboard");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <pre className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>
                <span className="text-primary">fetch</span>
                <span className="text-foreground">(</span>
                <span className="text-green-400">"https://mockapi.dev/api/v1/users"</span>
                <span className="text-foreground">)</span>
                {"\n  "}
                <span className="text-muted-foreground">.then</span>
                <span className="text-foreground">(</span>
                <span className="text-orange-400">res</span>
                <span className="text-muted-foreground"> =&gt; </span>
                <span className="text-orange-400">res</span>
                <span className="text-foreground">.</span>
                <span className="text-primary">json</span>
                <span className="text-foreground">())</span>
                {"\n  "}
                <span className="text-muted-foreground">.then</span>
                <span className="text-foreground">(</span>
                <span className="text-orange-400">data</span>
                <span className="text-muted-foreground"> =&gt; </span>
                <span className="text-foreground">console.</span>
                <span className="text-primary">log</span>
                <span className="text-foreground">(</span>
                <span className="text-orange-400">data</span>
                <span className="text-foreground">))</span>
              </code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
