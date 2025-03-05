import { supabase } from './supabase';

export const calculateLevel = (xp: number) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const calculateLevelProgress = (xp: number) => {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * currentLevel * 100;
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  return (xpInCurrentLevel / xpNeededForNextLevel) * 100;
};

export const XP_ACTIONS = {
  DAILY_LOGIN: 50,
  COMPLETE_QUIZ: 100,
  COMPLETE_CHALLENGE: 200,
  MAINTAIN_BUDGET: 150,
  SAVINGS_GOAL: 300,
  QUIZ_COMPLETION: 100,
} as const;

export const awardXP = async (childAccountId: string, xpAmount: number, action: keyof typeof XP_ACTIONS) => {
  try {
    // Récupérer les données actuelles
    const { data: currentData, error: fetchError } = await supabase
      .from('user_progression')
      .select('total_xp, level')
      .eq('child_account_id', childAccountId)
      .single();

    if (fetchError) throw fetchError;

    const newTotalXP = (currentData?.total_xp || 0) + xpAmount;
    const currentLevel = calculateLevel(currentData?.total_xp || 0);
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > currentLevel;

    // Mettre à jour l'XP et le niveau
    const { error: updateError } = await supabase
      .from('user_progression')
      .update({
        total_xp: newTotalXP,
        level: newLevel,
        current_xp: newTotalXP
      })
      .eq('child_account_id', childAccountId);

    if (updateError) throw updateError;

    return { success: true, leveledUp, newLevel, newTotalXP };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false };
  }
};

export function calculateLevelFromXP(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
  let level = 1;
  let xpNeeded = 250; // XP needed for level 2
  let totalXPForCurrentLevel = 0;
  let remainingXP = xp;

  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    totalXPForCurrentLevel += xpNeeded;

    // Adjust XP needed for next level
    if (level < 5) {
      xpNeeded = 250; // 250 XP per level until level 5
    } else if (level < 10) {
      xpNeeded = 300; // 300 XP per level from 5 to 10
    } else if (level < 15) {
      xpNeeded = 350; // 350 XP per level from 10 to 15
    } else {
      xpNeeded = 400; // 400 XP per level after 15
    }
  }

  return {
    level,
    currentLevelXP: remainingXP,
    nextLevelXP: xpNeeded
  };
} 