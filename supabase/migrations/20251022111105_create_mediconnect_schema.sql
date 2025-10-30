/*
  # MediConnect Database Schema

  ## Overview
  This migration creates the complete database schema for MediConnect, a doctor appointment booking system.

  ## New Tables

  ### 1. `profiles`
  Extends Supabase auth.users with additional profile information
  - `id` (uuid, primary key, references auth.users)
  - `role` (text) - Either 'doctor' or 'patient'
  - `full_name` (text)
  - `phone` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `doctors`
  Stores doctor-specific information
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `specialization` (text)
  - `qualifications` (text)
  - `experience_years` (integer)
  - `consultation_fee` (numeric)
  - `available_days` (text array) - ['Monday', 'Tuesday', etc.]
  - `time_slots` (jsonb) - Structured time availability
  - `bio` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `patients`
  Stores patient-specific information
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `age` (integer)
  - `gender` (text)
  - `blood_group` (text)
  - `address` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `appointments`
  Stores appointment bookings
  - `id` (uuid, primary key)
  - `doctor_id` (uuid, references doctors)
  - `patient_id` (uuid, references patients)
  - `appointment_date` (date)
  - `appointment_time` (text)
  - `symptoms` (text)
  - `status` (text) - 'pending', 'approved', 'completed', 'cancelled'
  - `meet_link` (text) - Google Meet link shared by doctor
  - `notes` (text) - Doctor's notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `prescriptions`
  Stores prescriptions issued by doctors
  - `id` (uuid, primary key)
  - `appointment_id` (uuid, references appointments)
  - `doctor_id` (uuid, references doctors)
  - `patient_id` (uuid, references patients)
  - `medicines` (jsonb) - Array of medicine objects
  - `instructions` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies ensure users can only access their own data
  - Doctors can view their appointments and patient details
  - Patients can view their appointments and doctor details
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('doctor', 'patient')),
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  qualifications text,
  experience_years integer DEFAULT 0,
  consultation_fee numeric(10,2) DEFAULT 0,
  available_days text[] DEFAULT '{}',
  time_slots jsonb DEFAULT '[]'::jsonb,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_group text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  symptoms text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  meet_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  medicines jsonb DEFAULT '[]'::jsonb,
  instructions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Doctors RLS Policies
CREATE POLICY "Anyone can view doctor profiles"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'doctor'
      AND profiles.id = doctors.user_id
    )
  );

CREATE POLICY "Doctors can insert own profile"
  ON doctors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'doctor'
    )
  );

-- Patients RLS Policies
CREATE POLICY "Patients can view own profile"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = patients.user_id
    )
  );

CREATE POLICY "Doctors can view patient profiles"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'doctor'
    )
  );

CREATE POLICY "Patients can update own profile"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = patients.user_id
    )
  );

CREATE POLICY "Patients can insert own profile"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'patient'
    )
  );

-- Appointments RLS Policies
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.id = appointments.patient_id
    )
  );

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = appointments.doctor_id
    )
  );

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.id = appointments.patient_id
    )
  );

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.id = appointments.patient_id
    )
  );

CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = appointments.doctor_id
    )
  );

-- Prescriptions RLS Policies
CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.user_id = auth.uid()
      AND patients.id = prescriptions.patient_id
    )
  );

CREATE POLICY "Doctors can view their prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = prescriptions.doctor_id
    )
  );

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
      AND doctors.id = prescriptions.doctor_id
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);