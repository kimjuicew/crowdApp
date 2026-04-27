import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  availableTime: string;
  activityLevel: string;
}

export function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    weight: 0,
    height: 0,
    age: 0,
    gender: '',
    goal: '',
    availableTime: '',
    activityLevel: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e5c31e4c/profile`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileData(data.profile);
        }
      }
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      const response = await fetch(
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'บันทึกข้อมูลล้มเหลว');
      }

      toast.success('บันทึกข้อมูลสำเร็จ!');
    } catch (error: any) {
      console.error('Save profile error:', error);
      toast.error(`ข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold text-green-600 ml-4">ข้อมูลส่วนตัว</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>กรอกข้อมูลของคุณ</CardTitle>
            <CardDescription>
              ข้อมูลเหล่านี้จะช่วยให้ AI สร้างแผนที่เหมาะกับคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">อายุ (ปี)</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) =>
                    setProfileData({ ...profileData, age: Number(e.target.value) })
                  }
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">เพศ</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, gender: value })
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ชาย</SelectItem>
                    <SelectItem value="female">หญิง</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">เป้าหมาย</Label>
              <Select
                value={profileData.goal}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, goal: value })
                }
              >
                <SelectTrigger id="goal">
                  <SelectValue placeholder="เลือกเป้าหมาย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">ลดน้ำหนัก</SelectItem>
                  <SelectItem value="maintain">รักษาน้ำหนัก</SelectItem>
                  <SelectItem value="gain_muscle">เพิ่มกล้ามเนื้อ</SelectItem>
                  <SelectItem value="get_fit">สุขภาพแข็งแรง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">ระดับกิจกรรม</Label>
              <Select
                value={profileData.activityLevel}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, activityLevel: value })
                }
              >
                <SelectTrigger id="activityLevel">
                  <SelectValue placeholder="เลือกระดับกิจกรรม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">นั่งทำงานส่วนใหญ่</SelectItem>
                  <SelectItem value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</SelectItem>
                  <SelectItem value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</SelectItem>
                  <SelectItem value="active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</SelectItem>
                  <SelectItem value="very_active">ออกกำลังกายหนักมาก หรือทำงานหนัก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableTime">เวลาว่างต่อวัน (นาที)</Label>
              <Select
                value={profileData.availableTime}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, availableTime: value })
                }
              >
                <SelectTrigger id="availableTime">
                  <SelectValue placeholder="เลือกเวลาว่าง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15-30 นาที</SelectItem>
                  <SelectItem value="30">30-45 นาที</SelectItem>
                  <SelectItem value="45">45-60 นาที</SelectItem>
                  <SelectItem value="60">มากกว่า 60 นาที</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
