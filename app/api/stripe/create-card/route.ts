import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { getCountryCode } from '@/lib/utils/countries';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { childAccount } = await req.json();

    // Fetch parent's information
    const { data: parentData, error: parentError } = await supabase
      .from('parent_profiles')
      .select('*')
      .eq('id', childAccount.parent_id)
      .single();

    if (parentError) throw parentError;
    if (!parentData) throw new Error('Parent profile not found');

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
          day: new Date(childAccount.birth_date).getDate(),
          month: new Date(childAccount.birth_date).getMonth() + 1,
          year: new Date(childAccount.birth_date).getFullYear(),
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

    // Create a virtual card for the cardholder
    const card = await stripe.issuing.cards.create({
      cardholder: cardholder.id,
      currency: 'eur',
      type: 'virtual',
      status: 'active',
      spending_controls: {
        spending_limits: [
          {
            amount: parseFloat(childAccount.max_purchase_amount) * 100, // Convert to cents
            interval: 'per_authorization'
          },
          {
            amount: parseFloat(childAccount.max_monthly_spend) * 100,
            interval: 'monthly'
          }
        ]
      }
    });

    // Calculate credited amount based on Stripe fees and conditions for first recharge
    const amount = parseFloat(childAccount.initial_amount); // Assuming initial_amount is the total amount paid by the user
    const stripeFeeStandard = (amount * 0.015) + 0.25; // Standard card fee
    const stripeFeePremium = (amount * 0.019) + 0.25; // Premium card fee
    let creditedAmount;
    const isFirstRecharge = true; // Assuming this is the first recharge

    if (isFirstRecharge) {
      // Deduct the card creation fee
      creditedAmount = amount - stripeFeeStandard - 0.10; // For standard cards
    } else {
      // Deduct only the Stripe fees and an additional 2%
      creditedAmount = amount - stripeFeeStandard - (amount * 0.02);
    }

    // Store the card details in your database
    const { error } = await supabase
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
        credited_amount: creditedAmount // Store the credited amount
      }).select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, card, creditedAmount });
  } catch (error: any) {
    console.error('Error creating Stripe card:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
