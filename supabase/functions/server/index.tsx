import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// Helper function to generate simple token
function generateToken(userId: string): string {
  return `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get user ID from token
async function getUserIdFromToken(token: string, supabase: any): Promise<string | null> {
  try {
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();
    
    if (!session) {
      return null;
    }
    
    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      return null;
    }
    
    return session.user_id;
  } catch (error) {
    return null;
  }
}

// Health check endpoint
app.get("/make-server-e5c31e4c/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint (ไม่ใช้ Supabase Auth)
app.post("/make-server-e5c31e4c/signup", async (c) => {
  try {
    const { username, password, name } = await c.req.json();

    console.log('Creating user with username:', username);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      console.log('Username already exists:', username);
      return c.json({ 
        error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น',
        code: 'USER_EXISTS'
      }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in users table
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        name,
      })
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Generate token
    const token = generateToken(newUser.id);

    // Store token in sessions table (optional)
    await supabase
      .from('sessions')
      .insert({
        user_id: newUser.id,
        token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    console.log('User created successfully:', newUser.id);
    
    return c.json({ 
      success: true, 
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
      },
      token,
    });
  } catch (error: any) {
    console.error('Signup error during user creation:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Login endpoint (ไม่ใช้ Supabase Auth)
app.post("/make-server-e5c31e4c/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    console.log('Login attempt with username:', username);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !user) {
      console.log('User not found:', username);
      return c.json({ 
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }, 401);
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    
    if (passwordHash !== user.password_hash) {
      console.log('Invalid password for username:', username);
      return c.json({ 
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      }, 401);
    }

    // Generate new token
    const token = generateToken(user.id);

    // Store token in sessions table
    await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    console.log('Login successful for user:', user.id);
    
    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Profile endpoints
app.get("/make-server-e5c31e4c/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user ID from token
    const userId = await getUserIdFromToken(accessToken, supabase);
    
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Get profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Get profile error:', profileError);
      return c.json({ error: profileError.message }, 500);
    }
    
    return c.json({ profile: profile || {} });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-e5c31e4c/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user ID from token
    const userId = await getUserIdFromToken(accessToken, supabase);
    
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const profileData = await c.req.json();
    
    console.log('Saving profile for user:', userId);
    console.log('Profile data:', profileData);
    
    // Upsert profile to database
    const { data, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        weight: profileData.weight,
        height: profileData.height,
        age: profileData.age,
        gender: profileData.gender,
        goal: profileData.goal,
        available_time: profileData.availableTime,
        activity_level: profileData.activityLevel,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select();
    
    if (upsertError) {
      console.error('Upsert profile error:', upsertError);
      return c.json({ error: upsertError.message }, 500);
    }
    
    console.log('Profile saved successfully:', data);
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error('Save profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Food analysis endpoint
app.post("/make-server-e5c31e4c/analyze-food", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    // Create client with user's access token for auth
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const { data: { user }, error } = await supabaseAuth.auth.getUser();
    
    if (!user || error) {
      console.error('Auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { image } = await c.req.json();

    // Check if OpenAI API key is available
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // If no OpenAI API key, return mock data
    if (!openaiApiKey) {
      console.log('Using mock data - OpenAI API key not configured');
      const mockData = {
        foodName: 'ข้าวผัดกุ้ง',
        calories: 520,
        protein: 18,
        carbs: 72,
        fat: 15,
        description: 'ข้าวผัดกุ้งพร้อมผักและไข่ดาว อาหารไทยยอดนิยมที่อุดมด้วยคาร์โบไฮเดรตและโปรตีน เหมาะสำหรับมื้อหลัก'
      };
      
      // Save to database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      
      await supabase.from('food_analysis').insert({
        user_id: user.id,
        food_name: mockData.foodName,
        calories: mockData.calories,
        protein: mockData.protein,
        carbs: mockData.carbs,
        fat: mockData.fat,
        description: mockData.description,
        image_url: 'mock_data',
      });
      
      return c.json(mockData);
    }

    // Use OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide nutrition information in Thai language. Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure: {"foodName": "ชื่ออาหาร", "calories": number, "protein": number, "carbs": number, "fat": number, "description": "คำอธิบาย"}. All text must be in Thai.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ error: 'Failed to analyze food image' }, 500);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return c.json({ error: 'No response from AI' }, 500);
    }

    // Parse the JSON response
    const nutritionData = JSON.parse(content.trim());

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    await supabase.from('food_analysis').insert({
      user_id: user.id,
      food_name: nutritionData.foodName,
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      carbs: nutritionData.carbs,
      fat: nutritionData.fat,
      description: nutritionData.description,
      image_url: image.substring(0, 100),
    });

    return c.json(nutritionData);
  } catch (error: any) {
    console.error('Food analysis error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate AI plans endpoint
app.post("/make-server-e5c31e4c/generate-plans", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    // Create client with user's access token for auth
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const { data: { user }, error } = await supabaseAuth.auth.getUser();
    
    if (!user || error) {
      console.error('Auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profileData) {
      return c.json({ error: 'Please complete your profile first' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // If no OpenAI API key, return mock data
    if (!openaiApiKey) {
      console.log('Using mock data - OpenAI API key not configured');
      const mockPlans = {
        workoutPlan: {
          title: 'แผนออกกำลังกาย 4 สัปดาห์',
          description: `แผนออกกำลังกายที่ออกแบบมาเพื่อ${profileData.goal === 'lose_weight' ? 'ลดน้ำหนัก' : profileData.goal === 'gain_muscle' ? 'เพิ่มกล้ามเนื้อ' : 'รักษาสุขภาพ'}สำหรับคุณโดยเฉพาะ เหมาะสำหรับผู้ที่มีเวลาว่าง ${profileData.available_time} นาทีต่อวัน`,
          schedule: [
            {
              day: 'วันจันทร์ - Upper Body',
              exercises: [
                { name: 'Push-ups', sets: '3', reps: '12-15', rest: '60 วินาที' },
                { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10-12', rest: '60 วินาที' },
                { name: 'Bicep Curls', sets: '3', reps: '12-15', rest: '45 วินาที' },
                { name: 'Tricep Dips', sets: '3', reps: '10-12', rest: '45 วินาที' },
              ]
            },
            {
              day: 'วันพุธ - Lower Body',
              exercises: [
                { name: 'Squats', sets: '4', reps: '12-15', rest: '60 วินาที' },
                { name: 'Lunges', sets: '3', reps: '10-12 ต่อขา', rest: '60 วินาที' },
                { name: 'Leg Raises', sets: '3', reps: '15', rest: '45 วินาที' },
                { name: 'Calf Raises', sets: '3', reps: '20', rest: '45 วินาที' },
              ]
            },
            {
              day: 'วันศุกร์ - Full Body & Core',
              exercises: [
                { name: 'Burpees', sets: '3', reps: '10', rest: '90 วินาที' },
                { name: 'Plank', sets: '3', reps: '45-60 วินาที', rest: '60 วินาที' },
                { name: 'Mountain Climbers', sets: '3', reps: '20', rest: '45 วินาที' },
                { name: 'Russian Twists', sets: '3', reps: '20', rest: '45 วินาที' },
              ]
            }
          ],
          tips: [
            'อบอุ่นร่างกายก่อนออกกำลังกายทุกครั้ง 5-10 นาที',
            'ดื่มน้ำให้เพียงพอ ระหว่าง และหลังออกกำลังกาย',
            'พักผ่อนให้เพียงพอ นอนหลับ 7-8 ชั่วโมงต่อวัน',
            'ค่อยๆ เพิ่มความหนักและจำนวนซ้ำเมื่อร่างกายปรับตัวได้แล้ว',
            'หากเจ็บหรือไม่สบายให้หยุดพักและปรึกษาแพทย์'
          ]
        },
        dietPlan: {
          title: 'แผนอาหาร 7 วัน',
          description: `แผนอาหารที่สมดุล คำนวณจากน้ำหนัก ${profileData.weight} กก. ส่วนสูง ${profileData.height} ซม. และเป้าหมาย${profileData.goal === 'lose_weight' ? 'ลดน้ำหนัก' : profileData.goal === 'gain_muscle' ? 'เพิ่มกล้ามเนื้อ' : 'รักษาสุขภาพ'}`,
          dailyCalories: profileData.goal === 'lose_weight' ? 1800 : profileData.goal === 'gain_muscle' ? 2500 : 2200,
          macros: {
            protein: profileData.goal === 'gain_muscle' ? 150 : 120,
            carbs: profileData.goal === 'lose_weight' ? 180 : 250,
            fat: 60
          },
          meals: [
            {
              mealType: 'มื้อเช้า (7:00-8:00)',
              time: '7:00-8:00 น.',
              foods: [
                'ข้าวกล้อง 1 ถ้วย',
                'ไข่ต้ม 2 ฟอง',
                'ผักโขมลวก 1 จาน',
                'นมถั่วเหลืองไม่หวาน 1 แก้ว'
              ],
              calories: 450
            },
            {
              mealType: 'มื้อว่างเช้า (10:00)',
              time: '10:00 น.',
              foods: [
                'กล้วยหอม 1 ลูก',
                'ถั่วอัลมอนด์ 10 เม็ด'
              ],
              calories: 200
            },
            {
              mealType: 'มื้อกลางวัน (12:00-13:00)',
              time: '12:00-13:00 น.',
              foods: [
                'ข้าวกล้อง 1 ถ้วย',
                'ปลาซาบะย่าง 1 ชิ้น',
                'ผักรวมลวก 1 จาน',
                'ส้มโอ 1/2 ลูก'
              ],
              calories: profileData.goal === 'lose_weight' ? 500 : 600
            },
            {
              mealType: 'มื้อว่างบ่าย (15:00)',
              time: '15:00 น.',
              foods: [
                'โยเกิร์ตกรีก ไม่หวาน 1 ถ้วย',
                'เบอร์รี่รวม 1/2 ถ้วย'
              ],
              calories: 150
            },
            {
              mealType: 'มื้อเย็น (18:00-19:00)',
              time: '18:00-19:00 น.',
              foods: [
                'ข้าวกล้อง 3/4 ถ้วย',
                'อกไก่ย่าง 150 กรัม',
                'สลัดผักสด พร้อมน้ำสลัดโยเกิร์ต',
                'ฟักทองต้ม 1 ชิ้น'
              ],
              calories: profileData.goal === 'lose_weight' ? 500 : 600
            }
          ],
          tips: [
            'ดื่มน้ำเปล่าอย่างน้อย 2-3 ลิตรต่อวัน',
            'หลีกเลี่ยงอาหารทอด อาหารแปรรูป และน้ำตาลสูง',
            'รับประทานอาหารให้ตรงเวลา ไม่ข้ามมื้อ',
            'เน้นโปรตีนคุณภาพดี ผักผลไม้หลากหลาย',
            'จำกัดเกลือและโซเดียม หันมากินอาหารปรุงเอง',
            'อ่านฉลากโภชนาการก่อนซื้ออาหาร'
          ]
        }
      };
      
      // Save workout plan to database
      await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          title: mockPlans.workoutPlan.title,
          description: mockPlans.workoutPlan.description,
          schedule: mockPlans.workoutPlan.schedule,
          tips: mockPlans.workoutPlan.tips,
        });

      // Save diet plan to database
      await supabase
        .from('diet_plans')
        .insert({
          user_id: user.id,
          title: mockPlans.dietPlan.title,
          description: mockPlans.dietPlan.description,
          daily_calories: mockPlans.dietPlan.dailyCalories,
          macros: mockPlans.dietPlan.macros,
          meals: mockPlans.dietPlan.meals,
          tips: mockPlans.dietPlan.tips,
        });
      
      return c.json(mockPlans);
    }

    // Generate plans using OpenAI
    const prompt = `สร้างแผนออกกำลังกาย (Workout Plan) และแผนอาหาร (Diet Plan) สำหรับบุคคลที่มีข้อมูลดังนี้:
- น้ำหนัก: ${profileData.weight} กก.
- ส่วนสูง: ${profileData.height} ม.
- อายุ: ${profileData.age} ปี
- เพศ: ${profileData.gender}
- เป้าหมาย: ${profileData.goal}
- ระดับกิจกรรม: ${profileData.activity_level}
- เวลาว่าง: ${profileData.available_time} นาที/วัน

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "workoutPlan": {
    "title": "string",
    "description": "string",
    "schedule": [
      {
        "day": "string",
        "exercises": [
          {
            "name": "string",
            "sets": "string",
            "reps": "string",
            "rest": "string"
          }
        ]
      }
    ],
    "tips": ["string"]
  },
  "dietPlan": {
    "title": "string",
    "description": "string",
    "dailyCalories": number,
    "macros": {
      "protein": number,
      "carbs": number,
      "fat": number
    },
    "meals": [
      {
        "mealType": "string",
        "time": "string",
        "foods": ["string"],
        "calories": number
      }
    ],
    "tips": ["string"]
  }
}

All text must be in Thai language.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error while generating plans:', errorText);
      return c.json({ error: 'Failed to generate plans' }, 500);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return c.json({ error: 'No response from AI' }, 500);
    }

    // Parse the JSON response
    const plans = JSON.parse(content.trim());

    // Save workout plan to database
    await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        title: plans.workoutPlan.title,
        description: plans.workoutPlan.description,
        schedule: plans.workoutPlan.schedule,
        tips: plans.workoutPlan.tips,
      });

    // Save diet plan to database
    await supabase
      .from('diet_plans')
      .insert({
        user_id: user.id,
        title: plans.dietPlan.title,
        description: plans.dietPlan.description,
        daily_calories: plans.dietPlan.dailyCalories,
        macros: plans.dietPlan.macros,
        meals: plans.dietPlan.meals,
        tips: plans.dietPlan.tips,
      });

    return c.json(plans);
  } catch (error: any) {
    console.error('Generate plans error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);