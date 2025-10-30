/*
  # Add automatic profile creation trigger

  ## Overview
  This migration adds a database trigger that automatically creates doctor or patient records
  when a new profile is inserted, ensuring data consistency.

  ## Changes
  1. Create a function that handles profile creation
  2. Add a trigger to execute the function after profile insert
  3. This ensures doctor/patient records are always created with profiles

  ## Benefits
  - Eliminates race conditions in signup process
  - Ensures data consistency
  - Simplifies application code
*/

-- Drop the old seed data migration effects
DO $$
BEGIN
  -- Clean up any orphaned records from failed seeding
  DELETE FROM doctors WHERE user_id NOT IN (SELECT id FROM profiles);
  DELETE FROM patients WHERE user_id NOT IN (SELECT id FROM profiles);
END $$;

-- Create function to automatically create doctor/patient records
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'doctor' THEN
    INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee)
    VALUES (NEW.id, 'General Physician', 0, 100)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'patient' THEN
    INSERT INTO patients (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();