import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../ui/button';

export function DebugPanel() {
  const [dbLocations, setDbLocations] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('locations')
        .select('*')
        .order('id');

      if (dbError) {
        setError(`Database Error: ${dbError.message}`);
        console.error('Supabase error:', dbError);
      } else if (!data || data.length === 0) {
        setError('ตาราง locations ว่างเปล่า! ต้องรัน migration ก่อน');
      } else {
        setDbLocations(data);
        setError('');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border-2 border-red-500 p-4 z-50 max-h-[600px] overflow-y-auto">
      <h3 className="text-lg font-bold mb-3 text-red-600">🔍 Debug Panel</h3>

      <Button
        onClick={checkDatabase}
        disabled={loading}
        className="w-full mb-3 bg-blue-600"
      >
        {loading ? 'กำลังตรวจสอบ...' : '🔄 ตรวจสอบ Database'}
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded p-3 mb-3">
          <p className="text-red-700 text-sm font-bold">❌ {error}</p>
          {error.includes('ว่างเปล่า') && (
            <div className="mt-2 text-xs">
              <p className="font-bold">แก้ไข:</p>
              <ol className="list-decimal ml-4 mt-1">
                <li>ไปที่ Supabase SQL Editor</li>
                <li>รันไฟล์ 001_initial_schema_clean.sql</li>
                <li>Refresh หน้านี้</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {dbLocations.length > 0 && (
        <div className="bg-green-50 border border-green-300 rounded p-3 mb-3">
          <p className="text-green-700 font-bold">✅ Database เชื่อมต่อสำเร็จ!</p>
          <p className="text-sm text-gray-600 mt-1">
            พบ {dbLocations.length} สถานที่
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-bold text-sm">📊 ข้อมูลจาก Supabase:</h4>
        {dbLocations.map((loc) => (
          <div key={loc.id} className="bg-gray-50 p-2 rounded text-xs border">
            <div className="font-bold">{loc.name}</div>
            <div className="text-gray-600">
              จำนวนคน: <span className="font-bold text-blue-600">{loc.current_count}</span> / {loc.capacity}
            </div>
            <div className="text-gray-500">
              สถานะ: <span className="font-semibold">{loc.current_density}</span>
            </div>
            <div className="text-gray-400 text-[10px]">
              อัปเดต: {new Date(loc.updated_at).toLocaleString('th-TH')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
