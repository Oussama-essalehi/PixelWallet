'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, XCircle, AlertCircle, Crown, Medal, Star, TrendingUp, Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { awardXP, XP_ACTIONS } from '@/lib/xp-manager';
import { toast } from '@/hooks/use-toast';
import { RANK_REWARDS, RARITY_COLORS } from '@/lib/rewards-manager';
import * as Icons from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  coins_reward: number;
  questions_count: number;
}

interface Question {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string;
}

interface QuizSectionProps {
  childAccountId: string;
}

// Mettre à jour le mapping des difficultés avec les couleurs de rareté
const DIFFICULTY_STYLES = {
  'Facile': RARITY_COLORS.common,
  'Intermédiaire': RARITY_COLORS.rare,
  'Difficile': RARITY_COLORS.legendary,
} as const;

export function QuizSection({ childAccountId }: QuizSectionProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchQuizzes();
    fetchCompletedQuizzes();
  }, []);

  async function fetchQuizzes() {
    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at');

    if (quizzesData) {
      // Récupérer le nombre de questions pour chaque quiz
      const quizzesWithCount = await Promise.all(
        quizzesData.map(async (quiz) => {
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id);
          
          return {
            ...quiz,
            questions_count: count || 0
          };
        })
      );
      setQuizzes(quizzesWithCount);
    }
  }

  async function fetchCompletedQuizzes() {
    const { data } = await supabase
      .from('user_quizzes')
      .select('quiz_id, score')
      .eq('child_account_id', childAccountId);
    
    if (data) {
      const completed = data.reduce((acc, quiz) => ({
        ...acc,
        [quiz.quiz_id]: quiz.score >= 2
      }), {});
      setCompletedQuizzes(completed);
    }
  }

  async function startQuiz(quiz: Quiz) {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id);
    
    if (data) {
      setQuestions(data);
      setSelectedQuiz(quiz);
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }

  async function handleAnswer(answer: string) {
    setSelectedAnswer(answer);
    setShowExplanation(true);

    const isCorrect = answer === questions[currentQuestionIndex].correct_answer;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Si c'est la dernière question
    if (currentQuestionIndex === questions.length - 1) {
      const finalScore = isCorrect ? correctAnswers + 1 : correctAnswers;
      const passed = finalScore >= 2;
      const status = passed ? 'passed' : 'failed';

      try {
        // Vérifier d'abord si le quiz a déjà été complété avec succès
        const { data: existingQuiz, error: fetchError } = await supabase
          .from('user_quizzes')
          .select('status')
          .eq('child_account_id', childAccountId)
          .eq('quiz_id', selectedQuiz?.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
          throw fetchError;
        }

        const alreadyPassed = existingQuiz?.status === 'passed';

        // Enregistrer le nouveau résultat du quiz avec upsert
        const { error: quizError } = await supabase
          .from('user_quizzes')
          .upsert({
            child_account_id: childAccountId,
            quiz_id: selectedQuiz?.id,
            score: finalScore,
            status: status,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'child_account_id,quiz_id',
            ignoreDuplicates: false
          });

        if (quizError) throw quizError;

        // N'attribuer XP et coins que si c'est la première réussite
        if (passed && !alreadyPassed) {
          // Attribuer XP
          const xpResult = await awardXP(childAccountId, questions.length * 100, 'COMPLETE_QUIZ');
          if (!xpResult) throw new Error('Failed to award XP');
          
          // Récupérer le nombre actuel de coins
          const { data: coinsData, error: coinsError } = await supabase
            .from('child_accounts')
            .select('coins')
            .eq('id', childAccountId)
            .single();

          if (coinsError) {
            console.error('Error fetching coins:', coinsError);
            throw coinsError;
          }

          // Mettre à jour les coins uniquement si le quiz est réussi
          const currentCoins = coinsData?.coins || 0;
          const newCoins = currentCoins + (selectedQuiz?.coins_reward || 0);

          const { error: updateError } = await supabase
            .from('child_accounts')
            .update({ coins: newCoins })
            .eq('id', childAccountId);

          if (updateError) throw updateError;

          toast({
            title: "Félicitations !",
            description: `Quiz réussi ! Vous avez gagné ${questions.length * 100} XP et ${selectedQuiz?.coins_reward} coins.`,
            variant: "default"
          });
        } else if (passed && alreadyPassed) {
          toast({
            title: "Quiz réussi !",
            description: "Vous aviez déjà complété ce quiz avec succès. Pas de récompense supplémentaire.",
            variant: "default"
          });
        } else {
          toast({
            title: "Quiz terminé",
            description: "Vous n'avez pas obtenu assez de bonnes réponses. Réessayez pour gagner des récompenses !",
            variant: "default"
          });
        }

        // Rafraîchir les données
        await Promise.all([
          fetchQuizzes(),
          fetchCompletedQuizzes()
        ]);

      } catch (error: any) {
        console.error('Error updating quiz completion:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour du quiz. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setSelectedQuiz(null);
    }
  }

  // Fonction pour traduire la difficulté
  const translateDifficulty = (difficulty: string) => {
    const translations: Record<string, string> = {
      'easy': 'Facile',
      'medium': 'Intermédiaire',
      'hard': 'Difficile'
    };
    return translations[difficulty.toLowerCase()] || difficulty;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-indigo-700">Centre d'Apprentissage</h2>
            <p className="text-sm text-gray-500">Relevez des défis, gagnez des récompenses !</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" strokeWidth={2} />
          Voir tous les défis
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <Card 
            key={quiz.id} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={() => startQuiz(quiz)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">{quiz.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary"
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${DIFFICULTY_STYLES[translateDifficulty(quiz.difficulty) as keyof typeof DIFFICULTY_STYLES]}`}
                    >
                      {quiz.difficulty === 'Difficile' ? (
                        <Crown className="h-4 w-4" />
                      ) : quiz.difficulty === 'Intermédiaire' ? (
                        <Medal className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                      <span>{translateDifficulty(quiz.difficulty)}</span>
                    </Badge>
                    <Badge variant="secondary" className={`flex items-center gap-2 px-3 py-1 rounded-full ${RARITY_COLORS.epic}`}>
                      <TrendingUp className="h-4 w-4" />
                      <span>{quiz.questions_count * 100} XP</span>
                    </Badge>
                    <Badge variant="secondary" className={`flex items-center gap-2 px-3 py-1 rounded-full ${RARITY_COLORS.rare}`}>
                      <Coins className="h-4 w-4" />
                      <span>{quiz.coins_reward} coins</span>
                    </Badge>
                  </div>
                </div>
                {completedQuizzes[quiz.id] ? (
                  <Badge className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit shadow-sm ${RARITY_COLORS.legendary}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-semibold">Complété</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit shadow-sm ${RARITY_COLORS.common}`}>
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold">Nouveau</span>
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={selectedQuiz !== null} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          
          {questions[currentQuestionIndex] && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
                <span>{selectedQuiz?.xp_reward} XP à gagner</span>
              </div>

              <p className="text-lg font-medium">{questions[currentQuestionIndex].question}</p>
              
              <div className="space-y-3">
                {[
                  questions[currentQuestionIndex].correct_answer,
                  ...questions[currentQuestionIndex].wrong_answers
                ]
                .sort(() => Math.random() - 0.5)
                .map((answer) => (
                  <Button
                    key={answer}
                    variant="outline"
                    className={`w-full justify-between px-4 py-6 text-left hover:bg-gray-50 ${
                      selectedAnswer && (
                        answer === questions[currentQuestionIndex].correct_answer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : selectedAnswer === answer
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'opacity-50'
                      )
                    }`}
                    onClick={() => !selectedAnswer && handleAnswer(answer)}
                    disabled={!!selectedAnswer}
                  >
                    <span>{answer}</span>
                    {selectedAnswer && (
                      answer === questions[currentQuestionIndex].correct_answer
                        ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                        : selectedAnswer === answer
                          ? <XCircle className="h-5 w-5 text-red-600" />
                          : null
                    )}
                  </Button>
                ))}
              </div>

              {showExplanation && (
                <div className={`p-4 rounded-lg ${
                  selectedAnswer === questions[currentQuestionIndex].correct_answer
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === questions[currentQuestionIndex].correct_answer ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Bonne réponse !</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-800">Pas tout à fait...</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm">{questions[currentQuestionIndex].explanation}</p>
                </div>
              )}

              {selectedAnswer && (
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={nextQuestion}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Terminer le quiz' : 'Question suivante'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 