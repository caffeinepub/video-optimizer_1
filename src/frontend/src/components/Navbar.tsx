import { Moon, Sun, Video } from "lucide-react";
import { motion } from "motion/react";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="gradient-teal flex h-9 w-9 items-center justify-center rounded-xl shadow-glow">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Video Optimizer
          </span>
        </div>

        {/* Dark mode toggle */}
        <motion.button
          data-ocid="nav.toggle"
          onClick={onToggleDark}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </nav>
  );
}
