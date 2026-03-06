import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Define your endpoint",
    description: "Choose a method, set the path, and configure your response.",
    code: `POST /api/v1/users\nStatus: 201\nDelay: 200ms`,
  },
  {
    step: "02",
    title: "Write your response",
    description: "Craft the exact JSON your frontend expects to receive.",
    code: `{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com"
}`,
  },
  {
    step: "03",
    title: "Use your live URL",
    description: "Copy the endpoint URL and start fetching in your app immediately.",
    code: `const res = await fetch(
  "https://mockapi.dev/m/abc123"
);`,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 border-t border-border">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Three steps. <span className="text-gradient">Zero friction.</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            From nothing to a live mock endpoint in under a minute.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col"
            >
              <div className="mb-4">
                <span className="font-mono text-sm text-primary font-semibold">{step.step}</span>
                <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
              <div className="mt-auto rounded-lg border border-border bg-card p-4 font-mono text-sm">
                <pre className="text-muted-foreground whitespace-pre-wrap">{step.code}</pre>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
