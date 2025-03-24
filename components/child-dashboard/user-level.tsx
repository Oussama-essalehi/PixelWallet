'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Coins, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { calculateLevelFromXP } from '@/lib/xp-manager';
import { checkAndAwardRankReward, RANK_REWARDS, RARITY_COLORS } from '@/lib/rewards-manager';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

interface UserLevelProps {
  childAccountId: string;
}

interface UserProgress {
  level: number;
  current_xp: number;
  total_xp: number;
  daily_streak: number;
  coins?: number;
}

// Mettre à jour la configuration des icônes
const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 2 // Au lieu de stroke-width="2"
};

const getRankForLevel = (level: number) => {
  return [...RANK_REWARDS]
    .reverse()
    .find(rank => rank.level <= level) || RANK_REWARDS[0];
};

export function UserLevel({ childAccountId }: UserLevelProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [xp, setXP] = useState(0);
  const [currentRank, setCurrentRank] = useState<typeof RANK_REWARDS[number] | null>(null);
  const [previousLevel, setPreviousLevel] = useState<number>(() => {
    // Récupérer le niveau précédent du localStorage
    const storedLevel = localStorage.getItem(`previousLevel-${childAccountId}`);
    return storedLevel ? parseInt(storedLevel, 10) : 0;
  });
  
  const fetchProgress = async () => {
    const [progressData, coinsData] = await Promise.all([
      supabase
        .from('user_progression')
        .select('*')
        .eq('child_account_id', childAccountId)
        .single(),
      supabase
        .from('child_accounts')
        .select('coins')
        .eq('id', childAccountId)
        .single()
    ]);

    if (progressData.data) {
      setProgress(progressData.data);
    }
    if (coinsData.data) {
      setCoins(coinsData.data.coins || 0);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('user_progression')
        .select('current_xp, level')
        .eq('child_account_id', childAccountId)
        .single();
      
      if (data) {
        setXP(data.current_xp);
        const { level } = calculateLevelFromXP(data.current_xp);
        
        // Find highest earned rank
        const highestRank = [...RANK_REWARDS]
          .reverse()
          .find(rank => rank.level <= level);
        
        if (highestRank) {
          setCurrentRank(highestRank);
        }

        // Check for level up and new rank only if the level is higher than the stored level
        if (level > previousLevel) {
          // Mettre à jour le niveau dans le localStorage
          localStorage.setItem(`previousLevel-${childAccountId}`, level.toString());
          setPreviousLevel(level);
          
          // Only check for reward if we've leveled up
          const reward = await checkAndAwardRankReward(childAccountId, level);
          if (reward) {
            toast.success("Nouveau rang débloqué !", {
              description: `Vous avez atteint le rang de ${reward.title}`,
              duration: 5000,
            });
          }
        }
      }
    }
    
    fetchData();
  }, [childAccountId, previousLevel]);

  useEffect(() => {
    fetchProgress();
  }, [childAccountId]);

  useEffect(() => {
    const progressChannel = supabase
      .channel('user_progression_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_progression',
          filter: `child_account_id=eq.${childAccountId}`
        },
        (payload) => {
          setProgress(payload.new as UserProgress);
        }
      )
      .subscribe();

    const coinsChannel = supabase
      .channel('coins_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'child_accounts',
          filter: `id=eq.${childAccountId}`
        },
        (payload) => {
          setCoins(payload.new.coins || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(coinsChannel);
    };
  }, [childAccountId]);

  const { level, currentLevelXP, nextLevelXP } = calculateLevelFromXP(xp);
  const progressPercentage = (currentLevelXP / nextLevelXP) * 100;

  // Get the icon component for rank
  const RankIcon = currentRank ? Icons[currentRank.icon as keyof typeof Icons] : null;

  // Get the next rank
  const nextRank = RANK_REWARDS.find(rank => rank.level > level);

  return (
    <div className="space-y-4">
      {/* Current Rank Badge */}
      {currentRank && RankIcon && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit shadow-sm ${RARITY_COLORS[currentRank.rarity]}`}>
          <RankIcon {...iconProps} />
          <span className="font-semibold">{currentRank.title}</span>
          <span className="text-gray-500">|</span>
          <span className="text-sm">{currentRank.description}</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Trophy {...iconProps} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Niveau {level}</h3>
                  <p className="text-sm text-gray-500">
                    {currentLevelXP} / {nextLevelXP} XP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg">
                  <Coins {...iconProps} className="text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Coins</p>
                    <p className="text-lg font-bold text-yellow-700">{coins}</p>
                  </div>
                </div>
                {progress?.daily_streak > 0 && (
                  <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-lg">
                    <Flame {...iconProps} className="text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-orange-600">Série</p>
                      <p className="text-lg font-bold text-orange-700">
                        {progress.daily_streak} jours
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progression</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              {/* Next Rank Preview */}
              {nextRank && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full opacity-50 ${RARITY_COLORS[nextRank.rarity]}`}>
                    {/* Add lock icon */}
                    <Lock {...iconProps} />
                    {/* Get the next rank icon */}
                    {Icons[nextRank.icon as keyof typeof Icons] && 
                      React.createElement(Icons[nextRank.icon as keyof typeof Icons], {
                        ...iconProps
                      })
                    }
                    <span className="text-sm font-medium">{nextRank.title}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Prochain rang disponible au niveau {nextRank.level}
                    </p>
                    <p className="text-xs text-gray-500">{nextRank.description}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">XP Total</p>
                <p className="text-lg font-semibold">{progress?.total_xp}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Prochain niveau</p>
                <p className="text-lg font-semibold">{level + 1}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 