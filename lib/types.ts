export interface ChildAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  current_balance: number;
  max_daily_purchases: number;
  max_monthly_spend: number;
  virtual_cards?: {
    card_number: string;
    expiry_date: string;
  };
}