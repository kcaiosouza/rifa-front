import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

interface RaffleNumberProps {
  number: number;
  status: "available" | "taken" | "selected";
  onClick: () => void;
}

export function RaffleNumber({ number, status, onClick }: RaffleNumberProps) {
  const isTaken = status === "taken";
  const isSelected = status === "selected";

  return (
    <motion.button
      whileHover={!isTaken ? { scale: 1.1, rotate: 3 } : {}}
      whileTap={!isTaken ? { scale: 0.95 } : {}}
      onClick={!isTaken ? onClick : undefined}
      className={cn(
        "relative flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold shadow-sm transition-colors",
        status === "available" && "bg-white text-foreground hover:bg-secondary/20 hover:text-secondary-foreground border-2 border-transparent hover:border-secondary",
        status === "taken" && "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
        status === "selected" && "bg-primary text-primary-foreground shadow-md scale-105 border-2 border-primary-foreground/20"
      )}
    >
      {isTaken ? (
        <Lock className="h-5 w-5 opacity-50" />
      ) : isSelected ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-primary rounded-2xl"
        >
          <Check className="h-6 w-6 text-white" />
        </motion.div>
      ) : (
        <span>{number}</span>
      )}
    </motion.button>
  );
}
