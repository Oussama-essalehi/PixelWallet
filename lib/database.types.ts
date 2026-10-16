export type GameCategory = 
  | 'adult'
  | 'violence'
  | 'horror'
  | 'gambling';

export type AgeRestriction = 
  | '+3'
  | '+7'
  | '+10'
  | '+12'
  | '+14'
  | '+16'
  | '+18';

export type GamePurchaseCategory = 
  | 'Horror' 
  | 'War' 
  | 'Strategy' 
  | 'Gambling' 
  | 'Adventure' 
  | 'RPG' 
  | 'Sports' 
  | 'Simulation'
  | 'Puzzle'
  | 'Action';

export interface Database {
  public: {
    Tables: {
      child_accounts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          balance: number;
          coins: number;
          monthly_allowance: number | null;
          spending_limit: number | null;
          parent_id: string;
          banned_categories: GameCategory[];
          age_restrictions: AgeRestriction[];
          max_daily_purchases?: number;
          max_weekly_purchases?: number;
          max_monthly_purchases?: number;
          max_purchase_amount?: number;
          max_monthly_spend?: number;
          birth_date?: string;
          virtual_card?: {
            stripe_card_id: string;
            stripe_cardholder_id: string;
            last4: string;
            brand: string;
            exp_month: number;
            exp_year: number;
            status: string;
            currency: string;
          }
        }
      };
      virtual_cards: {
        Row: {
          id: string;
          child_account_id: string;
          stripe_card_id: string;
          stripe_cardholder_id: string;
          last4: string;
          brand: string;
          exp_month: number;
          exp_year: number;
          status: string;
          currency: string;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          child_account_id: string;
          stripe_card_id: string;
          stripe_cardholder_id: string;
          last4: string;
          brand: string;
          exp_month: number;
          exp_year: number;
          status: string;
          currency: string;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          child_account_id?: string;
          stripe_card_id?: string;
          stripe_cardholder_id?: string;
          last4?: string;
          brand?: string;
          exp_month?: number;
          exp_year?: number;
          status?: string;
          currency?: string;
          updated_at?: string;
        }
      };
      game_purchases: {
        Row: {
          id: string;
          child_account_id: string;
          game_name: string;
          category: GamePurchaseCategory;
          age_restriction: AgeRestriction;
          merchant: string;
          amount: number;
          purchase_date: string;
          platform?: string;
          description?: string;
        }
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string;
          address_line1: string;
          address_line2?: string;
          city: string;
          state?: string;
          postal_code: string;
          country: string;
          created_at?: string;
          updated_at?: string;
        }
      };
      transactions: {
        Row: {
          id: string;
          child_account_id: string;
          amount: number;
          merchant_name: string;
          merchant_category: string;
          type: 'debit' | 'credit';
          created_at: string;
        }
      }
    }
  }
}
