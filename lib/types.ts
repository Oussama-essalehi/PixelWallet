export interface ChildAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'M' | 'F';
  avatar_url?: string;
  balance: number;
  max_daily_purchases: number;
  max_monthly_spend: number;
  virtual_cards?: {
    stripe_card_id: string;
    stripe_cardholder_id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    status: string;
    currency: string;
    balance: number;
  };
}