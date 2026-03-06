import { motion } from "framer-motion";
import { Zap, Globe, Shield, Clock, Code2, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Endpoints",
    description: "Create a working API endpoint in under 10 seconds. No config, no setup.",
  },
  {
    icon: Code2,
    title: "Custom Responses",
    description: "Define JSON responses, status codes, headers, and delays for realistic mocking.",
  },
  {
    icon: Globe,
    title: "Cloud Hosted",
    description: "Your mock endpoints are live and accessible from anywhere. Share with your team.",
  },
  {
    icon: Clock,
    title: "Simulated Latency",
    description: "Add realistic delays to test loading states and error handling in your frontend.",
  },
  {
    icon: Shield,
    title: "CORS Ready",
    description: "All endpoints come with proper CORS headers. Works seamlessly from any origin.",
  },
  {
    icon: Layers,
    title: "Multiple Methods",
    description: "Support for GET, POST, PUT, PATCH, DELETE. Mock your entire API surface.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to <span className="text-gradient">mock fast</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Built for frontend developers who want to move fast without breaking things.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
