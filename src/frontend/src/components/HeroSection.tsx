import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

const bullets = [
  "100% Private – Runs in Your Browser",
  "No Upload Required",
  "Fast Compression with Minimal Quality Loss",
  "One-Click Metadata Removal",
];

interface HeroSectionProps {
  onUploadClick: () => void;
}

export function HeroSection({ onUploadClick }: HeroSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Browser-native • Zero server uploads
        </div>

        <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl">
          Video Optimizer
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Privacy Cleaner for Videos – clean up Metadata.
        </p>

        {/* Feature bullets */}
        <ul className="mb-10 inline-flex flex-col gap-2 text-left">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              {b}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div>
          <motion.button
            data-ocid="hero.primary_button"
            onClick={onUploadClick}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 32px oklch(0.75 0.18 185 / 0.45)",
            }}
            whileTap={{ scale: 0.97 }}
            className="gradient-teal rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
          >
            Upload Video
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
