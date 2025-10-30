import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, DollarSign, Award } from 'lucide-react';

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  qualifications: string | null;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  time_slots: any;
  bio: string | null;
  profile: {
    full_name: string;
    phone: string | null;
  };
}

interface DoctorListProps {
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({ onBookAppointment }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(full_name, phone)
        `);

      if (error) throw error;
      setDoctors(data as any);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
            <h3 className="text-xl font-bold">{doctor.profile.full_name}</h3>
            <p className="text-teal-100 text-sm mt-1">{doctor.specialization}</p>
          </div>

          <div className="p-6 space-y-4">
            {doctor.qualifications && (
              <div className="flex items-start gap-3">
                <Award className="text-teal-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Qualifications</p>
                  <p className="text-sm text-gray-600">{doctor.qualifications}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="text-teal-600" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-700">Experience</p>
                <p className="text-sm text-gray-600">{doctor.experience_years} years</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="text-teal-600" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                <p className="text-sm text-gray-600">${doctor.consultation_fee}</p>
              </div>
            </div>

            {doctor.available_days.length > 0 && (
              <div className="flex items-start gap-3">
                <Calendar className="text-teal-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Available Days</p>
                  <p className="text-sm text-gray-600">{doctor.available_days.join(', ')}</p>
                </div>
              </div>
            )}

            {doctor.bio && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 line-clamp-3">{doctor.bio}</p>
              </div>
            )}

            <button
              onClick={() => onBookAppointment(doctor)}
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Book Appointment
            </button>
          </div>
        </div>
      ))}

      {doctors.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No doctors available at the moment.</p>
        </div>
      )}
    </div>
  );
};
