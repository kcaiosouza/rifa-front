import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApi } from "@/hooks/use-api";
import { timeAgo } from "@/lib/timeAgo";

interface Buyer {
  id: string;
  name: string;
  tickets: number;
  time: string;
  avatar?: string;
}

interface BuyersResponse {
  name: string;
  numbers: number[];
  created_at: string;
}

export function RecentBuyers() {
  const { request } = useApi();
  useEffect(() => {
    const fetchRecentBuyers = async () => {
      try {
        const response = await request("/rifas/recent-buyers");
        response.data.buyers.map((buyer: BuyersResponse) => {
          setBuyers(prevBuyers => [
            ...prevBuyers,
            {
              id: uuidv4(),
              name: buyer.name,
              tickets: buyer.numbers.length,
              time: timeAgo(new Date(buyer.created_at)),
              avatar: buyer.name.split(" ")[0].substring(0, 1) + (buyer.name.split(" ")[1]?.substring(0, 1) || "")
            }
          ]);
        });
      } catch (error) {
        toast.error("Erro ao buscar compradores recentes.");
        console.error("Erro ao buscar compradores recentes:", error);
      }
    }
    fetchRecentBuyers();
  }, []);

  const [buyers, setBuyers] = useState<Buyer[]>([]);

  return (
    <div className="w-full max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/60 shadow-sm">
      <h3 className="text-xl font-display text-foreground mb-4 text-center">Últimos Compradores ❤️</h3>
      <div className="space-y-3">
        {buyers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum comprador encontrado 😥!</p>
            <p className="text-muted-foreground">Que tal você ser o primeiro?</p>
          </div>
        )}
        {buyers.map((buyer, index) => (
          <motion.div
            key={buyer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-slate-50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-secondary/20 bg-secondary/10 text-secondary-foreground font-bold font-display">
                <AvatarFallback>{buyer.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm text-foreground">{buyer.name}</p>
                <p className="text-xs text-muted-foreground">Comprou {buyer.tickets} números</p>
              </div>
            </div>
            <span className="text-xs font-medium text-accent-foreground bg-accent/20 px-2 py-1 rounded-full">
              {buyer.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
