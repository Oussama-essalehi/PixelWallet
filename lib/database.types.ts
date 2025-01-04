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

export type AgeRestriction = 
  | '+18' 
  | '+16' 
  | '+12' 
  | '+10' 
  | 'All Ages';

export interface Database {
  public: {
    Tables: {
      child_accounts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          current_balance: number;
          monthly_allowance: number | null;
          spending_limit: number | null;
          parent_id: string;
          virtual_card?: {
            card_number: string;
            expiry_date: string;
          }
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
