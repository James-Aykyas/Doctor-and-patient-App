import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'doctor' | 'patient';
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'doctor' | 'patient';
          full_name: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'doctor' | 'patient';
          full_name?: string;
          phone?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          blood_group: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          appointment_id: string;
          doctor_id: string;
          patient_id: string;
          medicines: any;
          instructions: string | null;
          created_at: string;
        };
      };
    };
  };
};

async function createTestUsers(): Promise<void> {
  const users = [
    { email: "doctor@test.com", password: "doctor123", role: "doctor" as const },
    { email: "patient@test.com", password: "patient123", role: "patient" as const },
  ];

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: user.role },
    });

    if (error) {
      console.error("Error creating user:", error);
    } else {
      console.log("User created:", data.user?.email);
    }
  }
}
createTestUsers();

export interface Profile {
  id: string;
  full_name: string;
  role: 'doctor' | 'patient';
  phone?: string;
  created_at: string;
  updated_at: string;
}

// export interface Doctor {
//   id: string;
//   user_id: string;
//   specialization: string;
//   qualification: string;
//   experience_years: number;
//   consultation_fee: number;
//   available_days: string[];
//   available_time_start: string;
//   available_time_end: string;
//   bio?: string;
//   image_url?: string;
//   created_at: string;
//   profile?: Profile;
// }

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_age: number;
  patient_gender: 'male' | 'female' | 'other';
  patient_phone: string;
  symptoms: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  prescription?: string;
  meet_link?: string;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
  patient?: Profile;
}
export type Patient = Database['public']['Tables']['patients']['Row'] & {
  profile?: Profile;
};
export type Doctor = Database['public']['Tables']['profiles']['Row'] & {
  profile?: Doctor;
};