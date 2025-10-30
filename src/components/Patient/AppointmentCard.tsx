import { Appointment } from '../../lib/supabase';
import { Calendar, Clock, User, Phone, FileText } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'doctor' | 'patient';
  onUpdateStatus?: (id: string, status: string) => void;
  onAddPrescription?: (id: string, prescription: string) => void;
  onAddMeetLink?: (id: string, link: string) => void;
}

export default function AppointmentCard({
  appointment,
  userRole,
  onUpdateStatus,
  onAddPrescription,
  onAddMeetLink,
}: AppointmentCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {userRole === 'patient'
              ? `Dr. ${appointment.doctor?.profile?.full_name}`
              : appointment.patient_name}
          </h3>
          {userRole === 'doctor' && (
            <p className="text-sm text-gray-600">
              {appointment.patient_age} years old, {appointment.patient_gender}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[appointment.status]}`}>
          {appointment.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar size={16} className="text-teal-600" />
          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock size={16} className="text-teal-600" />
          <span>{appointment.appointment_time}</span>
        </div>
        {userRole === 'patient' && appointment.doctor && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User size={16} className="text-teal-600" />
            <span>{appointment.doctor.specialization}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone size={16} className="text-teal-600" />
          <span>{appointment.patient_phone}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <FileText size={16} className="text-teal-600 mt-1" />
          <div>
            <p className="font-semibold">Symptoms:</p>
            <p>{appointment.symptoms}</p>
          </div>
        </div>
        {appointment.prescription && (
          <div className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
            <FileText size={16} className="text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-blue-900">Prescription:</p>
              <p className="text-blue-800">{appointment.prescription}</p>
            </div>
          </div>
        )}
        {appointment.meet_link && (
          <div className="bg-green-50 p-3 rounded-lg">
            <a
              href={appointment.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:text-green-900 font-semibold text-sm"
            >
              Join Google Meet
            </a>
          </div>
        )}
      </div>

      {userRole === 'doctor' && appointment.status === 'pending' && onUpdateStatus && (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStatus(appointment.id, 'approved')}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => onUpdateStatus(appointment.id, 'rejected')}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}

      {userRole === 'doctor' && appointment.status === 'approved' && (
        <div className="space-y-2">
          {!appointment.prescription && onAddPrescription && (
            <button
              onClick={() => {
                const prescription = prompt('Enter prescription:');
                if (prescription) onAddPrescription(appointment.id, prescription);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Add Prescription
            </button>
          )}
          {!appointment.meet_link && onAddMeetLink && (
            <button
              onClick={() => {
                const link = prompt('Enter Google Meet link:');
                if (link) onAddMeetLink(appointment.id, link);
              }}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Add Meet Link
            </button>
          )}
          <button
            onClick={() => onUpdateStatus && onUpdateStatus(appointment.id, 'completed')}
            className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {userRole === 'patient' && appointment.patient_phone && (
        <a
          href={`https://wa.me/${appointment.patient_phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition text-center"
        >
          Contact via WhatsApp
        </a>
      )}
    </div>
  );
}
