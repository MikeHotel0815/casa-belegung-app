import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, UserCircle, LogIn, LogOut, PlusCircle, Edit3, Trash2, ShieldCheck, Home, Users } from 'lucide-react';

// Tailwind CSS (wird normalerweise über eine CSS-Datei oder einen Build-Prozess eingebunden)
// Für dieses Beispiel gehen wir davon aus, dass Tailwind global verfügbar ist.
// <script src="https://cdn.tailwindcss.com"></script>

// Constants
const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin',
};

const BOOKING_STATUS = {
  RESERVED: 'reserved',
  CONFIRMED: 'confirmed',
};

// Mock Data
const MOCK_USERS = [
  { id: 'user1', name: 'Max Mustermann', email: 'max@example.com', role: USER_ROLES.USER, password: 'password123' },
  { id: 'admin1', name: 'Admina Administrator', email: 'admin@example.com', role: USER_ROLES.ADMIN, password: 'adminpassword' },
  { id: 'user2', name: 'Erika Musterfrau', email: 'erika@example.com', role: USER_ROLES.USER, password: 'password456' },
];

const MOCK_INITIAL_BOOKINGS = [
  { id: 'booking1', userId: 'user1', userName: 'Max Mustermann', startDate: '2025-07-10', endDate: '2025-07-15', status: BOOKING_STATUS.CONFIRMED, propertyId: 'ferienhaus1' },
  { id: 'booking2', userId: 'user2', userName: 'Erika Musterfrau', startDate: '2025-07-20', endDate: '2025-07-25', status: BOOKING_STATUS.RESERVED, propertyId: 'ferienhaus1' },
  { id: 'booking3', userId: 'admin1', userName: 'Admina Administrator (für Gast)', startDate: '2025-08-01', endDate: '2025-08-05', status: BOOKING_STATUS.CONFIRMED, propertyId: 'ferienhaus1' },
];

// Context for Authentication
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // { id, name, email, role }
  const [loading, setLoading] = useState(true);

  // Simulate initial auth check (e.g., from a token)
  useEffect(() => {
    // In a real app, you'd check localStorage or a cookie for a token
    // For now, start logged out
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (user) {
          setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
          resolve(user);
        } else {
          reject(new Error('Ungültige Anmeldedaten.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    // In a real app, you'd clear the token
  };

  const authContextValue = useMemo(() => ({ currentUser, login, logout, loading }), [currentUser, loading]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Context for Bookings
const BookingContext = createContext(null);

const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(MOCK_INITIAL_BOOKINGS);
  const { currentUser } = useAuth();

  // Simulate fetching bookings (would depend on current month/view in real app)
  // useEffect(() => {
  //   // API_fetchBookings().then(setBookings);
  // }, []);

  const addBooking = async (bookingDetails) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBooking = {
          ...bookingDetails,
          id: `booking${Date.now()}`,
          propertyId: 'ferienhaus1', // Assuming one property for now
        };
        setBookings(prev => [...prev, newBooking]);
        resolve(newBooking);
      }, 500);
    });
  };

  const updateBooking = async (bookingId, updates) => {
     // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        resolve(true);
      }, 500);
    });
  };

  const deleteBooking = async (bookingId) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        resolve(true);
      }, 500);
    });
  };
  
  const bookingContextValue = useMemo(() => ({ bookings, addBooking, updateBooking, deleteBooking, setBookings }), [bookings]);


  return (
    <BookingContext.Provider value={bookingContextValue}>
      {children}
    </BookingContext.Provider>
  );
};

const useBookings = () => useContext(BookingContext);

// Helper Functions
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

// Components

const Navbar = ({ setCurrentView }) => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <Home size={28} />
            <h1 className="text-xl font-bold">Ferienhaus Planer</h1>
        </div>
        <div className="space-x-4 flex items-center">
          {currentUser && (
            <>
              <button onClick={() => setCurrentView('calendar')} className="hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-1">
                <CalendarDays size={20}/> <span>Kalender</span>
              </button>
              {currentUser.role === USER_ROLES.ADMIN && (
                <button onClick={() => setCurrentView('admin')} className="hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-1">
                  <ShieldCheck size={20}/> <span>Admin</span>
                </button>
              )}
               <button onClick={() => setCurrentView('userManagement')} className="hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-1">
                  <Users size={20}/> <span>Benutzer</span>
                </button>
            </>
          )}
          {currentUser ? (
            <>
              <span className="text-sm hidden sm:inline">Hallo, {currentUser.name}!</span>
              <button onClick={() => { logout(); setCurrentView('login'); }} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md flex items-center space-x-1">
                <LogOut size={20}/> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button onClick={() => setCurrentView('login')} className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md flex items-center space-x-1">
              <LogIn size={20}/> <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const LoginPage = ({ setCurrentView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      setCurrentView('calendar'); // Navigate to calendar on successful login
    } catch (err) {
      setError(err.message || 'Login fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <UserCircle size={64} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Login</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ihre@email.de"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Passwort</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ihr Passwort"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
       <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-md">
          <p className="font-semibold">Test-Anmeldedaten:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Benutzer: <code className="bg-gray-200 px-1 rounded">max@example.com</code> / <code className="bg-gray-200 px-1 rounded">password123</code></li>
            <li>Admin: <code className="bg-gray-200 px-1 rounded">admin@example.com</code> / <code className="bg-gray-200 px-1 rounded">adminpassword</code></li>
          </ul>
        </div>
    </div>
  );
};

const CalendarView = ({ setCurrentView, openBookingModal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { bookings } = useBookings();
  const { currentUser } = useAuth();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const daysInMonth = getDaysInMonth(year, month);
  let firstDayPos = getFirstDayOfMonth(year, month);
  firstDayPos = firstDayPos === 0 ? 6 : firstDayPos -1; // Adjust: 0 (Mon) - 6 (Sun)

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingEmptyDays = Array.from({ length: firstDayPos });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getBookingsForDate = (day) => {
    const dateStr = formatDate(new Date(year, month, day));
    return bookings.filter(b => {
      const startDate = new Date(b.startDate);
      const endDate = new Date(b.endDate);
      const currentDateIter = new Date(dateStr);
      return currentDateIter >= startDate && currentDateIter <= endDate;
    });
  };

  if (!currentUser) {
     setCurrentView('login');
     return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft size={28} className="text-blue-500" />
          </button>
          <h2 className="text-2xl font-bold text-blue-600">
            {currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronRight size={28} className="text-blue-500" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {leadingEmptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="border rounded-md h-24 sm:h-32"></div>
          ))}
          {monthDays.map(day => {
            const dayBookings = getBookingsForDate(day);
            const isBooked = dayBookings.length > 0;
            const fullDate = new Date(year, month, day);

            return (
              <div
                key={day}
                className={`border rounded-md p-2 h-24 sm:h-32 flex flex-col cursor-pointer hover:bg-blue-50 transition-colors duration-150
                  ${isBooked ? 'bg-rose-100' : 'bg-green-50'}`}
                onClick={() => openBookingModal(formatDate(fullDate))}
              >
                <span className={`font-medium ${isBooked ? 'text-rose-700' : 'text-green-700'}`}>{day}</span>
                {dayBookings.map(booking => (
                  <div key={booking.id} className={`mt-1 text-xs p-1 rounded-md truncate ${booking.status === BOOKING_STATUS.CONFIRMED ? 'bg-rose-500 text-white' : 'bg-yellow-400 text-black'}`}>
                    {booking.userName.split(' ')[0]} ({booking.status === BOOKING_STATUS.CONFIRMED ? 'Bestätigt' : 'Reserviert'})
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
            <button
                onClick={() => openBookingModal(null)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2"
            >
                <PlusCircle size={20} />
                <span>Neue Buchung</span>
            </button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, selectedDate, bookingToEdit }) => {
  const { currentUser } = useAuth();
  const { addBooking, updateBooking, bookings } = useBookings();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userIdForBooking, setUserIdForBooking] = useState(''); // For admin
  const [userNameForBooking, setUserNameForBooking] = useState(''); // For admin display
  const [status, setStatus] = useState(BOOKING_STATUS.RESERVED);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState(MOCK_USERS.filter(u => u.role === USER_ROLES.USER));


  useEffect(() => {
    if (bookingToEdit) {
      setStartDate(bookingToEdit.startDate);
      setEndDate(bookingToEdit.endDate);
      setStatus(bookingToEdit.status);
      if (currentUser?.role === USER_ROLES.ADMIN) {
        setUserIdForBooking(bookingToEdit.userId);
        setUserNameForBooking(bookingToEdit.userName);
      }
    } else if (selectedDate) {
      setStartDate(selectedDate);
      setEndDate(selectedDate); // Default end date to start date
      if (currentUser?.role !== USER_ROLES.ADMIN && currentUser) {
        setUserIdForBooking(currentUser.id);
        setUserNameForBooking(currentUser.name);
      } else {
        setUserIdForBooking('');
        setUserNameForBooking('');
      }
    } else { // Reset form if no date and no edit
        setStartDate('');
        setEndDate('');
        setStatus(BOOKING_STATUS.RESERVED);
        setUserIdForBooking(currentUser?.role !== USER_ROLES.ADMIN && currentUser ? currentUser.id : '');
        setUserNameForBooking(currentUser?.role !== USER_ROLES.ADMIN && currentUser ? currentUser.name : '');
    }
  }, [isOpen, selectedDate, bookingToEdit, currentUser]);

  const isDateRangeAvailable = (start, end, excludeBookingId = null) => {
    const newStart = new Date(start);
    const newEnd = new Date(end);

    for (const booking of bookings) {
      if (excludeBookingId && booking.id === excludeBookingId) continue;

      const existingStart = new Date(booking.startDate);
      const existingEnd = new Date(booking.endDate);

      // Check for overlap
      if (newStart <= existingEnd && newEnd >= existingStart) {
        return false; // Dates overlap
      }
    }
    return true; // No overlap
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!startDate || !endDate) {
      setError('Bitte Start- und Enddatum auswählen.');
      setIsLoading(false);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('Das Enddatum darf nicht vor dem Startdatum liegen.');
      setIsLoading(false);
      return;
    }

    if (!isDateRangeAvailable(startDate, endDate, bookingToEdit?.id)) {
        setError('Der ausgewählte Zeitraum ist bereits belegt oder teilweise belegt.');
        setIsLoading(false);
        return;
    }

    let finalUserId = currentUser?.id;
    let finalUserName = currentUser?.name;

    if (currentUser?.role === USER_ROLES.ADMIN) {
      if (!userIdForBooking) {
        setError('Als Admin müssen Sie einen Benutzer für die Buchung auswählen.');
        setIsLoading(false);
        return;
      }
      finalUserId = userIdForBooking;
      const selectedUser = MOCK_USERS.find(u => u.id === userIdForBooking);
      finalUserName = selectedUser ? selectedUser.name : 'Unbekannter Benutzer';
    } else if (!currentUser) {
        setError('Sie müssen angemeldet sein, um zu buchen.');
        setIsLoading(false);
        return;
    }


    const bookingData = { userId: finalUserId, userName: finalUserName, startDate, endDate, status };

    try {
      if (bookingToEdit) {
        await updateBooking(bookingToEdit.id, bookingData);
      } else {
        await addBooking(bookingData);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Fehler beim Speichern der Buchung.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">{bookingToEdit ? 'Buchung bearbeiten' : 'Neue Buchung erstellen'}</h3>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentUser?.role === USER_ROLES.ADMIN && (
            <div>
              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-600">Benutzer auswählen</label>
              <select
                id="userSelect"
                value={userIdForBooking}
                onChange={(e) => {
                    setUserIdForBooking(e.target.value);
                    const selectedUser = availableUsers.find(u => u.id === e.target.value);
                    setUserNameForBooking(selectedUser ? selectedUser.name : '');
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">-- Benutzer wählen --</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">Startdatum</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-600">Enddatum</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={BOOKING_STATUS.RESERVED}>Reserviert</option>
              <option value={BOOKING_STATUS.CONFIRMED}>Bestätigt</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Speichern...' : (bookingToEdit ? 'Änderungen speichern' : 'Buchung erstellen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ setCurrentView, openBookingModal, setBookingToEdit }) => {
  const { bookings, deleteBooking, updateBooking } = useBookings();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  if (currentUser?.role !== USER_ROLES.ADMIN) {
    setCurrentView('calendar'); // Redirect if not admin
    return <p className="p-4 text-red-500">Zugriff verweigert. Sie müssen Administrator sein.</p>;
  }

  const filteredBookings = bookings
    .filter(b => b.userName.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(b => filterStatus ? b.status === filterStatus : true)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by start date

  const handleEdit = (booking) => {
    setBookingToEdit(booking);
    openBookingModal(null); // Open modal without specific date, it will use bookingToEdit
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Buchung löschen möchten?')) { // Replace with custom modal in real app
      await deleteBooking(bookingId);
    }
  };

  const handleChangeStatus = async (bookingId, newStatus) => {
    await updateBooking(bookingId, { status: newStatus });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Dashboard - Buchungsverwaltung</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input 
            type="text"
            placeholder="Suche nach Name oder Buchungs-ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Alle Status</option>
            <option value={BOOKING_STATUS.RESERVED}>Reserviert</option>
            <option value={BOOKING_STATUS.CONFIRMED}>Bestätigt</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benutzer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startdatum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enddatum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-gray-500">Keine Buchungen gefunden.</td></tr>
              )}
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 truncate" title={booking.id}>{booking.id.substring(0,8)}...</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.userName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.startDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.endDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <select
                        value={booking.status}
                        onChange={(e) => handleChangeStatus(booking.id, e.target.value)}
                        className={`p-1 rounded-md text-xs ${booking.status === BOOKING_STATUS.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                        <option value={BOOKING_STATUS.RESERVED}>Reserviert</option>
                        <option value={BOOKING_STATUS.CONFIRMED}>Bestätigt</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(booking)} className="text-blue-600 hover:text-blue-800 p-1" title="Bearbeiten">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(booking.id)} className="text-red-600 hover:text-red-800 p-1" title="Löschen">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <div className="mt-6 flex justify-end">
            <button
                onClick={() => { setBookingToEdit(null); openBookingModal(null);}}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2"
            >
                <PlusCircle size={20} />
                <span>Neue Buchung für Benutzer</span>
            </button>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage = ({ setCurrentView }) => {
  const { currentUser } = useAuth();
  // In a real app, users would be fetched from an API
  const [users, setUsers] = useState(MOCK_USERS); 
  const [searchTerm, setSearchTerm] = useState('');

  if (currentUser?.role !== USER_ROLES.ADMIN) {
    setCurrentView('calendar'); // Redirect if not admin
    return <p className="p-4 text-red-500">Zugriff verweigert. Nur Administratoren können Benutzer verwalten.</p>;
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Placeholder functions for user actions
  const handleEditUser = (userId) => {
    alert(`Edit user ${userId} (Funktion nicht implementiert)`); // Replace with modal
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) { // Replace with custom modal
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      // In real app: await API_deleteUser(userId);
      alert(`Benutzer ${userId} gelöscht (simuliert).`);
    }
  };
  
  const handleAddUser = () => {
    alert('Neuen Benutzer hinzufügen (Funktion nicht implementiert)'); // Replace with modal
  };


  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Benutzerverwaltung</h2>
        
        <div className="flex justify-between items-center mb-6">
            <input 
                type="text"
                placeholder="Suche nach Name oder Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full md:w-1/3"
            />
            <button
                onClick={handleAddUser}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2"
            >
                <PlusCircle size={20} />
                <span>Benutzer hinzufügen</span>
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Keine Benutzer gefunden.</td></tr>
              )}
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 truncate" title={user.id}>{user.id.substring(0,8)}...</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === USER_ROLES.ADMIN ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEditUser(user.id)} className="text-blue-600 hover:text-blue-800 p-1" title="Bearbeiten">
                      <Edit3 size={18} />
                    </button>
                    {/* Prevent deleting oneself or the main admin for safety in mock */}
                    {currentUser?.id !== user.id && user.id !== 'admin1' && (
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800 p-1" title="Löschen">
                        <Trash2 size={18} />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'calendar', 'admin', 'userManagement'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [bookingToEdit, setBookingToEdit] = useState(null); // For editing bookings

  const openBookingModal = (date, booking = null) => {
    setSelectedDateForModal(date);
    setBookingToEdit(booking);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedDateForModal(null);
    setBookingToEdit(null);
  };
  
  // This effect ensures that if a user logs out, they are redirected to the login page.
  // It also handles initial routing if a user is already logged in (though not fully implemented here).
  const { currentUser, loading: authLoading } = useAuth() || {}; // Handle case where useAuth might not be ready
  
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser && currentView !== 'login') {
        setCurrentView('login');
      } else if (currentUser && currentView === 'login') {
        setCurrentView('calendar');
      }
    }
  }, [currentUser, currentView, authLoading, setCurrentView]);


  const renderView = () => {
    if (authLoading) {
      return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    }
    switch (currentView) {
      case 'login':
        return <LoginPage setCurrentView={setCurrentView} />;
      case 'calendar':
        return <CalendarView setCurrentView={setCurrentView} openBookingModal={openBookingModal} />;
      case 'admin':
        return <AdminDashboard setCurrentView={setCurrentView} openBookingModal={openBookingModal} setBookingToEdit={setBookingToEdit} />;
      case 'userManagement':
        return <UserManagementPage setCurrentView={setCurrentView} />;
      default:
        return <LoginPage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <AuthProvider>
      {/* Re-render children of AuthProvider when currentUser changes by using a key or by ensuring consumers like BookingProvider re-evaluate */}
      <BookingProviderWrapper> 
        <div className="min-h-screen bg-gray-50 font-sans">
          <Navbar setCurrentView={setCurrentView} />
          <main>
            {renderView()}
          </main>
          <BookingModal
            isOpen={isModalOpen}
            onClose={closeBookingModal}
            selectedDate={selectedDateForModal}
            bookingToEdit={bookingToEdit}
          />
          <Footer />
        </div>
      </BookingProviderWrapper>
    </AuthProvider>
  );
}

// Wrapper to ensure BookingProvider has access to AuthContext
const BookingProviderWrapper = ({ children }) => {
  const auth = useAuth(); // This will be null on first render of App if AuthProvider is sibling
  if (!auth) return null; // Or a loading indicator
  return <BookingProvider>{children}</BookingProvider>;
};

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
            <p>&copy; {new Date().getFullYear()} Ferienhaus Planer. Alle Rechte vorbehalten.</p>
            <p className="text-xs mt-1">Dies ist eine Demo-Anwendung.</p>
        </footer>
    );
}

// Hinweis zur Struktur und zum Backend:
// Diese React-Anwendung stellt das Frontend dar (APP/frontend/).
// Ein entsprechendes Backend (APP/backend/) würde benötigt, um:
// - Benutzerauthentifizierung zu verwalten (z.B. mit Express, Passport.js)
// - Buchungsdaten in einer MariaDB-Datenbank über Sequelize zu speichern und abzurufen.
// - API-Endpunkte bereitzustellen (z.B. /api/login, /api/bookings, /api/users).
// - Das Backend würde auf Port 5049 laufen, das Frontend (Entwicklungsserver) auf 5050.
// - Für die Produktion würde das Frontend gebaut (npm run build) und statisch vom Backend-Server oder einem Webserver ausgeliefert.
