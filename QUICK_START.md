# MediConnect - Quick Start Guide

## Getting Started

The authentication issue has been resolved! The system now works perfectly with proper user signup.

## How to Create Test Accounts

Since the previous test accounts were removed, you need to create new accounts through the signup form:

### Creating a Patient Account

1. Click "Sign Up" on the login page
2. Fill in the form:
   - Full Name: e.g., "John Smith"
   - Email: e.g., "john@test.com"
   - Password: minimum 6 characters
   - Select: **Patient**
3. Click "Sign Up"
4. You'll be automatically logged in!

### Creating a Doctor Account

1. Click "Sign Up" on the login page
2. Fill in the form:
   - Full Name: e.g., "Dr. Sarah Johnson"
   - Email: e.g., "sarah@test.com"
   - Password: minimum 6 characters
   - Select: **Doctor**
3. Click "Sign Up"
4. After login, click "Edit Profile" to update:
   - Specialization (e.g., Cardiologist)
   - Qualifications (e.g., MBBS, MD)
   - Years of experience
   - Consultation fee
   - Available days
   - Phone number for WhatsApp
   - Bio

## Testing the Full Workflow

### Step 1: Create a Doctor Account
1. Sign up as a doctor
2. Update your profile with specialization and other details
3. Sign out

### Step 2: Create a Patient Account
1. Sign up as a patient
2. Browse available doctors
3. Book an appointment with the doctor you created
4. Sign out

### Step 3: Manage Appointment as Doctor
1. Sign in with the doctor account
2. See the pending appointment
3. Approve it
4. Add a Google Meet link
5. Add consultation notes
6. Mark as completed

### Step 4: View as Patient
1. Sign in with the patient account
2. View your appointments
3. See the doctor's notes and Meet link
4. Access WhatsApp contact if phone was provided

## Key Features Working

✅ **Authentication**
- Email/password signup and login
- Role-based access (Doctor/Patient)
- Automatic profile creation

✅ **For Patients**
- Browse all available doctors
- Book appointments with date/time selection
- View appointment history
- Access Google Meet links
- Contact doctors via WhatsApp

✅ **For Doctors**
- Complete profile management
- View all appointments with filters
- Approve/reject appointments
- Add Google Meet links
- Write consultation notes
- Mark appointments as completed
- Contact patients via WhatsApp

✅ **Security**
- Row Level Security (RLS) enabled
- Users can only see their own data
- Doctors can only manage their appointments
- Patients can only book and view their appointments

## Database Tables

- `profiles` - User profile information
- `doctors` - Doctor-specific data
- `patients` - Patient-specific data
- `appointments` - Appointment bookings
- `prescriptions` - Future feature (structure ready)

## All Issues Resolved

The "Invalid login credentials" error has been fixed by:
1. Removing improperly seeded test users
2. Creating proper database triggers
3. Ensuring signup flow works correctly
4. All authentication is now handled through Supabase Auth API

You can now freely create as many test accounts as you need!
