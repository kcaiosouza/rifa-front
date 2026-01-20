import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Shuffle, ShoppingCart, Calendar, Music, Sparkles, Check, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { cpf } from "cpf-cnpj-validator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { RaffleNumber } from "@/components/raffle/RaffleNumber";
import { RecentBuyers } from "@/components/raffle/RecentBuyers";
import { PixPayment } from "@/components/raffle/PixPayment";
import { PaymentSuccess } from "@/components/raffle/PaymentSuccess";
import { Footer } from "@/components/Footer";

import { useApi } from "@/hooks/use-api";

import prizeImage from "@assets/generated_images/jbl_go_4_speaker_and_headphones_prize_set.png";
import heroDecoration from "@assets/generated_images/baby_diapers_and_toys_composition.png";

// Mock Data Configuration
const TOTAL_NUMBERS = 5000;
const TICKET_PRICE = 5; // R$ 5,00

type CheckoutStep = "info" | "payment" | "success";

export default function Home() {
  
  const { request } = useApi();
  useEffect(() => {
    document.title = "Rifa do Bebê | Geane e Jó";
    
    const fetchTakenNumbers = async () => {
      try {
        const response = await request("/rifas/unavailable");
        const takenNumbers = new Set(response.data.unavailable as number[]);
        console.error(takenNumbers);
        setTakenNumbers(takenNumbers);
      } catch (error) {
        console.error("Error fetching taken numbers:", error);
      } finally {
        setLoadingNumbers(false);
      }
    };
    fetchTakenNumbers();
  }, []);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [takenNumbers, setTakenNumbers] = useState<Set<number>>(new Set());
  const [loadingNumbers, setLoadingNumbers] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [randomQuantity, setRandomQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("info");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpfValue, setCpfValue] = useState("");
  
  const cpfValid = cpfValue.trim() ? cpf.isValid(cpfValue) : null;

  // Filter Logic
  const filteredNumbers = useMemo(() => {
    let numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    if (showAvailableOnly) {
      numbers = numbers.filter(n => !takenNumbers.has(n));
    }
    return numbers;
  }, [showAvailableOnly]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredNumbers.length / itemsPerPage);
  const currentNumbers = filteredNumbers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const toggleNumber = (num: number) => {
    if (takenNumbers.has(num)) return;
    setSelectedNumbers(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleRandomPick = () => {
    const available = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1)
      .filter(n => !takenNumbers.has(n) && !selectedNumbers.includes(n));
    
    // Simple shuffle
    const shuffled = available.sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(randomQuantity, available.length));
    
    setSelectedNumbers(prev => [...prev, ...picked]);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Rifa do Bebê",
        text: "Ajude com as fraldas do bebê e concorra a prêmios!",
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para compartilhar!");
    }
  };

  const totalPrice = selectedNumbers.length * TICKET_PRICE;

  const isFormValid = name.trim() && phone.trim() && cpfValue.trim() && cpfValid === true;

  return (
    <>
      <div className="min-h-screen bg-background pb-20 font-body overflow-x-hidden">
        
        {/* Hero Section */}
        <section className="relative pt-12 pb-24 px-4 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/30 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6 text-center lg:text-left">
              <Badge className="bg-accent text-accent-foreground hover:bg-accent px-4 py-1 text-sm rounded-full mb-2 shadow-sm border-0">
                <Sparkles className="w-3 h-3 mr-2" /> Rifa Beneficente
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-[1.1]">
                Fraldas pro <span className="text-secondary">Bebê</span>, <br/>
                Prêmios pra <span className="text-primary">Você!</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Participe da nossa rifa solidária. Cada número comprado ajuda a garantir o conforto do nosso pequeno e você concorre a um kit de som incrível!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
                  <Calendar className="text-primary w-5 h-5" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Sorteio</p>
                    <p className="font-bold text-foreground">05 Julho 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
                  <Music className="text-secondary w-5 h-5" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Prêmio</p>
                    <p className="font-bold text-foreground">JBL GO Essential + Fones</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group perspective-1000">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative z-10"
              >
                  <div className="absolute -inset-4 bg-linear-to-tr from-secondary/40 to-primary/40 rounded-[3rem] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src={prizeImage} 
                    alt="JBL GO 4 and Headphones Prize" 
                    className="relative w-full max-w-md mx-auto rounded-[2.5rem] shadow-2xl border-4 border-white transform transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  
                  {/* Floating decoration */}
                  <img 
                    src={heroDecoration}
                    className="absolute -bottom-12 -left-12 w-32 h-32 lg:w-48 lg:h-48 drop-shadow-xl animate-bounce-slow"
                    alt="Diapers decoration"
                  />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Raffle Grid */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Controls */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-20">
              <div className="flex items-center gap-4">
                <Button 
                  variant={showAvailableOnly ? "default" : "outline"}
                  onClick={() => {
                    setShowAvailableOnly(!showAvailableOnly);
                    setCurrentPage(1);
                  }}
                  className={showAvailableOnly ? "bg-primary text-white hover:bg-primary/90 border-0" : "bg-white"}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showAvailableOnly ? "Mostrando Disponíveis" : "Mostrar Disponíveis"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setSelectedNumbers([]);
                    setCurrentPage(1);
                  }}
                >
                    <Trash className="w-4 h-4 mr-2" />
                    Limpar Seleção
                </Button>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <span className="text-sm font-bold text-muted-foreground px-2">Sorte:</span>
                <Input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={randomQuantity}
                  onChange={(e) => setRandomQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 h-9 bg-white border-slate-200 text-center rounded-lg"
                />
                <Button 
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-none rounded-lg"
                  onClick={handleRandomPick}
                >
                  <Shuffle className="w-4 h-4 mr-1" /> Escolher
                </Button>
              </div>
            </div>

            {/* Numbers Grid */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-125">
              {currentNumbers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <p className="text-xl font-display">Nenhum número encontrado :(</p>
                </div>
              ) : loadingNumbers ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <p className="text-xl font-display">Carregando números...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
                  <AnimatePresence mode="popLayout">
                    {currentNumbers.map((num) => (
                      <RaffleNumber 
                        key={num} 
                        number={num} 
                        status={takenNumbers.has(num) ? "taken" : selectedNumbers.includes(num) ? "selected" : "available"}
                        onClick={() => toggleNumber(num)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="w-10 h-10 rounded-xl font-bold transition-all bg-muted text-muted-foreground hover:bg-muted-foreground/60 cursor-pointer flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    key={currentPage}
                    className={`w-10 h-10 rounded-xl font-bold transition-all bg-foreground text-white scale-110 shadow-lg`}
                  >
                    {currentPage}
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="w-10 h-10 rounded-xl font-bold transition-all bg-muted text-muted-foreground hover:bg-muted-foreground/60 cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Recent Buyers & Info */}
          <div className="lg:col-span-4 space-y-6">
            <RecentBuyers />
            
            <div className="bg-accent/20 rounded-3xl p-6 border border-accent/30">
              <h3 className="text-xl font-display text-foreground mb-3 text-center">Sobre o Prêmio 🎁</h3>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0" />
                  <span>Caixa de Som JBL GO Essential</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0" />
                  <span>Fone Bluetooth Onistek TWS41</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-accent-foreground shrink-0" />
                  <span>Entrega gratuita para todo Brasil</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Floating Checkout Bar */}
        <AnimatePresence>
          {selectedNumbers.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center"
            >
              <div className="bg-foreground text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 max-w-lg w-full justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-white/60 font-bold uppercase tracking-wider">Total a Pagar</span>
                  <span className="text-2xl font-display font-bold">R$ {totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                      <p className="text-sm font-bold">{selectedNumbers.length} números</p>
                      <p className="text-xs text-white/60 truncate max-w-25">{selectedNumbers.join(", ")}</p>
                  </div>
                  
                  <Dialog 
                      open={isCheckoutOpen} 
                      onOpenChange={(open) => {
                        setIsCheckoutOpen(open);
                        if (!open) setCheckoutStep("info");
                      }}
                  >
                      <DialogTrigger asChild>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 shadow-lg border-2 border-white/10">
                          Finalizar <ShoppingCart className="ml-2 w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl overflow-hidden">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-display text-center">
                            {checkoutStep === "info" && "Seus Dados"}
                            {checkoutStep === "payment" && "Pagamento PIX"}
                            {checkoutStep === "success" && "Pronto!"}
                          </DialogTitle>
                          {checkoutStep !== "success" && (
                            <DialogDescription className="text-center">
                              Você escolheu {selectedNumbers.length} números da sorte! 🍀
                            </DialogDescription>
                          )}
                        </DialogHeader>

                        <div className="py-2">
                          {checkoutStep === "info" && (
                            <div className="space-y-4">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center max-h-52 overflow-y-auto">
                                <p className="text-sm text-muted-foreground mb-1">Seus Números</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                  {selectedNumbers.map(n => (
                                    <Badge key={n} variant="secondary" className="bg-white border border-slate-200 text-foreground text-lg w-10 h-10 flex items-center justify-center rounded-xl">
                                      {n}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3 pt-2">
                                <Input 
                                  placeholder="Seu Nome Completo" 
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="h-12 rounded-xl bg-slate-50 border-slate-200" 
                                />
                                <Input 
                                  placeholder="Seu WhatsApp / Telefone" 
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="h-12 rounded-xl bg-slate-50 border-slate-200" 
                                />
                                <div className="space-y-1">
                                  <Input 
                                    placeholder="Seu CPF" 
                                    value={cpfValue}
                                    onChange={(e) => setCpfValue(e.target.value)}
                                    className={`h-12 rounded-xl bg-slate-50 border-slate-200 ${
                                      cpfValid === true ? 'border-green-500' : 
                                      cpfValid === false ? 'border-red-500' : ''
                                    }`}
                                  />
                                  {cpfValid !== null && (
                                    <p className={`text-sm px-2 ${
                                      cpfValid ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {cpfValid ? '✓ CPF válido' : '✗ CPF inválido'}
                                    </p>
                                  )}
                                </div>
                                <div className="flex justify-between items-center px-4 py-2">
                                  <span className="text-lg font-bold text-muted-foreground">Total</span>
                                  <span className="text-3xl font-display font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
                                </div>
                                <Button 
                                  onClick={() => setCheckoutStep("payment")}
                                  disabled={!isFormValid}
                                  className="w-full h-12 rounded-xl text-lg font-bold bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  Pagar com PIX
                                </Button>
                              </div>
                            </div>
                          )}

                          {checkoutStep === "payment" && (
                            <PixPayment 
                              numbers={selectedNumbers}
                              fullName={name}
                              cpf={cpfValue}
                              phone={phone}
                              onConfirm={() => setCheckoutStep("success")}
                              onError={() => {setCheckoutStep("info"); setIsCheckoutOpen(false);}}
                            />
                          )}

                          {checkoutStep === "success" && (
                            <PaymentSuccess onShare={handleShare} />
                          )}
                        </div>
                      </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}
