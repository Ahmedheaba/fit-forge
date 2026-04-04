import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiMapPin } from 'react-icons/fi';
import { format, addDays, startOfDay, isToday, isTomorrow } from 'date-fns';

const CATEGORIES = ['All', 'HIIT', 'Yoga', 'CrossFit', 'Cycling', 'Boxing', 'Strength', 'Pilates', 'Cardio', 'Open Gym'];
const CATEGORY_MAP = { 'HIIT': 'hiit', 'Yoga': 'yoga', 'CrossFit': 'crossfit', 'Cycling': 'cycling', 'Boxing': 'boxing', 'Strength': 'strength', 'Pilates': 'pilates', 'Cardio': 'cardio', 'Open Gym': 'open_gym' };
const DAYS = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));
const TIME_SLOTS = ['06:00', '06:30', '07:00', '07:30', '08:00', '09:00', '10:00', '11:00', '12:00', '17:00', '17:30', '18:00', '19:00'];

const CLASS_COLORS = { hiit: '#FF4444', yoga: '#9B59B6', crossfit: '#FF6B00', cycling: '#27AE60', boxing: '#E74C3C', strength: '#3498DB', pilates: '#1ABC9C', cardio: '#F39C12', open_gym: '#888888' };

export default function BookPage() {
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(DAYS[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data.classes)).finally(() => setLoading(false));
  }, []);

  // Check subscription
  useEffect(() => {
    if (user && user.subscription?.status !== 'active') {
      toast('You need an active membership to book sessions.', { icon: '🔒' });
      navigate('/plans');
    }
  }, [user, navigate]);

  const filtered = classes.filter(cls => {
    const catMatch = selectedCategory === 'All' || cls.category === CATEGORY_MAP[selectedCategory];
    const dayMatch = !cls.schedule?.length || cls.schedule.some(s => s.dayOfWeek === selectedDate.getDay());
    return catMatch && dayMatch;
  });

  // Get available times for selected class on selected day
  const availableTimes = selectedClass
    ? (selectedClass.schedule?.length
        ? selectedClass.schedule.filter(s => s.dayOfWeek === selectedDate.getDay()).map(s => s.startTime)
        : TIME_SLOTS)
    : TIME_SLOTS;

  const handleBook = async () => {
    if (!selectedTime) return toast.error('Please select a time slot.');
    setBooking(true);
    try {
      await api.post('/bookings', {
        gymClassId: selectedClass?._id || null,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        notes,
      });
      toast.success('Booking confirmed! Check your email. 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBooking(false);
    }
  };

  const formatDay = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE');
  };

  return (
    <div className="min-h-screen bg-cream text-jet pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-neon text-xs font-semibold uppercase tracking-widest mb-2">Schedule</p>
        <h1 className="font-display text-6xl md:text-7xl">BOOK A SESSION</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Class Browser */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Picker */}
          <div>
            <h3 className="text-sm font-semibold text-jet/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiCalendar size={14} /> Select Date
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DAYS.map(day => (
                <button
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setSelectedClass(null); setSelectedTime(''); }}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-200 min-w-[64px] ${
                    format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? 'bg-jet text-cream border-jet font-bold'
                      : 'border-jet/10 text-jet/50 hover:border-jet/30'
                  }`}
                >
                  <span className="text-xs uppercase">{formatDay(day)}</span>
                  <span className="text-lg font-bold mt-0.5">{format(day, 'd')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold text-jet/50 uppercase tracking-widest mb-4">Class Type</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSelectedClass(null); setSelectedTime(''); }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-jet text-cream border-jet'
                      : 'border-jet/10 text-jet/50 hover:border-jet/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Classes List */}
          <div>
            <h3 className="text-sm font-semibold text-jet/50 uppercase tracking-widest mb-4">
              Available Classes — {format(selectedDate, 'EEEE, MMMM d')}
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-3">😴</p>
                <p className="text-jet/50">No classes available for this selection.</p>
                <p className="text-jet/30 text-sm mt-1">Try a different day or category.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Open Gym Option */}
                {(selectedCategory === 'All' || selectedCategory === 'Open Gym') && (
                  <button
                    onClick={() => { setSelectedClass(null); setSelectedTime(''); }}
                    className={`w-full text-left card p-5 transition-all duration-200 border ${
                      !selectedClass ? 'border-jet/15 bg-jet/5' : 'hover:border-jet/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#88888820', color: '#888' }}>Open Gym</span>
                        </div>
                        <h4 className="font-bold">Open Gym Session</h4>
                        <p className="text-jet/40 text-sm">Self-directed • Any time • Main Floor</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-neon flex-shrink-0 flex items-center justify-center">
                        {!selectedClass && <div className="w-2.5 h-2.5 rounded-full bg-neon" />}
                      </div>
                    </div>
                  </button>
                )}

                {filtered.map(cls => {
                  const color = CLASS_COLORS[cls.category] || '#888';
                  const isSelected = selectedClass?._id === cls._id;
                  return (
                    <button
                      key={cls._id}
                      onClick={() => { setSelectedClass(cls); setSelectedTime(''); }}
                      className={`w-full text-left card p-5 transition-all duration-200 border ${
                        isSelected ? 'border-jet/15 bg-jet/5' : 'hover:border-jet/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                              {cls.category.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-jet/30 uppercase">{cls.difficulty}</span>
                          </div>
                          <h4 className="font-bold text-sm mb-0.5">{cls.name}</h4>
                          <p className="text-jet/40 text-xs">with {cls.trainer.name}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-jet/30">
                            <span className="flex items-center gap-1"><FiClock size={11} /> {cls.duration} min</span>
                            <span className="flex items-center gap-1"><FiUsers size={11} /> {cls.maxCapacity} max</span>
                            <span className="flex items-center gap-1"><FiMapPin size={11} /> {cls.room}</span>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-neon flex-shrink-0 flex items-center justify-center ml-4 mt-1">
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-neon" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <FiCalendar size={16} className="text-neon" />
                Your Booking
              </h3>

              {/* Summary */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-jet/5">
                  <span className="text-jet/40">Class</span>
                  <span className="font-medium">{selectedClass?.name || 'Open Gym'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-jet/5">
                  <span className="text-jet/40">Date</span>
                  <span className="font-medium">{format(selectedDate, 'EEE, MMM d')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-jet/5">
                  <span className="text-jet/40">Trainer</span>
                  <span className="font-medium">{selectedClass?.trainer?.name || 'Self-directed'}</span>
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="label flex items-center gap-2">
                  <FiClock size={13} /> Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-1 rounded-lg text-xs font-mono font-semibold border transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-jet text-cream border-jet'
                          : 'border-jet/10 text-jet/50 hover:border-jet/30'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="label">Notes (optional)</label>
                <textarea
                  className="input resize-none text-sm"
                  rows={3}
                  placeholder="Any special requirements or preferences…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handleBook}
                disabled={!selectedTime || booking}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Confirming…' : 'Confirm Booking'}
              </button>

              <p className="text-center text-xs text-jet/30 mt-3">
                Cancel up to 2 hours before for free
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
