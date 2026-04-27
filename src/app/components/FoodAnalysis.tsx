import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Camera, Upload, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

interface NutritionData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

export function FoodAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setNutritionData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('กรุณาเลือกรูปภาพก่อน');
      return;
    }

    setIsAnalyzing(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/analyze-food`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            image: selectedImage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'การวิเคราะห์ล้มเหลว');
      }

      const data = await response.json();
      setNutritionData(data);
      toast.success('วิเคราะห์สำเร็จ!');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(`ข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalMacros = nutritionData 
    ? nutritionData.protein + nutritionData.carbs + nutritionData.fat 
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold text-green-600 ml-4">วิเคราะห์อาหาร</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>อัพโหลดรูปอาหาร</CardTitle>
              <CardDescription>
                เลือกรูปอาหารที่ต้องการวิเคราะห์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Selected food"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    เลือกรูปใหม่
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังวิเคราะห์...
                      </>
                    ) : (
                      'วิเคราะห์อาหาร'
                    )}
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-green-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-sm text-gray-400 mt-2">
                    รองรับไฟล์ JPG, PNG
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ผลการวิเคราะห์</CardTitle>
              <CardDescription>
                ข้อมูลโภชนาการของอาหาร
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nutritionData ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {nutritionData.foodName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {nutritionData.description}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">แคลอรี่ทั้งหมด</p>
                      <p className="text-4xl font-bold text-green-600">
                        {nutritionData.calories}
                      </p>
                      <p className="text-sm text-gray-600">kcal</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">โปรตีน</span>
                        <span className="text-sm font-bold text-blue-600">
                          {nutritionData.protein}g
                        </span>
                      </div>
                      <Progress 
                        value={(nutritionData.protein / totalMacros) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">คาร์โบไฮเดรต</span>
                        <span className="text-sm font-bold text-orange-600">
                          {nutritionData.carbs}g
                        </span>
                      </div>
                      <Progress 
                        value={(nutritionData.carbs / totalMacros) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">ไขมัน</span>
                        <span className="text-sm font-bold text-purple-600">
                          {nutritionData.fat}g
                        </span>
                      </div>
                      <Progress 
                        value={(nutritionData.fat / totalMacros) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>อัพโหลดรูปอาหารเพื่อเริ่มวิเคราะห์</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}