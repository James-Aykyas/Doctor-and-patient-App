import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Video, FileText, Check } from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  symptoms: string;
  status: string;
  meet_link: string | null;
  notes: string | null;
  patient: {
    profile: {
      full_name: string;
    };
  };
}

interface ManageAppointmentProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: () => void;
}

export const ManageAppointment: React.FC<ManageAppointmentProps> = ({
  appointment,
  onClose,
  onUpdate
}) => {
  const [meetLink, setMeetLink] = useState(appointment.meet_link || '');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          meet_link: meetLink || null,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          meet_link: meetLink || null,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Manage Appointment</h2>
            <p className="text-teal-100 text-sm mt-1">
              Patient: {appointment.patient.profile.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Date:</span>{' '}
                <span className="font-medium">
                  {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Time:</span>{' '}
                <span className="font-medium">{appointment.appointment_time}</span>
              </p>
              <p>
                <span className="text-gray-600">Symptoms:</span>{' '}
                <span className="font-medium">{appointment.symptoms}</span>
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="meetLink" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-teal-600" />
                Google Meet Link
              </div>
            </label>
            <input
              type="url"
              id="meetLink"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Share a Google Meet link for virtual consultation
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-teal-600" />
                Doctor's Notes
              </div>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
              placeholder="Add notes about diagnosis, recommendations, or follow-up instructions..."
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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {appointment.status !== 'completed' && (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {loading ? 'Completing...' : 'Complete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
