import { Doctor as Doc} from '../../lib/supabase';
import { Calendar, Clock, Award, DollarSign } from 'lucide-react';

type DoctorCardProps = {
  doctor: Doc;
  onBook: (doctor: Doc) => void; // or (id: string) => void if you prefer
};

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
        {doctor.image_url ? (
          <img
            src={doctor.image_url}
            alt={doctor.profile?.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-teal-600">
              {doctor.profile?.full_name?.charAt(0) || 'D'}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          Dr. {doctor.profile?.full_name}
        </h3>
        <p className="text-teal-600 font-semibold mb-3">{doctor.specialization}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award size={16} className="text-teal-600" />
            <span>{doctor.qualification || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-teal-600" />
            <span>{doctor.experience_years} years experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={16} className="text-teal-600" />
            <span>₹{doctor.consultation_fee} consultation fee</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-teal-600" />
            <span>{doctor.available_days?.join(', ') || '—'}</span>
          </div>
        </div>

        {doctor.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doctor.bio}</p>
        )}

        <button
          onClick={() => onBook(doctor)}
          className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
