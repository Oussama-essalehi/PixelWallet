import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { cardId } = await req.json();

    // Verify user authentication and authorization here
    const userHeader = req.headers.get('user');
    const user = userHeader ? JSON.parse(userHeader) : null;
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is parent or child
    const { data: parentProfile } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let virtualCard;
    let cardError;

    if (parentProfile) {
      // User is a parent - check access through child_accounts
      const response = await supabase
        .from('virtual_cards')
        .select(`
          *,
          child_accounts!inner(
            id,
            parent_id
          )
        `)
        .eq('stripe_card_id', cardId)
        .eq('child_accounts.parent_id', parentProfile.id)
        .single();
      
      virtualCard = response.data;
      cardError = response.error;
    } else {
      // User is a child - directly check virtual_cards
      const response = await supabase
        .from('virtual_cards')
        .select('*')
        .eq('stripe_card_id', cardId)
        .single();
      
      virtualCard = response.data;
      cardError = response.error;
    }

    if (cardError || !virtualCard) {
      console.log('Card access error:', cardError);
      throw new Error('Card not found or access denied');
    }

    // Get the full card details from Stripe
    const card = await stripe.issuing.cards.retrieve(cardId, {
      expand: ['number', 'cvc']
    });

    // Return sensitive data
    return NextResponse.json({
      cardNumber: card.number,
      cvc: card.cvc,
      last4: card.last4,
    });

  } catch (error: any) {
    console.error('Error retrieving card details:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 