import { useState } from 'react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Sparkles, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

interface WorkoutPlan {
  title: string;
  description: string;
  schedule: Array<{
    day: string;
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      rest: string;
    }>;
  }>;
  tips: string[];
}

interface DietPlan {
  title: string;
  description: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Array<{
    mealType: string;
    time: string;
    foods: string[];
    calories: number;
  }>;
  tips: string[];
}

export function AIPlans() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  const generatePlans = async () => {
    setIsGenerating(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/generate-plans`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'สร้างแผนล้มเหลว');
      }

      const data = await response.json();
      setWorkoutPlan(data.workoutPlan);
      setDietPlan(data.dietPlan);
      toast.success('สร้างแผนสำเร็จ!');
    } catch (error: any) {
      console.error('Generate plans error:', error);
      toast.error(`ข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <h1 className="text-2xl font-bold text-green-600 ml-4">แผน AI</h1>
          </div>
          <Button onClick={generatePlans} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังสร้างแผน...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                สร้างแผนด้วย AI
              </>
            )}
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!workoutPlan && !dietPlan ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold mb-2">สร้างแผนส่วนตัวด้วย AI</h2>
              <p className="text-gray-600 mb-6">
                AI จะสร้าง Workout Plan และ Diet Plan ที่เหมาะกับคุณ
                <br />
                โดยใช้ข้อมูลจากโปรไฟล์ของคุณ
              </p>
              <Button size="lg" onClick={generatePlans} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังสร้างแผน...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    เริ่มสร้างแผน
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="workout" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workout">Workout Plan</TabsTrigger>
              <TabsTrigger value="diet">Diet Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="workout" className="space-y-4">
              {workoutPlan && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{workoutPlan.title}</CardTitle>
                      <CardDescription>{workoutPlan.description}</CardDescription>
                    </CardHeader>
                  </Card>

                  {workoutPlan.schedule.map((day, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{day.day}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {day.exercises.map((exercise, exIndex) => (
                            <div
                              key={exIndex}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{exercise.name}</p>
                                <p className="text-sm text-gray-600">
                                  {exercise.sets} sets × {exercise.reps} reps
                                </p>
                              </div>
                              <div className="text-sm text-gray-500">
                                พัก {exercise.rest}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {workoutPlan.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="diet" className="space-y-4">
              {dietPlan && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{dietPlan.title}</CardTitle>
                      <CardDescription>{dietPlan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">แคลอรี่/วัน</p>
                          <p className="text-2xl font-bold text-green-600">
                            {dietPlan.dailyCalories}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">โปรตีน</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dietPlan.macros.protein}g
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">คาร์บ</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {dietPlan.macros.carbs}g
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-600">ไขมัน</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {dietPlan.macros.fat}g
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {dietPlan.meals.map((meal, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">{meal.mealType}</CardTitle>
                            <CardDescription>{meal.time}</CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">แคลอรี่</p>
                            <p className="text-lg font-bold text-green-600">
                              {meal.calories} kcal
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {meal.foods.map((food, foodIndex) => (
                            <li key={foodIndex} className="flex items-center">
                              <span className="text-green-600 mr-2">✓</span>
                              <span>{food}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {dietPlan.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}