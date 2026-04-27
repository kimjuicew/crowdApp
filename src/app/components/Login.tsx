import { useState } from 'react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Apple, Dumbbell, Sparkles } from 'lucide-react';

interface ProfileData {
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  availableTime: string;
  activityLevel: string;
}

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'profile'>('auth');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    weight: 0,
    height: 0,
    age: 0,
    gender: '',
    goal: '',
    availableTime: '',
    activityLevel: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with username:', loginUsername);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            username: loginUsername,
            password: loginPassword,
          }),
        }
      );

      console.log('Login response status:', response.status);
      const result = await response.json();
      console.log('Login result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'เข้าสู่ระบบล้มเหลว');
      }

      // Store user data and token
      localStorage.setItem('access_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      console.log('Login successful, redirecting to dashboard');
      toast.success('เข้าสู่ระบบสำเร็จ!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`ข้อผิดพลาด: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      console.log('Attempting demo login...');
      
      // Try to login with demo account
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            username: 'demo',
            password: 'demo123',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // If demo account doesn't exist, create it
        console.log('Demo account not found, creating...');
        
        const signupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              username: 'demo',
              password: 'demo123',
              name: 'ผู้ใช้ทดสอบ',
            }),
          }
        );

        const signupResult = await signupResponse.json();

        if (!signupResponse.ok) {
          throw new Error('ไม่สามารถสร้าง Demo Account ได้');
        }

        // Store demo user data
        localStorage.setItem('access_token', signupResult.token);
        localStorage.setItem('user', JSON.stringify(signupResult.user));
        
        toast.success('สร้าง Demo Account สำเร็จ! กำลังไปยังหน้าโปรไฟล์...');
        setStep('profile');
        return;
      }

      // Login successful
      localStorage.setItem('access_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      toast.success('เข้าสู่ระบบ Demo สำเร็จ!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error(`ข้อผิดพลาด: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting signup with email:', signupUsername);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            username: signupUsername,
            password: signupPassword,
            name: signupName,
          }),
        }
      );

      console.log('Signup response status:', response.status);
      const result = await response.json();
      console.log('Signup result:', result);

      if (!response.ok) {
        const errorMsg = result.error || 'การสมัครสมาชิกล้มเหลว';
        
        // ถ้าเป็น User already exists แนะนำให้ login แทน
        if (result.code === 'USER_EXISTS' || errorMsg.includes('ถูกใช้งานแล้ว') || errorMsg.includes('already been registered')) {
          toast.error(errorMsg);
          // เปลี่ยนไป tab login อัตโนมัติ
          const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
          if (loginTab) loginTab.click();
          setIsLoading(false);
          return;
        }
        
        throw new Error(errorMsg);
      }

      toast.success('สมัครสมาชิกสำเร็จ!');
      
      // Store user data from signup response
      localStorage.setItem('access_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      console.log('Auto-login successful, moving to profile');
      
      // Move to profile step
      toast.success('กรอกข้อมูลส่วนตัวของคุณ');
      setStep('profile');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(`ข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      console.log('=== PROFILE SAVE START ===');
      console.log('Profile data:', profileData);
      console.log('Access token:', accessToken);
      console.log('Project ID:', projectId);
      console.log('API URL:', `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/profile`);
      
      if (!accessToken) {
        throw new Error('ไม่พบ access token กรุณาเข้าสู่ระบบใหม่');
      }

      let response;
      try {
        response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/profile`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(profileData),
          }
        );
        console.log('✓ Fetch completed');
      } catch (fetchError: any) {
        console.error('✗ Fetch failed:', fetchError);
        throw new Error(`ไม่สามารถเชื่อมต่อ API: ${fetchError.message}`);
      }

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let responseText;
      try {
        responseText = await response.text();
        console.log('Response text:', responseText);
      } catch (textError: any) {
        console.error('✗ Failed to read response:', textError);
        throw new Error('ไม่สามารถอ่านข้อมูลจาก server ได้');
      }
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Response data:', responseData);
      } catch (parseError: any) {
        console.error('✗ Failed to parse JSON:', parseError);
        throw new Error(`Server ตอบกลับไม่ถูกต้อง: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('✗ Response not OK');
        throw new Error(responseData.error || `เกิดข้อผิดพลาด (${response.status})`);
      }

      console.log('✓ Profile saved successfully');
      toast.success('บันทึกข้อมูลสำเร็จ!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('=== PROFILE SAVE ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error(`ไม่สามารถบันทึกข้อมูลได้: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show profile form if on profile step
  if (step === 'profile') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              <Apple className="w-10 h-10 text-green-600" />
              <Dumbbell className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold">กรอกข้อมูลของคุณ</CardTitle>
            <CardDescription>
              ข้อมูลเหล่านี้จะช่วยให้ AI สร้างแผนที่เหมาะกับคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">น้ำหนัก (กก.)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profileData.weight || ''}
                    onChange={(e) =>
                      setProfileData({ ...profileData, weight: Number(e.target.value) })
                    }
                    placeholder="70"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">ส่วนสูง (ซม.)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profileData.height || ''}
                    onChange={(e) =>
                      setProfileData({ ...profileData, height: Number(e.target.value) })
                    }
                    placeholder="170"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">อาย (ปี)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileData.age || ''}
                    onChange={(e) =>
                      setProfileData({ ...profileData, age: Number(e.target.value) })
                    }
                    placeholder="25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">เพศ</Label>
                  <select
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                    required
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">เป้าหมาย</Label>
                <select
                  id="goal"
                  value={profileData.goal}
                  onChange={(e) =>
                    setProfileData({ ...profileData, goal: e.target.value })
                  }
                  required
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                >
                  <option value="">เลือกเป้าหมาย</option>
                  <option value="lose_weight">ลดน้ำหนัก</option>
                  <option value="maintain">รักษาน้ำหนัก</option>
                  <option value="gain_muscle">เพิ่มกล้ามเนื้อ</option>
                  <option value="get_fit">สุขภาพแข็งแรง</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel">ระดับกิจกรรม</Label>
                <select
                  id="activityLevel"
                  value={profileData.activityLevel}
                  onChange={(e) =>
                    setProfileData({ ...profileData, activityLevel: e.target.value })
                  }
                  required
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                >
                  <option value="">เลือกระดับกิจกรรม</option>
                  <option value="sedentary">นั่งทำงานส่วนใหญ่</option>
                  <option value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</option>
                  <option value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</option>
                  <option value="active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</option>
                  <option value="very_active">ออกกำลังกายหนักมาก หรือทำงานหนัก</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableTime">เวลาว่างต่อวัน (นาที)</Label>
                <select
                  id="availableTime"
                  value={profileData.availableTime}
                  onChange={(e) =>
                    setProfileData({ ...profileData, availableTime: e.target.value })
                  }
                  required
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                >
                  <option value="">เลือกเวลาว่าง</option>
                  <option value="15">15-30 นาที</option>
                  <option value="30">30-45 นาที</option>
                  <option value="45">45-60 นาที</option>
                  <option value="60">มากกว่า 60 นาที</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกและเริ่มใช้งาน'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            <Apple className="w-10 h-10 text-green-600" />
            <Dumbbell className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold">FitFood AI</CardTitle>
          <CardDescription>
            วิเคราะห์อาหารและวางแผนออกกำลังกายด้วย AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">ชื่อผู้ใช้</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">รหัสผ่าน</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">หรือ</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 hover:text-white" 
                  onClick={handleDemoLogin} 
                  disabled={isLoading}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'ทดลองใช้งาน Demo'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">ชื่อ</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="ชื่อของคุณ"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">ชื่อผู้ใช้</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">รหัสผ่าน</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}