import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Trophy, Play, RefreshCw, ArrowDown, Sparkles } from "lucide-react";

import Confetti from 'react-confetti-boom';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface Client {
  name: string;
  cpf: string;
  phone: string;
}
interface PurchasedNumber {
  number: number;
  client: Client;
}

const DURATION = 3; // 60 seconds total
const ITEM_WIDTH = 80; // Each number cell is 80px

export default function Draw() {
  function cryptoRandomInt(maxExclusive: number) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive integer");
  }

  const u32 = new Uint32Array(1);
  const max = 0x100000000; // 2^32
  const limit = Math.floor(max / maxExclusive) * maxExclusive;

  let x = 0;
  do {
    globalThis.crypto.getRandomValues(u32);
    x = u32[0];
  } while (x >= limit);

  return x % maxExclusive;
}

  const { request } = useApi();
  useEffect(() => {
    document.title = "Sorteio | Rifa do Bebê";
    const fetchTakenNumbers = async () => {
      try {
        const response = await request("/rifas/sold");
        response.data.sold.map((numberObj: PurchasedNumber) => {
          setPurchasedNumbers((prev: PurchasedNumber[]) => [...prev, numberObj]);
        })
      } catch (error) {
        toast.error("Erro ao buscar números comprados.");
        console.error("Erro ao buscar números:", error);
      }
    };
    fetchTakenNumbers();
  }, []);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<PurchasedNumber | null>(null);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumber[]>([]);
  const controls = useAnimation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // We duplicate the list many times to create a long strip for the roulette
  const rouletteItems = useMemo(() => {
    if (purchasedNumbers.length === 0) return [];
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push(...purchasedNumbers.sort(() => Math.random() - 0.5));
    }
    return items;
  }, [purchasedNumbers]);

  const startDraw = async () => {
    setIsSpinning(true);
    setWinner(null);
    setTimeLeft(DURATION);

    // Pick a random winner from the actual purchased numbers
    const finalWinner = purchasedNumbers[cryptoRandomInt(purchasedNumbers.length)];
    
    // Find a position for this winner near the end of our strip
    // We target an index far enough to ensure enough scrolling
    const targetIndex = rouletteItems.length - 30;
    rouletteItems[targetIndex] = finalWinner;

    // Timer logic for the UI display
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Calculate exact target position
    // We need to subtract half of ITEM_WIDTH because the container is centered at px-[50%]
    // The pointer is at the exact center of the container.
    // The items are appended from the left.
    // So to align item at targetIndex to the center, we move targetIndex * ITEM_WIDTH.
    const targetX = (targetIndex * ITEM_WIDTH) + (ITEM_WIDTH / 2);

    await controls.start({
      x: -targetX,
      transition: { 
        duration: DURATION,
        ease: [0.1, 0, 0.1, 1], // Very long deceleration tail
      }
    });

    setWinner(finalWinner);
    setIsSpinning(false);
  };

  const reset = () => {
    setIsSpinning(false);
    setWinner(null);
    setTimeLeft(DURATION);
    controls.set({ x: 0 });
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-body flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/20 px-6 py-1 rounded-full text-sm font-bold border-0">
            <Sparkles className="w-4 h-4 mr-2" /> O GRANDE MOMENTO
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Sorteio do <span className="text-secondary">Prêmio</span></h1>
        </div>

        {/* Roulette Container */}
        <div className="relative">
          {/* Target Pointer */}
          <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20 text-primary">
            <ArrowDown className="w-10 h-10 fill-current animate-bounce" />
          </div>

          <Card className="relative h-32 bg-white/50 backdrop-blur-md border-4 border-white shadow-2xl rounded-[2rem] overflow-hidden">
            {/* Target Area Overlay (Pointer Guide) */}
            <div className="absolute inset-0 pointer-events-none z-10 flex justify-center">
              <div className="w-1 h-full bg-primary/40" />
            </div>

            {/* Moving Strip */}
            <motion.div
              animate={controls}
              initial={{ x: 0 }}
              className="flex items-center h-full px-[50%]"
              style={{ width: "max-content" }}
            >
              {rouletteItems.map((item, i) => (
                <div 
                  key={i}
                  className="w-20 h-20 flex items-center justify-center shrink-0 mx-0 text-2xl font-display font-bold border-r border-slate-100/50"
                >
                  <span className={i % 2 === 0 ? "text-primary" : "text-secondary"}>
                    {item.number}
                  </span>
                </div>
              ))}
            </motion.div>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {!isSpinning && !winner ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button 
                  size="lg" 
                  onClick={startDraw}
                  className="h-16 px-12 rounded-full text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                >
                  <Play className="mr-2 fill-current" /> Começar Sorteio
                </Button>
              </motion.div>
            ) : isSpinning ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <p className="text-2xl font-display font-bold text-muted-foreground animate-pulse">
                  Sorteando...
                </p>
                <div className="text-5xl font-display font-bold text-primary">
                  {timeLeft}s
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-accent relative">
                  <Trophy className="w-16 h-16 text-accent absolute -top-8 -left-8 -rotate-12 drop-shadow-lg" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Ganhador(a)!</p>
                  <h2 className="text-5xl font-display font-bold text-foreground mb-2">{winner?.client.name}</h2>
                  <p className="text-xl font-display font-bold italic text-primary">CPF {winner?.client.cpf}</p>
                  <p className="text-2xl font-display font-bold text-secondary">Número {winner?.number}</p>
                </div>
                <Confetti mode="boom" particleCount={70} colors={['#9eccfa', '#f589ad']} />
                <Button 
                  variant="outline" 
                  onClick={reset}
                  className="rounded-full h-12 px-8 border-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Novo Sorteio
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-8 opacity-50">
          <p className="text-sm font-medium">Quantidade de rifas compradas: {purchasedNumbers.length}</p>
        </div>
      </div>
    </div>
  );
}
