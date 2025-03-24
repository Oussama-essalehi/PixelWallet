import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { getCountryCode } from '@/lib/utils/countries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {  });

// Helper function to round to 2 decimal places
const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    const { sessionId } = requestBody;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Verify payment status
    if (session.payment_status !== 'paid') {
      console.error('Payment not successful:', session.payment_status);
      return NextResponse.json({ 
        success: false,
        error: 'Payment not successful'
      }, { status: 400 });
    }

    const childAccountId = session.metadata.childAccountId;
    const amount = roundToTwo(parseFloat(session.amount_total) / 100); // Convert from cents to euros

    // Get child account details
    const { data: childAccount, error: childError } = await supabase
      .from('child_accounts')
      .select('*')
      .eq('id', childAccountId)
      .single();

    if (childError || !childAccount) {
      console.error('Error fetching child account:', childError);
      throw new Error('Child account not found');
    }

    // Check if virtual card already exists
    const { data: existingCard, error: cardError } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('child_account_id', childAccountId)
      .single();

    if (cardError && cardError.code !== 'PGRST116') {
      throw cardError;
    }

    let cardDetails = existingCard;
    let virtualCardFee = 0;

    if (!existingCard) {
      // Fetch parent's information for new card creation
      const { data: parentData, error: parentError } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('id', childAccount.parent_id)
        .single();

      if (parentError || !parentData) throw new Error('Parent profile not found');

      // Create a cardholder in Stripe
      const cardholder = await stripe.issuing.cardholders.create({
        type: 'individual',
        name: `${childAccount.first_name} ${childAccount.last_name}`,
        email: childAccount.email,
        status: 'active',
        individual: {
          first_name: childAccount.first_name,
          last_name: childAccount.last_name,
          dob: {
            day: new Date(parentData.birth_date).getDate(),
            month: new Date(parentData.birth_date).getMonth() + 1,
            year: new Date(parentData.birth_date).getFullYear(),
          },
        },
        billing: {
          address: {
            line1: parentData.address,
            city: parentData.city,
            postal_code: parentData.postal_code,
            country: getCountryCode(parentData.country),
          },
        },
        phone_number: parentData.phone_number,
      });

      // Create a virtual card
      const card = await stripe.issuing.cards.create({
        cardholder: cardholder.id,
        currency: 'eur',
        type: 'virtual',
        status: 'active',
        spending_controls: {
          allowed_categories: ['digital_goods_games'],
          spending_limits: [
            {
              amount: parseFloat(childAccount.max_purchase_amount) * 100,
              interval: 'per_authorization'
            },
            {
              amount: parseFloat(childAccount.max_monthly_spend) * 100,
              interval: 'monthly'
            },
          ]
        }
      });

      // Store the card details
      const { data: newCard, error: insertError } = await supabase
        .from('virtual_cards')
        .insert({
          child_account_id: childAccount.id,
          stripe_card_id: card.id,
          stripe_cardholder_id: cardholder.id,
          last4: card.last4,
          brand: card.brand,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          status: card.status,
          currency: card.currency,
          balance: 0 
        })
        .select()
        .single();

      if (insertError) throw insertError;
      cardDetails = newCard;
      virtualCardFee = 0.1; // 0.1 euros for new virtual card
    }

    // Calculate fees
    const stripeFee = roundToTwo(Math.min(amount * 0.03, 2)) + 0.30; // 3% + 0.30€ with max 2 euros
    const pixelWalletFee = roundToTwo(amount * 0.01); // 1% 

    // Calculate final amount after fees
    const finalAmount = roundToTwo(amount - stripeFee - pixelWalletFee - virtualCardFee);

    console.log('Payment details:', {
      originalAmount: amount,
      stripeFee,
      pixelWalletFee,
      virtualCardFee,
      finalAmount
    });

    // Update virtual card balance
    const { error: updateError } = await supabase
      .from('virtual_cards')
      .update({
        balance: roundToTwo((cardDetails?.balance || 0) + finalAmount)
      })
      .eq('id', cardDetails?.id);

    if (updateError) {
      console.error('Error updating virtual card balance:', updateError);
      throw updateError;
    }

    // Store the recharge record
    const { error: rechargeError } = await supabase
      .from('recharges')
      .insert({
        child_account_id: childAccountId,
        parent_id: childAccount.parent_id,
        amount: finalAmount,
        status: 'completed',
        payment_method: 'Stripe'
      });

    if (rechargeError) throw rechargeError;

    return NextResponse.json({ 
      success: true,
      amount: roundToTwo(amount),
      fees: {
        stripe: roundToTwo(stripeFee),
        pixelWallet: roundToTwo(pixelWalletFee),
        virtualCard: roundToTwo(virtualCardFee)
      },
      finalAmount: roundToTwo(finalAmount)
    });

  } catch (error: any) {
    console.error('Error verifying payment. Full error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
      query: error.query, // For database errors
      params: error.params // For database errors
    });

    // If it's a database error, log the specific details
    if (error.code?.startsWith('42')) {
      console.error('Database error details:', {
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint
      });
    }

    return NextResponse.json({ 
      error: error.message,
      details: error.details,
      code: error.code
    }, { status: 500 });
  }
}
