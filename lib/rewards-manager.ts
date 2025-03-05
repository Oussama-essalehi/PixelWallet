import { supabase } from './supabase';

export const RANK_REWARDS = [
  {
    level: 2,
    title: "Débutant",
    icon: "GraduationCap",
    description: "A fait ses premiers pas dans le monde du gaming",
    rarity: "common"
  },
  {
    level: 4,
    title: "Novice",
    icon: "Sword",
    description: "Commence à maîtriser ses dépenses",
    rarity: "common"
  },
  {
    level: 6,
    title: "Apprenti",
    icon: "Book",
    description: "Sur la voie de la sagesse financière",
    rarity: "rare"
  },
  {
    level: 8,
    title: "Adepte",
    icon: "Shield",
    description: "Gère son budget avec habileté",
    rarity: "rare"
  },
  {
    level: 10,
    title: "Vétéran",
    icon: "Trophy",
    description: "Un exemple pour les autres gamers",
    rarity: "epic"
  },
  {
    level: 12,
    title: "Maître",
    icon: "Crown",
    description: "A atteint un niveau de maîtrise impressionnant",
    rarity: "epic"
  },
  {
    level: 14,
    title: "Expert",
    icon: "Star",
    description: "Une référence en matière de gestion financière",
    rarity: "epic"
  },
  {
    level: 16,
    title: "Champion",
    icon: "Medal",
    description: "Un champion de l'épargne et du gaming responsable",
    rarity: "legendary"
  },
  {
    level: 18,
    title: "Légende",
    icon: "Diamond",
    description: "Une légende vivante du gaming responsable",
    rarity: "legendary"
  },
  {
    level: 20,
    title: "Pixel Master",
    icon: "Crown",
    description: "Le plus haut rang atteignable",
    rarity: "legendary"
  }
] as const;

export const RARITY_COLORS = {
  common: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  rare: "bg-amber-100 text-amber-700 border border-amber-200",
  epic: "bg-purple-100 text-purple-700 border border-purple-200",
  legendary: "bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse"
} as const;

export async function checkAndAwardRankReward(childAccountId: string, level: number) {
  const reward = RANK_REWARDS.find(r => r.level === level);
  if (!reward) return null;

  try {
    // First check if user already has this rank
    const { data: existingUserReward } = await supabase
      .from('user_rewards')
      .select('id')
      .eq('child_account_id', childAccountId)
      .eq('reward_id', (await supabase
        .from('rewards')
        .select('id')
        .eq('title', reward.title)
        .single()
      ).data?.id)
      .single();

    // If user already has this reward, return null
    if (existingUserReward) return null;

    // Check if reward exists in rewards table
    const { data: existingReward } = await supabase
      .from('rewards')
      .select('id')
      .eq('title', reward.title)
      .single();

    let rewardId = existingReward?.id;

    // If reward doesn't exist in rewards table, create it
    if (!rewardId) {
      const { data: newReward, error: createError } = await supabase
        .from('rewards')
        .insert({
          title: reward.title,
          description: reward.description,
          type: 'badge',
          rarity: reward.rarity,
          unlock_condition: `Atteindre le niveau ${level}`,
          image_url: `/icons/${reward.icon.toLowerCase()}.svg`
        })
        .select('id')
        .single();

      if (createError) throw createError;
      rewardId = newReward.id;
    }

    // Award the reward to the user
    const { error: awardError } = await supabase
      .from('user_rewards')
      .insert({
        child_account_id: childAccountId,
        reward_id: rewardId,
        equipped: true
      });

    if (awardError) throw awardError;

    return reward;
  } catch (error) {
    console.error('Error awarding rank reward:', error);
    return null;
  }
} 