import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, FileText, Check, X, Video, MessageCircle, Settings } from 'lucide-react';
import { ManageAppointment } from './ManageAppointment';
import { DoctorProfile } from './DoctorProfile';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  symptoms: string;
  status: string;
  meet_link: string | null;
  notes: string | null;
  patient: {
    age: number | null;
    gender: string | null;
    profile: {
      full_name: string;
      phone: string | null;
    };
  };
}

export const DoctorDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (doctorError) throw doctorError;
      if (!doctorData) return;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(
            age,
            gender,
            profile:profiles(full_name, phone)
          )
        `)
        .eq('doctor_id', doctorData.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data as any);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(
    (apt) => filter === 'all' || apt.status === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, Dr. {profile?.full_name}
            </h1>
            <p className="text-gray-600 mt-1">Manage your appointments and patients</p>
          </div>
          <button
            onClick={() => setShowProfileEdit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-semibold"
          >
            <Settings size={18} />
            Edit Profile
          </button>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {appointment.patient.profile.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.patient.age && `${appointment.patient.age} years`}
                      {appointment.patient.age && appointment.patient.gender && ' • '}
                      {appointment.patient.gender && appointment.patient.gender.charAt(0).toUpperCase() + appointment.patient.gender.slice(1)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={18} className="text-teal-600" />
                    <span className="text-sm">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock size={18} className="text-teal-600" />
                    <span className="text-sm">{appointment.appointment_time}</span>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <FileText size={18} className="text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Symptoms</p>
                      <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                    </div>
                  </div>

                  {appointment.patient.profile.phone && (
                    <div className="pt-3 border-t border-gray-100">
                      <a
                        href={`https://wa.me/${appointment.patient.profile.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold"
                      >
                        <MessageCircle size={16} />
                        Contact via WhatsApp
                      </a>
                    </div>
                  )}

                  {appointment.status === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                      >
                        <X size={18} />
                        Reject
                      </button>
                    </div>
                  )}

                  {(appointment.status === 'approved' || appointment.status === 'completed') && (
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-semibold"
                      >
                        <Video size={18} />
                        Manage Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} appointments
            </h3>
            <p className="text-gray-600">
              {filter === 'pending'
                ? 'No pending appointments at the moment'
                : 'Check back later for new appointments'}
            </p>
          </div>
        )}

        {selectedAppointment && (
          <ManageAppointment
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onUpdate={fetchAppointments}
          />
        )}

        {showProfileEdit && (
          <DoctorProfile
            onClose={() => setShowProfileEdit(false)}
            onUpdate={fetchAppointments}
          />
        )}
      </div>
    </div>
  );
};
