import { useEffect, useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";

interface PixPaymentProps {
  fullName: string;
  cpf: string;
  phone: string;
  numbers: number[];
  onConfirm: () => void;
  onError: () => void;
}

export function PixPayment({ fullName, cpf, phone, numbers, onConfirm }: PixPaymentProps) {
  const { request, loading, error } = useApi();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = numbers.length * 5;

  useEffect(() => {
    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanPhone = phone.replace(/\D/g, "");

    const createPixCob = async () => {
      try {
        const response = await request("/payment", {
          method: "POST",
          data: {
            fullName,
            cpf: cleanCpf,
            phone: cleanPhone,
            numbers,
          },
        });
        setQrCode(response.data.qr_code);
        setPixCode(response.data.pix_copy_paste);
        setTransactionId(response.data.transaction_id);
      } catch (error) {
        toast.error("Erro ao gerar o código PIX. Tente novamente.");
      }
    };
    createPixCob();
  }, [fullName, cpf, phone, numbers, request]);

  useEffect(() => {
    if (transactionId) {
      intervalRef.current = setInterval(() => {
        checkAutoPaymentStatus();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [transactionId]);

  useEffect(() => {
    if (error) {
      console.error("Erro no pagamento PIX:", error);
    }
  }, [error]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const checkManualPaymentStatus = async () => {
    try {
      const response = await request(`/payment/${transactionId}`);
      if (response.data.status === "CONCLUIDA") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onConfirm();
      }
    } catch (error) {
      toast.error("Erro ao verificar o status do pagamento. Tente novamente.");
    }
  };

  const checkAutoPaymentStatus = async () => {
    if (transactionId === "") return;
    try {
      const response = await request(`/payment/${transactionId}`);
      if (response.data.status === "CONCLUIDA") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onConfirm();
      }
    } catch (error) {
      toast.error("Erro ao verificar o status do pagamento. Tente novamente.");
    }
  };

  return (
    <div className="py-4 space-y-6">
      { loading && !qrCode && !pixCode ? <div className="text-center text-sm text-muted-foreground">Carregando...</div> : (
        <>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
              {/* Placeholder for QR Code */}
              <div className="w-48 h-48 bg-slate-50 p-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
                <img src={qrCode} alt="QR Code PIX" className="object-cover" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor do PIX</p>
              <p className="text-3xl font-display font-bold text-primary">R$ {total.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Pix Copia e Cola</p>
            <div className="relative">
              <div className="bg-slate-50 p-4 pr-12 rounded-xl border border-slate-200 text-[10px] font-mono break-all line-clamp-2 text-slate-500">
                {pixCode}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={checkManualPaymentStatus}
              className="w-full h-14 rounded-xl text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
            >
              Já paguei!
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">
              Não confirmou o pagamento ainda? <span className="font-bold">Clique no botão acima.</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
