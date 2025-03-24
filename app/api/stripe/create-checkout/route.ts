import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Helper function to round to 2 decimal places
const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export async function POST(req: Request) {
  try {
    const { childAccountId, amount } = await req.json();
    
    // Validate the amount (minimum 5 euros)
    const parsedAmount = roundToTwo(parseFloat(amount));
    if (isNaN(parsedAmount) || parsedAmount < 5) {
      throw new Error('Amount must be at least 5 euros');
    }

    // Get the user's information from the request headers
    const userHeader = req.headers.get('user');
    const user = userHeader ? JSON.parse(userHeader) : null;
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get parent profile
    const { data: parentProfile, error: parentError } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (parentError) {
      console.error('Error fetching parent profile:', parentError);
      throw new Error('Parent profile not found');
    }

    // Get child account details
    const { data: childAccount, error: childError } = await supabase
      .from('child_accounts')
      .select('*')
      .eq('id', childAccountId)
      .single();

    if (childError) {
      console.error('Error fetching child account:', childError);
      throw new Error('Child account not found');
    }

    // Check if child has a virtual card
    const { data: virtualCard, error: virtualCardError } = await supabase
      .from('virtual_cards')
      .select('id')
      .eq('child_account_id', childAccountId)
      .single();

    if (virtualCardError && virtualCardError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking virtual card:', virtualCardError);
      throw new Error('Error checking virtual card status');
    }

    // Calculate all fees
    const hasVirtualCard = !!virtualCard;
    
    // Virtual card creation fee (0.10€, only for first time)
    const virtualCardFee = hasVirtualCard ? 0 : 0.10; 
    
    // Stripe processing fee (3% + 0.30€ with maximum 2€)
    const stripeFee = roundToTwo(Math.min(parsedAmount * 0.03, 2)) + 0.30;
    
    // PixelWallet platform fee (1% of the amount)
    const platformFee = roundToTwo(parsedAmount * 0.01);
    
    // Calculate final amount that will be loaded to the card
    const totalFees = roundToTwo(virtualCardFee + stripeFee + platformFee);
    const finalAmount = roundToTwo(parsedAmount - totalFees);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Recharge compte de ${childAccount.first_name}`,
              description: `
                Montant initial: ${parsedAmount.toFixed(2)}€
                ${!hasVirtualCard ? '- Frais de création de carte virtuelle: ' + virtualCardFee.toFixed(2) + '€\n' : ''}
                - Frais Stripe (3% + 0.30€): ${stripeFee.toFixed(2)}€
                - Frais PixelWallet (1%): ${platformFee.toFixed(2)}€
                = Montant final crédité: ${finalAmount.toFixed(2)}€
              `.trim(),
            },
            unit_amount: Math.round(parsedAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/recharge/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/recharge/cancel`,
      metadata: {
        childAccountId,
        parentId: parentProfile.id,
        finalAmount: finalAmount.toString(),
        virtualCardFee: virtualCardFee.toString(),
        stripeFee: stripeFee.toString(),
        platformFee: platformFee.toString(),
        isFirstRecharge: (!hasVirtualCard).toString(),
      },
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      fees: {
        virtualCard: roundToTwo(virtualCardFee),
        stripe: roundToTwo(stripeFee),
        platform: roundToTwo(platformFee)
      },
      finalAmount: roundToTwo(finalAmount)
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
