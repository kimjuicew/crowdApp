import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, Dumbbell, User, LogOut, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      
      const accessToken = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      console.log('Token exists:', !!accessToken);
      console.log('User exists:', !!userStr);

      if (!accessToken || !userStr) {
        console.log('No valid session, redirecting to login');
        navigate('/');
        return;
      }

      const userData = JSON.parse(userStr);
      console.log('Valid session found for user:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">FitFood AI</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            สวัสดี, {user?.name || user?.username || 'ผู้ใช้'}!
          </h2>
          <p className="text-gray-600">เลือกฟีเจอร์ที่คุณต้องการใช้งาน</p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>แอปพร้อมใช้งาน!</strong> ตอนนี้แอปใช้ Mock Data (ข้อมูลตัวอย่าง) เพื่อให้คุณทดสอบฟีเจอร์ได้ทันที
            <br />• <strong>ต้องการ AI จริง?</strong> เพิ่ม <code className="bg-blue-100 px-1 rounded">OPENAI_API_KEY</code> ใน Supabase Edge Functions Settings
            <br />• <strong>Database:</strong> ต้องรันสคริปต์ <code className="bg-blue-100 px-1 rounded">database_setup_username.sql</code> ใน Supabase SQL Editor ก่อนใช้งาน
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/food-analysis')}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>วิเคราะห์อาหาร</CardTitle>
              <CardDescription>
                อัพโหลดรูปอาหารเพื่อดูแคลอรี่และโภชนาการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                เริ่มวิเคราะห์
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/profile')}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>
                กรอกน้ำหนัก เป้าหมาย และเวลาว่าง
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                จัดการข้อมูล
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/ai-plans')}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>แผน AI</CardTitle>
              <CardDescription>
                สร้าง Workout Plan และ Diet Plan ด้วย AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                สร้างแผน
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}