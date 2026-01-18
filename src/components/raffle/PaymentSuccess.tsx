import { motion } from "framer-motion";
import { CheckCircle2, Share2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  onShare: () => void;
}

export function PaymentSuccess({ onShare }: SuccessModalProps) {
  return (
    <div className="py-8 text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex justify-center"
      >
        <div className="relative">
          <CheckCircle2 className="w-24 h-24 text-green-500" />
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            className="absolute -top-2 -right-2"
          >
            <PartyPopper className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">Pagamento Confirmado!</h2>
        <p className="text-muted-foreground">
          Obrigado por ajudar com as fraldas do bebê! Seus números foram registrados com sucesso. Boa sorte! 🍀
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button 
          onClick={onShare}
          className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg"
        >
          Compartilhar Rifa <Share2 className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
