export const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE ||
  "https://elhotvkkvbwxeuquqolc.supabase.co/functions/v1";

export const CREATE_PAYMENT_URL = `${FUNCTIONS_BASE}/create-ziina-payment`;