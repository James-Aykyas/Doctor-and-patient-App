import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, FileText, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppointmentCard from './AppointmentCard';
import DoctorCard from './DoctorCard';

type RoleGender = 'male' | 'female' | 'other';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string[];
  available_time_start: string;
  available_time_end: string;
  bio?: string;
  image_url?: string;
  created_at: string;
  profile?: Profile;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // yyyy-mm-dd
  appointment_time: string; // HH:mm
  symptoms: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'approved' | 'completed';
  meet_link: string | null;
  notes: string | null;
  doctor?: {
    profile: { full_name: string | null; phone: string | null };
    specialization: string | null;
  };
}

export const PatientDashboard: React.FC = () => {
  const { user, profile } = useAuth();

  const [view, setView] = useState<'doctors' | 'appointments'>('doctors');
  const [loading, setLoading] = useState(true);

  // doctors + appointments (new)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // booking form (from your 2nd snippet)
  const [formData, setFormData] = useState({
    patient_name: profile?.full_name || '',
    patient_age: '',
    patient_gender: 'male' as RoleGender,
    patient_phone: '',
    symptoms: '',
    appointment_date: '',
    appointment_time: '10:00',
  });

  // Resolve patient identifier: prefer patients.id if you use a separate patients table,
  // otherwise fall back to auth user id so both schemas work.
  const [patientRowId, setPatientRowId] = useState<string | null>(null);
  useEffect(() => {
    const resolvePatientId = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.id) {
        setPatientRowId(data.id);
      } else {
        // If no patient row exists for this user, create one and use its id
        const { data: created, error: createErr } = await supabase
          .from('patients')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (!createErr && created?.id) {
          setPatientRowId(created.id);
        } else {
          console.error('Failed to resolve/create patient record', error || createErr);
        }
      }
    };
    resolvePatientId();
  }, [user?.id]);

  useEffect(() => {
    if (!patientRowId) return;
    loadDoctors();
    loadAppointments(patientRowId);
  }, [patientRowId]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles!doctors_user_id_fkey(id, full_name, phone)
        `);

      if (error) throw error;
      setDoctors((data as Doctor[]) || []);
    } catch (e) {
      console.error('Error loading doctors:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (pId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(
            specialization,
            profile:profiles!doctors_user_id_fkey(full_name, phone)
          )
        `)
        .eq('patient_id', pId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments((data as Appointment[]) || []);
    } catch (e) {
      console.error('Error loading appointments:', e);
    }
  };

  const getStatusPill = (status: Appointment['status']) => {
    // support both 'approved' (old) and 'accepted' (new)
    const normalized = status === 'approved' ? 'accepted' : status;
    switch (normalized) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetForm = () =>
    setFormData({
      patient_name: profile?.full_name || '',
      patient_age: '',
      patient_gender: 'male',
      patient_phone: '',
      symptoms: '',
      appointment_date: '',
      appointment_time: '10:00',
    });

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !patientRowId) return;

    try {
      const { error } = await supabase.from('appointments').insert({
        doctor_id: selectedDoctor.id,
        patient_id: patientRowId,
        symptoms: formData.symptoms,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        status: 'pending',
      });

      if (error) throw error;

      // optimistic UX
      setSelectedDoctor(null);
      resetForm();
      await loadAppointments(patientRowId);
      setView('appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment');
    }
  };

  const header = useMemo(
    () => (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
        <p className="text-gray-600 mt-1">Find doctors and manage your appointments with the specialized one.</p>
      </div>
    ),
    [profile?.full_name]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {header}

        {/* view toggle */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setView('doctors')}
            className={`pb-3 px-4 font-semibold transition ${view === 'doctors'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Find Doctors
          </button>
          <button
            onClick={() => setView('appointments')}
            className={`pb-3 px-4 font-semibold transition ${view === 'appointments'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Make Appointments
          </button>
        </div>

        {/* doctors grid */}
        {view === 'doctors' && (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor: Doctor) => {
                    const doctorAppointments = appointments.filter((a) => a.doctor_id === doctor.id);
                    const hasAppointments = doctorAppointments.length > 0;
                    return (
                      <div key={doctor.id}>
                        <DoctorCard
                          doctor={doctor}
                          onBook={() => setSelectedDoctor(doctor)}
                        />
                        {hasAppointments && (
                          <div className="mt-2 space-y-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                              You have {doctorAppointments.length} appointment{doctorAppointments.length > 1 ? 's' : ''} with this doctor
                            </span>
                            <div className="space-y-4">
                              {doctorAppointments.map((appointment) => (
                                <AppointmentCard
                                  key={appointment.id}
                                  appointment={appointment}
                                  userRole="patient"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your Appointments</h2>
                  {appointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {appointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          userRole="patient"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">You have no appointments yet. Book one from the doctor cards above.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* appointments grid */}
        {view === 'appointments' && (
          <>
            {appointments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Dr. {a.doctor?.profile?.full_name ?? '—'}
                        </h3>
                        <p className="text-sm text-gray-600">{a.doctor?.specialization ?? '—'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusPill(a.status)}`}>
                        {((a.status === 'approved' ? 'accepted' : a.status) as string)
                          .charAt(0)
                          .toUpperCase() +
                          (a.status === 'approved' ? 'accepted' : a.status).slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-teal-600" />
                        <span className="text-sm">
                          {new Date(a.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-teal-600" />
                        <span className="text-sm">{a.appointment_time}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText size={18} className="text-teal-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Symptoms</p>
                          <p className="text-sm text-gray-600">{a.symptoms}</p>
                        </div>
                      </div>

                      {a.meet_link && (
                        <div className="pt-3 border-t border-gray-100">
                          <a
                            href={a.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-semibold"
                          >
                            Join Google Meet
                          </a>
                        </div>
                      )}

                      {a.notes && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700">Doctor&apos;s Notes</p>
                          <p className="text-sm text-gray-600 mt-1">{a.notes}</p>
                        </div>
                      )}

                      {a.doctor?.profile?.phone && (
                        <div className="pt-3 border-t border-gray-100">
                          <a
                            href={`https://wa.me/${a.doctor.profile.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold"
                          >
                            Contact via WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-6">Book your first appointment with our experienced doctors</p>
                <button
                  onClick={() => setView('doctors')}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition"
                >
                  Find Doctors
                </button>
              </div>
            )}
          </>
        )}

        {/* BOOKING MODAL (from your second snippet) */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Book Appointment with Dr. {selectedDoctor.profile?.full_name}
                </h3>
                <button onClick={() => setSelectedDoctor(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={formData.patient_age}
                      onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      required
                      value={formData.patient_gender}
                      onChange={(e) =>
                        setFormData({ ...formData, patient_gender: e.target.value as RoleGender })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.patient_phone}
                      onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time *</label>
                    <input
                      type="time"
                      required
                      value={formData.appointment_time}
                      onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms / Reason for Visit *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe your symptoms or reason for consultation"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
