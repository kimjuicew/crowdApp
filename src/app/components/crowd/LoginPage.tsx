import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Users, Shield, Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import { type UserRole } from '../../data/mockData';
import { motion } from 'motion/react';
import { supabase } from '../../../lib/supabase';

interface LoginPageProps {
  onLogin: (userId: string, role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');

    try {
      // Query user from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('role', selectedRole)
        .single();

      if (error || !data) {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        return;
      }

      onLogin(data.id, data.role as UserRole);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const handleSignUp = async () => {
    setError('');

    // Validate inputs
    if (!username || !password || !fullName || !email || !phone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        setError('ชื่อผู้ใช้นี้มีอยู่แล้ว');
        return;
      }

      // Create new user
      const newUserId = `user_${Date.now()}`;
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          username,
          password,
          role: selectedRole || 'user',
          full_name: fullName,
          email,
          phone,
          notifications: true,
          notify_when_empty: []
        })
        .select()
        .single();

      if (error) {
        console.error('Signup error:', error);
        setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
        return;
      }

      // Auto login
      onLogin(newUserId, (selectedRole || 'user') as UserRole);
      navigate((selectedRole || 'user') === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    try {
      // Get demo user from database
      const demoUsername = role === 'user' ? 'user' : 'admin';
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', demoUsername)
        .eq('role', role)
        .single();

      if (error || !data) {
        setError('ไม่พบผู้ใช้สำหรับทดลอง');
        return;
      }

      onLogin(data.id, data.role as UserRole);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Quick login error:', err);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F5' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-6"
        >
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-3 text-black"
            >
              CrowdWatch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600"
            >
              ระบบติดตามความหนาแน่นสถานที่แบบเรียลไทม์
            </motion.p>
          </div>

          <div className="space-y-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setSelectedRole('user')}
              className="w-full p-6 bg-white border-2 rounded-2xl hover:shadow-lg transition-all group"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl group-hover:opacity-90 transition-opacity" style={{ backgroundColor: '#F1EFE8' }}>
                  <Users className="w-8 h-8" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
                </div>
                <div className="text-left">
                  <div className="text-xl font-medium mb-1 text-black">ผู้ใช้งาน</div>
                  <div className="text-sm text-gray-500">
                    ตรวจสอบความหนาแน่นสถานที่ต่างๆ
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setSelectedRole('admin')}
              className="w-full p-6 bg-white border-2 rounded-2xl hover:shadow-lg transition-all group"
              style={{ borderColor: '#D3D1C7' }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl group-hover:opacity-90 transition-opacity" style={{ backgroundColor: '#F1EFE8' }}>
                  <Shield className="w-8 h-8" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
                </div>
                <div className="text-left">
                  <div className="text-xl font-medium mb-1 text-black">ผู้ดูแลระบบ</div>
                  <div className="text-sm text-gray-500">
                    จัดการและอัพเดทข้อมูลสถานที่
                  </div>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="minheight-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F5' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md px-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 border" style={{ borderColor: '#D3D1C7' }}>
          <button
            onClick={() => setSelectedRole(null)}
            className="text-sm text-gray-500 mb-6 transition-colors"
            style={{ color: '#6B4F3A' }}
          >
            ← กลับ
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl mb-4" style={{ backgroundColor: '#F1EFE8' }}>
              {selectedRole === 'user' ? (
                <Users className="w-8 h-8" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
              ) : (
                <Shield className="w-8 h-8" strokeWidth={1.5} style={{ color: '#6B4F3A' }} />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-black">
              {isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}{selectedRole === 'user' ? 'ผู้ใช้งาน' : 'ผู้ดูแล'}
            </h2>
            <p className="text-sm text-gray-500">
              {isSignUp ? 'สร้างบัญชีใหม่' : 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ backgroundColor: '#F1EFE8' }}>
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isSignUp ? 'text-white' : 'text-gray-600'
              }`}
              style={{ backgroundColor: !isSignUp ? '#6B4F3A' : 'transparent' }}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isSignUp ? 'text-white' : 'text-gray-600'
              }`}
              style={{ backgroundColor: isSignUp ? '#6B4F3A' : 'transparent' }}
            >
              สมัครสมาชิก
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="กรอกชื่อ-นามสกุล"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="กรอกอีเมล"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="กรอกเบอร์โทรศัพท์"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 mt-0.5"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </div>

          <Button
            onClick={isSignUp ? handleSignUp : handleLogin}
            className="w-full mb-4"
            style={{ backgroundColor: '#6B4F3A', color: '#FAF0E6' }}
          >
            {isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </Button>

          {!isSignUp && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#D3D1C7' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">หรือ</span>
                </div>
              </div>

              <Button
                onClick={() => handleQuickLogin(selectedRole)}
                variant="outline"
                className="w-full hover:bg-gray-50"
                style={{ borderColor: '#6B4F3A', color: '#6B4F3A' }}
              >
                ทดลองใช้งาน (Demo)
              </Button>

              <div className="mt-6 p-4 rounded-lg text-xs text-gray-600 border" style={{ backgroundColor: '#F1EFE8', borderColor: '#D3D1C7' }}>
                <div className="mb-2">ข้อมูลสำหรับทดสอบ:</div>
                {selectedRole === 'user' ? (
                  <div>
                    <div>ชื่อผู้ใช้: <span className="font-mono">user</span></div>
                    <div>รหัสผ่าน: <span className="font-mono">user123</span></div>
                  </div>
                ) : (
                  <div>
                    <div>ชื่อผู้ใช้: <span className="font-mono">admin</span></div>
                    <div>รหัสผ่าน: <span className="font-mono">admin123</span></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
