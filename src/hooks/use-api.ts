import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AxiosResponse | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const request = async (
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse> => {
    try {
      setLoading(true);
      setError(null);
      // @ts-ignore
      const response = await axios(url, {
        baseURL: import.meta.env.VITE_API_URL,
        ...config
      });
      setResponse(response);
      return response;
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.error || "Erro desconhecido, tente novamente mais tarde. se o erro persistir, contate o autor da rifa.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, response, request };
};