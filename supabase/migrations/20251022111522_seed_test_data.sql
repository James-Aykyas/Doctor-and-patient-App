/*
  # Seed Test Data for MediConnect

  ## Overview
  This migration adds test data for doctors and patients to help with testing and demonstration.

  ## Test Data Added

  ### Doctors (3 test doctors)
  1. Dr. Sarah Johnson - Cardiologist
     - 15 years experience
     - Available: Mon, Wed, Fri
     - $150 consultation fee

  2. Dr. Michael Chen - General Physician
     - 10 years experience
     - Available: Tue, Thu, Sat
     - $100 consultation fee

  3. Dr. Emily Rodriguez - Dermatologist
     - 8 years experience
     - Available: Mon, Tue, Thu, Fri
     - $120 consultation fee

  ### Patients (2 test patients)
  1. John Smith - 35 years old
  2. Mary Williams - 28 years old

  ## Notes
  - All test users have password: test123456
  - Email format: firstname.lastname@test.com
  - This is for testing purposes only
*/

DO $$
DECLARE
  doctor1_id uuid;
  doctor2_id uuid;
  doctor3_id uuid;
  patient1_id uuid;
  patient2_id uuid;
  doctor1_profile_id uuid := gen_random_uuid();
  doctor2_profile_id uuid := gen_random_uuid();
  doctor3_profile_id uuid := gen_random_uuid();
  patient1_profile_id uuid := gen_random_uuid();
  patient2_profile_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES 
    (doctor1_profile_id, 'sarah.johnson@test.com', crypt('test123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (doctor2_profile_id, 'michael.chen@test.com', crypt('test123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (doctor3_profile_id, 'emily.rodriguez@test.com', crypt('test123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (patient1_profile_id, 'john.smith@test.com', crypt('test123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (patient2_profile_id, 'mary.williams@test.com', crypt('test123456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, role, full_name, phone)
  VALUES
    (doctor1_profile_id, 'doctor', 'Dr. Sarah Johnson', '+1234567890'),
    (doctor2_profile_id, 'doctor', 'Dr. Michael Chen', '+1234567891'),
    (doctor3_profile_id, 'doctor', 'Dr. Emily Rodriguez', '+1234567892'),
    (patient1_profile_id, 'patient', 'John Smith', '+1234567893'),
    (patient2_profile_id, 'patient', 'Mary Williams', '+1234567894')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO doctors (user_id, specialization, qualifications, experience_years, consultation_fee, available_days, bio)
  VALUES
    (
      doctor1_profile_id,
      'Cardiologist',
      'MD, FACC, Board Certified in Cardiovascular Disease',
      15,
      150.00,
      ARRAY['Monday', 'Wednesday', 'Friday'],
      'Specialized in preventive cardiology and heart disease management. Committed to providing personalized care for each patient.'
    ),
    (
      doctor2_profile_id,
      'General Physician',
      'MBBS, MD General Medicine',
      10,
      100.00,
      ARRAY['Tuesday', 'Thursday', 'Saturday'],
      'Experienced family doctor providing comprehensive primary care services. Focus on preventive medicine and chronic disease management.'
    ),
    (
      doctor3_profile_id,
      'Dermatologist',
      'MD, Board Certified Dermatologist',
      8,
      120.00,
      ARRAY['Monday', 'Tuesday', 'Thursday', 'Friday'],
      'Expert in medical and cosmetic dermatology. Specializing in skin conditions, acne treatment, and anti-aging procedures.'
    )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO patients (user_id, age, gender, blood_group, address)
  VALUES
    (patient1_profile_id, 35, 'male', 'O+', '123 Main Street, New York, NY 10001'),
    (patient2_profile_id, 28, 'female', 'A+', '456 Oak Avenue, Los Angeles, CA 90001')
  ON CONFLICT (user_id) DO NOTHING;

END $$;