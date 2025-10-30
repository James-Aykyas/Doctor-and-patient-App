import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Calendar } from 'lucide-react';

interface Doctor {
  id: string;
  profile: {
    full_name: string;
  };
  specialization: string;
  available_days: string[];
  time_slots: any;
}

interface BookAppointmentProps {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookAppointment: React.FC<BookAppointmentProps> = ({ doctor, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (patientError) throw patientError;
      if (!patientData) throw new Error('Patient profile not found');

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctor.id,
          patient_id: patientData.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          symptoms: symptoms,
          status: 'pending'
        });

      if (appointmentError) throw appointmentError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Book Appointment</h2>
            <p className="text-teal-100 text-sm mt-1">with Dr. {doctor.profile.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="date"
                id="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={today}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Time
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setAppointmentTime(time)}
                  className={`p-2 text-sm border rounded-lg transition ${
                    appointmentTime === time
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-gray-300 hover:border-teal-400'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms / Reason for Visit
            </label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              placeholder="Describe your symptoms or reason for consultation..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
