import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Save
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface EditProfileProps {
  userId: string;
}

export function EditProfile({ userId }: EditProfileProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, phone')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error loading user:', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
        setLoading(false);
        return;
      }

      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName || !email || !phone) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          email: email,
          phone: phone
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึก');
        setSaving(false);
        return;
      }

      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => navigate('/profile'), 500);
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาด');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
      <header className="bg-white border-b" style={{ borderColor: '#D3D1C7' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-gray-700 hover:text-black"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black">แก้ไขโปรไฟล์</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border"
          style={{ borderColor: '#D3D1C7' }}
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#6B4F3A' }}
              >
                <User className="w-14 h-14" strokeWidth={1.5} style={{ color: '#FAF0E6' }} />
              </div>
              <button
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                style={{ backgroundColor: '#6B4F3A' }}
              >
                <Camera className="w-5 h-5" strokeWidth={1.5} style={{ color: '#FAF0E6' }} />
              </button>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-black">{fullName}</h2>
              <p className="text-sm text-gray-500 mt-1">บัญชีผู้ใช้งาน</p>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-12 h-14 text-base border"
                  style={{
                    borderColor: '#D3D1C7',
                    backgroundColor: '#F1EFE8'
                  }}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-base border"
                  style={{
                    borderColor: '#D3D1C7',
                    backgroundColor: '#F1EFE8'
                  }}
                  placeholder="กรอกอีเมล"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Phone className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12 h-14 text-base border"
                  style={{
                    borderColor: '#D3D1C7',
                    backgroundColor: '#F1EFE8'
                  }}
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 text-base font-medium"
              style={{
                backgroundColor: '#6B4F3A',
                color: '#FAF0E6',
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save className="w-5 h-5 mr-2" strokeWidth={1.5} />
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
