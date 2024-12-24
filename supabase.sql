-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parent profiles table
CREATE TABLE parent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    birth_date DATE NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Child accounts table
CREATE TABLE child_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    birth_date DATE NOT NULL,
    banned_categories TEXT[] DEFAULT '{}',
    age_restrictions TEXT[] DEFAULT '{}',
    max_daily_purchases INTEGER NOT NULL,
    max_weekly_purchases INTEGER NOT NULL,
    max_monthly_purchases INTEGER NOT NULL,
    max_purchase_amount DECIMAL(10,2) NOT NULL,
    max_monthly_spend DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    virtual_card_id uuid REFERENCES virtual_cards(id) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_account_id UUID REFERENCES child_accounts(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create virtual_cards table
CREATE TABLE IF NOT EXISTS virtual_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_account_id uuid REFERENCES child_accounts(id) NOT NULL UNIQUE,
  card_number text NOT NULL,
  expiry_date text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;

-- Function to confirm a user's email
CREATE OR REPLACE FUNCTION confirm_user(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the anon role
GRANT EXECUTE ON FUNCTION confirm_user TO anon;

-- Create indexes for better query performance
CREATE INDEX idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX idx_child_accounts_parent_id ON child_accounts(parent_id);
CREATE INDEX idx_child_accounts_user_id ON child_accounts(user_id);
CREATE INDEX idx_transactions_child_account_id ON transactions(child_account_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_parent_profiles_updated_at
    BEFORE UPDATE ON parent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_accounts_updated_at
    BEFORE UPDATE ON child_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for parent_profiles
CREATE POLICY "Users can view their own profile"
    ON parent_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON parent_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON parent_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for child_accounts
CREATE POLICY "Parents can view their children's accounts"
    ON child_accounts FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM parent_profiles WHERE id = child_accounts.parent_id
        ) OR 
        auth.uid() = user_id
    );

CREATE POLICY "Parents can insert child accounts"
    ON child_accounts FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM parent_profiles WHERE id = child_accounts.parent_id
        )
    );

CREATE POLICY "Parents can update their children's accounts"
    ON child_accounts FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM parent_profiles WHERE id = child_accounts.parent_id
        )
    );

-- Policies for transactions
CREATE POLICY "Users can view their transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM child_accounts
            WHERE transactions.child_account_id = child_accounts.id
            AND (
                child_accounts.user_id = auth.uid() OR
                child_accounts.parent_id IN (
                    SELECT id FROM parent_profiles WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Add policies for virtual cards
CREATE POLICY "Users can view their own virtual cards"
  ON virtual_cards
  FOR SELECT
  TO authenticated
  USING (
    child_account_id IN (
      SELECT id FROM child_accounts 
      WHERE user_id = auth.uid()
      OR parent_id IN (
        SELECT id FROM parent_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add INSERT policy for virtual cards
CREATE POLICY "Allow virtual card creation for child accounts"
  ON virtual_cards
  FOR INSERT
  WITH CHECK (
    child_account_id IN (
      SELECT id FROM child_accounts 
      WHERE parent_id IN (
        SELECT id FROM parent_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create function to automatically create virtual card
CREATE OR REPLACE FUNCTION create_virtual_card()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO virtual_cards (child_account_id, card_number, expiry_date)
  VALUES (
    NEW.id,
    -- Generate a random 16-digit card number
    LPAD(FLOOR(RANDOM() * 10000000000000000)::TEXT, 16, '0'),
    -- Set expiry date to 2 years from now
    TO_CHAR(NOW() + INTERVAL '2 years', 'MM/YY')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create virtual card when child account is created
DROP TRIGGER IF EXISTS create_virtual_card_trigger ON child_accounts;
CREATE TRIGGER create_virtual_card_trigger
  AFTER INSERT ON child_accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_virtual_card();

CREATE OR REPLACE FUNCTION get_account_type(check_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    account_type TEXT;
BEGIN
    -- Check if user is a parent
    IF EXISTS (
        SELECT 1 FROM parent_profiles 
        WHERE parent_profiles.user_id = check_user_id
    ) THEN
        RETURN 'parent';
    END IF;
    
    -- Check if user is a child
    IF EXISTS (
        SELECT 1 FROM child_accounts 
        WHERE child_accounts.user_id = check_user_id
    ) THEN
        RETURN 'child';
    END IF;
    
    -- Si l'utilisateur n'est ni parent ni enfant
    -- probablement un nouveau compte parent qui n'a pas encore de profil
    RETURN 'new_parent';
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_account_type TO authenticated;

create or replace function search_users_by_email(search_email text)
returns table (
  id uuid,
  email text
)
language sql
security definer
as $$
  select au.id, au.email
  from auth.users au
  where 
    -- Case insensitive email search
    au.email ilike '%' || search_email || '%'
    -- Don't return the searching user
    and au.id != auth.uid()
  limit 10;
$$;

-- Grant access to authenticated users only
grant execute on function search_users_by_email to authenticated;

-- Modifier le trigger pour mettre à jour child_accounts après la création de la carte
CREATE OR REPLACE FUNCTION create_virtual_card() 
RETURNS TRIGGER AS $$
BEGIN
  -- Créer la carte virtuelle
  INSERT INTO virtual_cards (child_account_id, card_number, expiry_date)
  VALUES (
    NEW.id,
    LPAD(FLOOR(RANDOM() * 10000000000000000)::TEXT, 16, '0'),
    TO_CHAR(NOW() + INTERVAL '2 years', 'MM/YY')
  ) RETURNING id INTO NEW.virtual_card_id;
  
  -- Mettre à jour child_accounts avec l'ID de la carte
  UPDATE child_accounts 
  SET virtual_card_id = NEW.virtual_card_id
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;