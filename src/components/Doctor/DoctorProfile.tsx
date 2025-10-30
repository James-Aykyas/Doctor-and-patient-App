import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save } from 'lucide-react';

interface DoctorProfileProps {
  onClose: () => void;
  onUpdate: () => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ onClose, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [consultationFee, setConsultationFee] = useState(0);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*, profile:profiles(phone)')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (doctorError) throw doctorError;

      if (doctorData) {
        setSpecialization(doctorData.specialization || '');
        setQualifications(doctorData.qualifications || '');
        setExperienceYears(doctorData.experience_years || 0);
        setConsultationFee(doctorData.consultation_fee || 0);
        setBio(doctorData.bio || '');
        setAvailableDays(doctorData.available_days || []);
        setPhone(doctorData.profile?.phone || '');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          specialization,
          qualifications,
          experience_years: experienceYears,
          consultation_fee: consultationFee,
          bio,
          available_days: availableDays,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (doctorError) throw doctorError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold">Update Doctor Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="e.g., Cardiologist"
                required
              />
            </div>

            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
                Qualifications
              </label>
              <input
                type="text"
                id="qualifications"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="e.g., MBBS, MD"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience *
              </label>
              <input
                type="number"
                id="experience"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                id="fee"
                value={consultationFee}
                onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-3 border-2 rounded-lg transition text-sm font-medium ${
                    availableDays.includes(day)
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio / About
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              placeholder="Tell patients about yourself, your expertise, and approach to care..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !specialization}
              className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
