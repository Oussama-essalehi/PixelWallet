-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
-- Parent profiles table
CREATE TABLE IF NOT EXISTS parent_profiles (
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
CREATE TABLE IF NOT EXISTS child_accounts (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

-- Recharges table
CREATE TABLE recharges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE,
    child_account_id UUID REFERENCES child_accounts(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Game requests table
CREATE TABLE game_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_account_id UUID REFERENCES child_accounts(id) ON DELETE CASCADE,
    game_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Purchase history table
CREATE TABLE purchase_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_account_id UUID REFERENCES child_accounts(id) ON DELETE CASCADE,
    game_name TEXT NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    merchant TEXT NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Spending limits table
CREATE TABLE spending_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_account_id UUID REFERENCES child_accounts(id) ON DELETE CASCADE,
    daily_limit DECIMAL(10,2) NOT NULL,
    weekly_limit DECIMAL(10,2) NOT NULL,
    monthly_limit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Game purchases table
CREATE TABLE game_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_account_id UUID REFERENCES child_accounts(id) ON DELETE CASCADE,
    game_name TEXT NOT NULL,
    category TEXT NOT NULL,
    age_restriction TEXT NOT NULL,
    merchant TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    platform TEXT,
    description TEXT,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Policies, triggers, and functions
-- Policies for parent_profiles
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
    ON parent_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON parent_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON parent_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON parent_profiles TO authenticated;

-- Policies for child_accounts
ALTER TABLE child_accounts ENABLE ROW LEVEL SECURITY;
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

-- Policies for recharges
ALTER TABLE recharges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their recharges"
    ON recharges FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can view their own recharges" 
ON recharges 
FOR SELECT 
USING (
    parent_id IN (
        SELECT id 
        FROM parent_profiles 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Parents can insert recharges for their children" 
ON recharges
FOR INSERT 
WITH CHECK (
    -- Verify that the parent_id matches the authenticated user's parent profile
    parent_id IN (
        SELECT id 
        FROM parent_profiles 
        WHERE user_id = auth.uid()
    )
);


-- Policies for game_requests
ALTER TABLE game_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Children can view their game requests"
    ON game_requests FOR SELECT
    USING (child_account_id IN (SELECT id FROM child_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Parents can approve or reject game requests"
    ON game_requests FOR UPDATE
    USING (child_account_id IN (SELECT id FROM child_accounts WHERE parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid())));

-- Policies for purchase_history
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Children can view their purchase history"
    ON purchase_history FOR SELECT
    USING (child_account_id IN (SELECT id FROM child_accounts WHERE user_id = auth.uid()));

-- Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their notifications"
    ON notifications FOR SELECT
    USING (parent_id = auth.uid());

-- Policies for spending_limits
ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view spending limits for their children"
    ON spending_limits FOR SELECT
    USING (child_account_id IN (SELECT id FROM child_accounts WHERE parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Parents can set spending limits for their children"
    ON spending_limits FOR INSERT
    WITH CHECK (child_account_id IN (SELECT id FROM child_accounts WHERE parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid())));

-- Policies for game_purchases
ALTER TABLE game_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for virtual_cards
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;
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

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parent_profiles_updated_at
    BEFORE UPDATE ON parent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_accounts_updated_at
    BEFORE UPDATE ON child_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_child_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE child_accounts
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.child_account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_after_recharge
AFTER INSERT OR UPDATE ON recharges
FOR EACH ROW
EXECUTE FUNCTION update_child_account_balance();

CREATE OR REPLACE FUNCTION update_child_balance_after_game_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE child_accounts
  SET current_balance = current_balance - NEW.amount
  WHERE id = NEW.child_account_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check parent access
CREATE OR REPLACE FUNCTION is_parent_of_child(child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM child_accounts c
    WHERE 
      c.id = child_id 
      AND c.parent_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new policy that allows all authenticated users to view game purchases
CREATE POLICY "Parents can view game purchases" 
ON game_purchases 
FOR SELECT 
USING (true);

-- Ensure authenticated users have select permissions
GRANT SELECT ON game_purchases TO authenticated;

CREATE TRIGGER update_balance_trigger
AFTER INSERT ON game_purchases
FOR EACH ROW
EXECUTE FUNCTION update_child_balance_after_game_purchase();

-- Functions
-- Modifier le trigger pour mettre à jour child_accounts après la création de la carte
CREATE OR REPLACE FUNCTION create_virtual_card() 
RETURNS TRIGGER AS $$
BEGIN
  -- Créer la carte virtuelle
  INSERT INTO virtual_cards (child_account_id, card_number, expiry_date)
  VALUES (
    NEW.id,
    REPLACE(
      TO_CHAR(
        FLOOR(RANDOM() * 9999999999999999)::BIGINT,
        'FM9999999999999999'
      ),
      ' ', ''
    ),
    TO_CHAR(NOW() + INTERVAL '2 years', 'MM/YY')
  ) RETURNING id INTO NEW.virtual_card_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_virtual_card_trigger
  AFTER INSERT ON child_accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_virtual_card();

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

-- Indexes
CREATE INDEX idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX idx_child_accounts_parent_id ON child_accounts(parent_id);
CREATE INDEX idx_child_accounts_user_id ON child_accounts(user_id);
CREATE INDEX idx_transactions_child_account_id ON recharges(child_account_id);
CREATE INDEX idx_game_purchases_child_account ON game_purchases(child_account_id);
CREATE INDEX idx_game_purchases_purchase_date ON game_purchases(purchase_date);