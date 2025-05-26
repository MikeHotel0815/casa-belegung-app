import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react'; 
import { ChevronLeft, ChevronRight, CalendarDays, UserCircle, LogIn, LogOut, PlusCircle, Edit3, Trash2, Home, Users, Mail, Phone, KeyRound, BarChart3, ListChecks } from 'lucide-react';

// Constants
const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin',
};

const BOOKING_STATUS = {
  RESERVED: 'reserved',
  CONFIRMED: 'confirmed',
  ANFRAGE: 'anfrage', 
};

// Holiday Data for Hessen 2025
const HESSEN_HOLIDAYS_2025 = {
  public: [
    { date: "2025-01-01", name: "Neujahr" },
    { date: "2025-04-18", name: "Karfreitag" },
    { date: "2025-04-21", name: "Ostermontag" },
    { date: "2025-05-01", name: "Tag der Arbeit" },
    { date: "2025-05-29", name: "Christi Himmelfahrt" },
    { date: "2025-06-09", name: "Pfingstmontag" },
    { date: "2025-06-19", name: "Fronleichnam" },
    { date: "2025-10-03", name: "Tag der Deutschen Einheit" },
    { date: "2025-12-25", name: "1. Weihnachtstag" },
    { date: "2025-12-26", name: "2. Weihnachtstag" },
  ],
  school: [ 
    { startDate: "2025-04-07", endDate: "2025-04-21", name: "Osterferien" },
    { startDate: "2025-07-07", endDate: "2025-08-15", name: "Sommerferien" },
    { startDate: "2025-10-06", endDate: "2025-10-18", name: "Herbstferien" },
    { startDate: "2025-12-22", endDate: "2026-01-10", name: "Weihnachtsferien" }, 
  ]
};


// Mock Data
const MOCK_USERS_INITIAL = [ 
  { id: 'user1', name: 'Max Mustermann', email: 'max@example.com', password: 'password123', role: USER_ROLES.USER, phone: '01701234567' },
  { id: 'user2', name: 'Erika Musterfrau', email: 'erika@example.com', password: 'password123', role: USER_ROLES.USER, phone: '01701234568' },
  { id: 'user3', name: 'Erwin Mustermann', email: 'erwin@example.com', password: 'password123', role: USER_ROLES.USER, phone: '01701234569' },
  { id: 'admin1', name: 'Admina Administrator', email: 'admin@example.com', password: 'adminpassword', role: USER_ROLES.ADMIN, phone: '01609876543' },
];

const MOCK_INITIAL_BOOKINGS = [
  { id: 'booking1', originalRequestId: 'req_initial_1', userId: 'user1', userName: 'Max Mustermann', startDate: '2025-07-10', endDate: '2025-07-15', status: BOOKING_STATUS.CONFIRMED, propertyId: 'ferienhaus1' },
];

// Helper: Parse YYYY-MM-DD string to local Date object (midnight)
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  // Month is 0-indexed in JavaScript Date
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
};

// Helper: Format Date object to YYYY-MM-DD string (local)
const formatDateToYYYYMMDD = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


// Context for Authentication
const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(MOCK_USERS_INITIAL); 

  useEffect(() => { 
    setTimeout(() => { 
        setLoading(false); 
    }, 200); 
  }, []);
  
  const login = useCallback(async (email, password) => { 
    setLoading(true); 
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password); 
        if (user) { 
          setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }); 
          resolve(user); 
        } else { 
          reject(new Error('Ungültige Anmeldedaten.')); 
        }
        setLoading(false);
      }, 500);
    });
  }, [users]); 

  const logout = useCallback(() => { 
    setCurrentUser(null); 
  }, []); 
  
  const addUser = useCallback((newUser) => { 
    const userWithId = { ...newUser, id: `user${Date.now()}` };
    setUsers(prevUsers => [...prevUsers, userWithId]);
    return userWithId;
  }, []);

  const updateUser = useCallback((userId, updatedData) => { 
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, ...updatedData } : user));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
  }, [currentUser]); 

  const deleteUser = useCallback((userId) => { 
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    if (currentUser && currentUser.id === userId) {
        logout(); 
    }
  }, [currentUser, logout]); 


  const authContextValue = useMemo(() => ({ 
    currentUser, 
    login, 
    logout, 
    loading, 
    users, 
    addUser, 
    updateUser, 
    deleteUser 
  }), [currentUser, loading, users, login, logout, addUser, updateUser, deleteUser]);

  return (<AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>);
};
const useAuth = () => useContext(AuthContext);

// Context for Bookings
const BookingContext = createContext(null);
const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(MOCK_INITIAL_BOOKINGS);

  const addBooking = useCallback(async (bookingDetails) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { startDate: reqStartStr, endDate: reqEndStr, userId, userName, status: initialRequestedStatus } = bookingDetails;
            const reqStartDate = parseDateString(reqStartStr);
            const reqEndDate = parseDateString(reqEndStr);

            if (!reqStartDate || !reqEndDate || reqEndDate < reqStartDate) {
                console.error("Invalid date range for new booking.");
                resolve([]); 
                return;
            }
            
            const requestedStatus = initialRequestedStatus || BOOKING_STATUS.RESERVED;
            const newBookingSegmentsData = [];
            let currentSegmentStartDate = null;
            let currentSegmentStatus = null;
            const originalRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; 

            for (let dayIter = new Date(reqStartDate); dayIter <= reqEndDate; dayIter.setDate(dayIter.getDate() + 1)) {
                const currentDay = new Date(dayIter); 
                currentDay.setHours(0,0,0,0);
                let dayStatusForNewBooking = requestedStatus;

                const existingBookingsOnThisDay = bookings.filter(b => {
                    if (b.status === BOOKING_STATUS.ANFRAGE && b.userId === userId) return false; 
                    if (b.status === BOOKING_STATUS.ANFRAGE) return false; 
                    
                    const existingStart = parseDateString(b.startDate);
                    const existingEnd = parseDateString(b.endDate);
                    return currentDay >= existingStart && currentDay <= existingEnd;
                });

                if (existingBookingsOnThisDay.length > 0) {
                    dayStatusForNewBooking = BOOKING_STATUS.ANFRAGE;
                }

                if (currentSegmentStartDate === null) { 
                    currentSegmentStartDate = new Date(currentDay);
                    currentSegmentStatus = dayStatusForNewBooking;
                } else if (dayStatusForNewBooking !== currentSegmentStatus) { 
                    newBookingSegmentsData.push({
                        startDate: formatDateToYYYYMMDD(currentSegmentStartDate),
                        endDate: formatDateToYYYYMMDD(new Date(currentDay.getTime() - 86400000)), 
                        status: currentSegmentStatus,
                        userId, userName, propertyId: 'ferienhaus1',
                        originalRequestId, 
                    });
                    currentSegmentStartDate = new Date(currentDay); 
                    currentSegmentStatus = dayStatusForNewBooking;
                }
            }
            
            if (currentSegmentStartDate !== null) {
                newBookingSegmentsData.push({
                    startDate: formatDateToYYYYMMDD(currentSegmentStartDate),
                    endDate: formatDateToYYYYMMDD(reqEndDate), 
                    status: currentSegmentStatus,
                    userId, userName, propertyId: 'ferienhaus1',
                    originalRequestId, 
                });
            }
            
            const newBookingsToAdd = newBookingSegmentsData.map(segment => ({
                ...segment,
                id: `booking_${segment.status}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, 
            }));

            setBookings(prev => [...prev, ...newBookingsToAdd]);
            resolve(newBookingsToAdd);
        }, 500);
    });
  }, [bookings]); 

  const updateBookingContext = useCallback(async (bookingId, updates) => new Promise(resolve => setTimeout(() => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b)); resolve(true);
  }, 500)), []); 

  const deleteBookingFromContext = useCallback(async (bookingIdToDelete) => { 
    return new Promise(resolve => setTimeout(() => {
      setBookings(prevBookings => {
        const bookingToDelete = prevBookings.find(b => b.id === bookingIdToDelete);
        if (bookingToDelete && bookingToDelete.originalRequestId) {
          return prevBookings.filter(b => b.originalRequestId !== bookingToDelete.originalRequestId);
        } else {
          return prevBookings.filter(b => b.id !== bookingIdToDelete);
        }
      });
      resolve(true);
    }, 500));
  }, []); 

  const bookingContextValue = useMemo(() => ({ 
    bookings, 
    addBooking, 
    updateBooking: updateBookingContext, 
    deleteBooking: deleteBookingFromContext, 
    setBookings 
  }), [bookings, addBooking, updateBookingContext, deleteBookingFromContext]); 

  return (<BookingContext.Provider value={bookingContextValue}>{children}</BookingContext.Provider>);
};
const useBookings = () => useContext(BookingContext);

// Helper Functions
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;


// Components
const LoadingSpinner = () => (<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>);

const Navbar = ({ setCurrentView }) => {
  const { currentUser, logout: authLogout } = useAuth();
  const handleLogout = () => { authLogout(); setCurrentView('login'); };
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView(currentUser ? 'calendar' : 'login')}>
            <Home size={28} /><h1 className="text-xl font-bold">Ferienhaus Planer</h1>
        </div>
        <div className="space-x-2 sm:space-x-4 flex items-center">
          {currentUser && (
            <>
              <button onClick={() => setCurrentView('calendar')} className="hover:bg-blue-700 px-2 py-2 sm:px-3 rounded-md flex items-center space-x-1 text-sm sm:text-base"><CalendarDays size={20}/> <span>Kalender</span></button>
              <button onClick={() => setCurrentView('statistics')} className="hover:bg-blue-700 px-2 py-2 sm:px-3 rounded-md flex items-center space-x-1 text-sm sm:text-base"><BarChart3 size={20}/> <span>Statistik</span></button>
              {currentUser.role === USER_ROLES.ADMIN && (
                <>
                  <button onClick={() => setCurrentView('bookingListAdmin')} className="hover:bg-blue-700 px-2 py-2 sm:px-3 rounded-md flex items-center space-x-1 text-sm sm:text-base"><ListChecks size={20}/> <span>Buchungsübersicht</span></button>
                  <button onClick={() => setCurrentView('userManagement')} className="hover:bg-blue-700 px-2 py-2 sm:px-3 rounded-md flex items-center space-x-1 text-sm sm:text-base"><Users size={20}/> <span className="hidden sm:inline">Benutzer</span></button>
                </>
              )}
            </>
          )}
          {currentUser ? (
            <>
              <span className="text-sm hidden md:inline">Salve, {currentUser.name.split(' ')[0]}!</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-2 py-2 sm:px-3 rounded-md flex items-center space-x-1 text-sm sm:text-base"><LogOut size={20}/> <span className="hidden sm:inline">Logout</span></button>
            </>
          ) : (<button onClick={() => setCurrentView('login')} className="bg-green-500 hover:bg-green-600 px-2 py-2 sm:px-3 rounded-md flex items-center space-x-1 text-sm sm:text-base"><LogIn size={20}/> <span>Login</span></button>)}
        </div>
      </div>
    </nav>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try { await login(email, password); } 
    catch (err) { setError(err.message || 'Login fehlgeschlagen.'); } 
    finally { setIsLoading(false); }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6"><UserCircle size={64} className="text-blue-500" /></div>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Login</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="ihre@email.de"/></div>
          <div><label htmlFor="password" className="block text-sm font-medium text-gray-600">Passwort</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ihr Passwort"/></div>
          <div><button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">{isLoading ? 'Anmelden...' : 'Anmelden'}</button></div>
        </form>
      </div>
      <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-md w-full max-w-md">
        <p className="font-semibold">Test-Anmeldedaten:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Benutzer: <code className="bg-gray-200 text-gray-800 px-1 rounded">max@example.com</code> / <code className="bg-gray-200 text-gray-800 px-1 rounded">password123</code></li>
          <li>Admin: <code className="bg-gray-200 text-gray-800 px-1 rounded">admin@example.com</code> / <code className="bg-gray-200 text-gray-800 px-1 rounded">adminpassword</code></li>
        </ul>
      </div>
    </div>
  );
};

const CalendarView = ({ selectionStart, selectionEnd, onDateClick, handleOpenNewBookingModal, handleBookingIndicatorClick }) => { 
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); 
  const { bookings } = useBookings(); 
  const { currentUser, loading: authLoading } = useAuth(); 

  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth(); 

  const daysInMonthCount = getDaysInMonth(year, month);
  let firstDayPos = getFirstDayOfMonth(year, month);
  firstDayPos = firstDayPos === 0 ? 6 : firstDayPos -1; 

  const monthDays = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const leadingEmptyDays = Array.from({ length: firstDayPos });

  const handlePrevMonth = () => { setCurrentDisplayDate(new Date(year, month - 1, 1)); };
  const handleNextMonth = () => { setCurrentDisplayDate(new Date(year, month + 1, 1)); };

  const getBookingsForCellDisplay = (dateStr) => bookings.filter(b => {
    const current = parseDateString(dateStr);
    const bookingStart = parseDateString(b.startDate);
    const bookingEnd = parseDateString(b.endDate);
    if (!current || !bookingStart || !bookingEnd) return false;
    return current >= bookingStart && current <= bookingEnd;
  }).sort((a,b) => { 
    if (a.status === BOOKING_STATUS.ANFRAGE && b.status !== BOOKING_STATUS.ANFRAGE) return 1;
    if (a.status !== BOOKING_STATUS.ANFRAGE && b.status === BOOKING_STATUS.ANFRAGE) return -1;
    return 0;
  });

  const getPublicHoliday = (dateStr) => {
    if (parseDateString(dateStr)?.getFullYear() !== 2025) return null;
    return HESSEN_HOLIDAYS_2025.public.find(h => h.date === dateStr);
  };

  const getSchoolHoliday = (dateStr) => {
    const currentDate = parseDateString(dateStr);
    if (!currentDate) return null;
    return HESSEN_HOLIDAYS_2025.school.find(h => {
        const start = parseDateString(h.startDate);
        const end = parseDateString(h.endDate);
        if (!start || !end) return false;
        const adjustedEnd = (h.name === "Weihnachtsferien" && end.getFullYear() > year) ? new Date(year, 11, 31) : end;
        const adjustedStart = (h.name === "Weihnachtsferien" && start.getFullYear() < year) ? new Date(year, 0, 1) : start;
        return currentDate >= adjustedStart && currentDate <= adjustedEnd;
    });
  };


  if (authLoading) return <LoadingSpinner />; 
  if (!currentUser) return null; 

  const today = new Date();
  today.setHours(0,0,0,0); 

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft size={28} className="text-blue-500" /></button>
          <h2 className="text-2xl font-bold text-blue-600">{currentDisplayDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight size={28} className="text-blue-500" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (<div key={day} className="py-2 text-xs sm:text-base">{day}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {leadingEmptyDays.map((_, index) => (<div key={`empty-${index}`} className="border rounded-md min-h-[7rem] sm:min-h-[7.5rem] md:min-h-[8rem]"></div>))}
          {monthDays.map(day => {
            const dayDateObj = new Date(year, month, day);
            dayDateObj.setHours(0,0,0,0); 
            const dayDateStr = formatDateToYYYYMMDD(dayDateObj);
            const dayBookings = getBookingsForCellDisplay(dayDateStr); 
            const isBookedSolid = dayBookings.some(b => b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.RESERVED);
            const publicHoliday = getPublicHoliday(dayDateStr);
            const schoolHoliday = getSchoolHoliday(dayDateStr);
            const isPastDate = dayDateObj < today;
            
            let baseCellStyle = isBookedSolid ? 'bg-rose-50' : 'bg-green-50'; 
            if (!isPastDate) { 
                baseCellStyle += isBookedSolid ? ' hover:bg-rose-100' : ' hover:bg-green-100';
            }
            if (isPastDate) {
                baseCellStyle = 'bg-gray-100 text-gray-400 cursor-not-allowed'; // Paler background for past dates
            }
            
            let selectionStyle = '';
            const selectionStartDateObj = parseDateString(selectionStart);
            const selectionEndDateObj = parseDateString(selectionEnd);

            if (!isPastDate) { 
                if (selectionStartDateObj && dayDateObj.getTime() === selectionStartDateObj.getTime()) {
                selectionStyle = 'bg-blue-200 ring-2 ring-blue-500 hover:bg-blue-300'; 
                } else if (selectionEndDateObj && dayDateObj.getTime() === selectionEndDateObj.getTime()) {
                selectionStyle = 'bg-blue-200 ring-2 ring-blue-500 hover:bg-blue-300';
                } else if (selectionStartDateObj && selectionEndDateObj && dayDateObj > selectionStartDateObj && dayDateObj < selectionEndDateObj) {
                selectionStyle = 'bg-blue-100 hover:bg-blue-200';
                } else if (selectionStartDateObj && !selectionEndDateObj && dayDateObj.getTime() === selectionStartDateObj.getTime()) {
                selectionStyle = 'bg-blue-200 ring-2 ring-blue-500 hover:bg-blue-300';
                }
            }
            
            const finalCellStyle = selectionStyle || baseCellStyle;

            let tooltipText = '';
            if (publicHoliday) tooltipText += publicHoliday.name;
            if (schoolHoliday) tooltipText += (tooltipText ? ' / ' : '') + schoolHoliday.name;
            dayBookings.forEach(b => {tooltipText += (tooltipText ? ' | ' : '') + `${b.userName} (${b.status})`});
            if (isPastDate) tooltipText = "Vergangenes Datum";


            const schoolHolidayBandColor = schoolHoliday ? 'bg-gray-200' : ''; 
            const schoolHolidayTextColor = schoolHoliday ? 'text-gray-600' : '';


            return (
              <div
                key={day}
                className={`relative border rounded-md min-h-[7rem] sm:min-h-[7.5rem] md:min-h-[8rem] p-1 sm:p-2 flex flex-col ${isPastDate ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors duration-150 ${finalCellStyle} overflow-hidden`}
                onClick={() => onDateClick(dayDateStr)} 
                title={tooltipText || dayDateStr} 
              >
                <div className="flex-grow"> 
                    <span className={`font-medium text-sm sm:text-base ${isBookedSolid && !isPastDate ? 'text-rose-700' : !isPastDate ? 'text-green-700' : 'text-gray-400'} ${publicHoliday && !isPastDate ? 'text-purple-700 font-bold' : ''}`}>{day}</span>
                    
                    {!isPastDate && publicHoliday && (
                    <div className="text-xs text-purple-600 truncate mt-0.5" title={publicHoliday.name}>
                        {publicHoliday.name.substring(0,10)}{publicHoliday.name.length > 10 ? '...' : ''}
                    </div>
                    )}

                    {!isPastDate && <div className="mt-1 space-y-0.5"> 
                        {dayBookings.map(booking => {
                            let bookingStyle = '';
                            let statusIndicator = '';
                            switch(booking.status) {
                                case BOOKING_STATUS.CONFIRMED: 
                                    bookingStyle = 'bg-rose-600 text-white'; statusIndicator = 'B'; break;
                                case BOOKING_STATUS.RESERVED: 
                                    bookingStyle = 'bg-yellow-500 text-black'; statusIndicator = 'R'; break;
                                case BOOKING_STATUS.ANFRAGE: 
                                    bookingStyle = 'bg-orange-400 text-orange-800'; statusIndicator = 'A'; break;
                                default: bookingStyle = 'bg-gray-400 text-white';
                            }
                            return (
                                <div 
                                  key={booking.id} 
                                  className={`text-xs p-0.5 sm:p-1 rounded-sm truncate ${bookingStyle} hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleBookingIndicatorClick(booking); 
                                  }}
                                >
                                    {booking.userName.split(' ')[0]} ({statusIndicator})
                                </div>
                            );
                        })}
                    </div>}
                </div>
                
                {!isPastDate && schoolHoliday && (
                  <div 
                    className={`absolute bottom-0 left-0 w-full h-7 flex items-center justify-center px-1 ${schoolHolidayBandColor} opacity-90`} 
                    title={schoolHoliday.name}
                  >
                    <span className={`truncate text-xs ${schoolHolidayTextColor}`}>{schoolHoliday.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-sm">
                {selectionStart && !selectionEnd && <p className="text-blue-600">Startdatum: <strong>{selectionStart}</strong>. Bitte Enddatum auswählen.</p>}
                {selectionStart && selectionEnd && <p className="text-green-600">Ausgewählter Zeitraum: <strong>{selectionStart}</strong> bis <strong>{selectionEnd}</strong></p>}
            </div>
            <button 
                onClick={handleOpenNewBookingModal} 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2 w-full sm:w-auto"
            >
                <PlusCircle size={20} /><span>Buchung ohne Vorauswahl</span>
            </button>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, initialStartDate, initialEndDate, bookingToEdit, onDeleteBooking, initialOverallStartDate, initialOverallEndDate }) => { 
  const { currentUser, users: allUsers } = useAuth(); 
  const { addBooking, updateBooking, bookings: allBookingsFromContext } = useBookings(); 
  const [displayStartDate, setDisplayStartDate] = useState('');
  const [displayEndDate, setDisplayEndDate] = useState('');  
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');  

  const [userIdForBooking, setUserIdForBooking] = useState('');
  const [status, setStatus] = useState(BOOKING_STATUS.RESERVED); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const availableUsersForBooking = useMemo(() => allUsers.filter(u => u.role === USER_ROLES.USER), [allUsers]);
  const isGroupEdit = useMemo(() => bookingToEdit && bookingToEdit.originalRequestId, [bookingToEdit]);


  useEffect(() => {
    if (bookingToEdit) {
        if (isGroupEdit && initialOverallStartDate && initialOverallEndDate) {
            setDisplayStartDate(initialOverallStartDate);
            setDisplayEndDate(initialOverallEndDate);
        } else {
            setDisplayStartDate(bookingToEdit.startDate);
            setDisplayEndDate(bookingToEdit.endDate);
        }
        setActualStartDate(bookingToEdit.startDate); 
        setActualEndDate(bookingToEdit.endDate);
        setStatus(bookingToEdit.status); 
        setUserIdForBooking(bookingToEdit.userId); 
    } else { 
      setDisplayStartDate(initialStartDate || '');
      setDisplayEndDate(initialEndDate || '');
      setActualStartDate(initialStartDate || '');
      setActualEndDate(initialEndDate || '');
      setStatus(currentUser?.role === USER_ROLES.ADMIN ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.RESERVED);
      if (currentUser?.role !== USER_ROLES.ADMIN && currentUser) {
        setUserIdForBooking(currentUser.id);
      } else { setUserIdForBooking(''); }
    }
  }, [isOpen, initialStartDate, initialEndDate, bookingToEdit, currentUser, isGroupEdit, initialOverallStartDate, initialOverallEndDate]);

  const isDateRangeAvailable = useCallback((start, end, excludeBookingId = null) => { 
    if (!start || !end) return true; 
    const newStart = parseDateString(start); 
    const newEnd = parseDateString(end);
    if (!newStart || !newEnd) return true;

    if (!allBookingsFromContext) return true; 

    for (const booking of allBookingsFromContext) { 
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      if (bookingToEdit && booking.id === bookingToEdit.id && booking.status === BOOKING_STATUS.ANFRAGE) {
          if (start === bookingToEdit.startDate && end === bookingToEdit.endDate) continue;
      }
      if (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.RESERVED) {
        const existingStart = parseDateString(booking.startDate);
        const existingEnd = parseDateString(booking.endDate);
        if (!existingStart || !existingEnd) continue;
        if (newStart <= existingEnd && newEnd >= existingStart) return false;
      }
    }
    return true;
  }, [allBookingsFromContext, bookingToEdit]); 

  const validateDates = (start, end) => {
    if (!start || !end) { setError('Bitte Start- und Enddatum auswählen.'); return false; }
    if (parseDateString(end) < parseDateString(start)) { setError('Das Enddatum darf nicht vor dem Startdatum liegen.'); return false; }
    
    if (!bookingToEdit) { 
        const today = new Date();
        today.setHours(0,0,0,0);
        if (parseDateString(start) < today) {
            setError('Das Startdatum darf nicht in der Vergangenheit liegen.');
            return false;
        }
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); 
    
    const submitStartDate = bookingToEdit ? actualStartDate : displayStartDate;
    const submitEndDate = bookingToEdit ? actualEndDate : displayEndDate;

    if (!validateDates(submitStartDate, submitEndDate)) { setIsLoading(false); return; }
    
    if (bookingToEdit && status !== BOOKING_STATUS.ANFRAGE && !isDateRangeAvailable(submitStartDate, submitEndDate, bookingToEdit.id)) {
        setError('Der geänderte Zeitraum überschneidet sich mit einer anderen bestätigten/reservierten Buchung.');
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    let finalUserId, finalUserName;
    if (currentUser?.role === USER_ROLES.ADMIN) {
      if (!userIdForBooking) { setError('Als Admin bitte einen Benutzer für die Buchung auswählen.'); setIsLoading(false); return; }
      finalUserId = userIdForBooking;
      const selUser = allUsers.find(u => u.id === userIdForBooking); 
      finalUserName = selUser ? selUser.name : 'Unbek. Benutzer';
    } else if (currentUser) { 
      finalUserId = currentUser.id; 
      finalUserName = currentUser.name; 
    } else { 
      setError('Sie müssen angemeldet sein, um zu buchen.'); 
      setIsLoading(false); return; 
    }
    
    const bookingData = { 
        userId: finalUserId, 
        userName: finalUserName, 
        startDate: submitStartDate, 
        endDate: submitEndDate, 
        status 
    };
    
    try {
      if (bookingToEdit) { 
        const segmentUpdateData = { 
            status, 
            userId: userIdForBooking, 
            userName: allUsers.find(u => u.id === userIdForBooking)?.name || bookingToEdit.userName,
            startDate: actualStartDate, 
            endDate: actualEndDate,
        };
        await updateBooking(bookingToEdit.id, segmentUpdateData); 
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

  const handleDeleteClick = () => {
    if (bookingToEdit && onDeleteBooking) {
        console.warn(`TODO: Custom confirmation for deleting booking ${bookingToEdit.id}`);
        const confirmed = true; 
        if (confirmed) {
             onDeleteBooking(bookingToEdit.id); 
        }
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
            {bookingToEdit ? `Segment bearbeiten (${bookingToEdit.status})` : 'Neue Buchung'}
        </h3>
        {isGroupEdit && bookingToEdit && (
            <p className="text-xs text-gray-500 mb-2">
                Teil der ursprünglichen Anfrage: {displayStartDate} bis {displayEndDate}. Änderungen gelten nur für dieses Segment.
            </p>
        )}
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentUser?.role === USER_ROLES.ADMIN && (
            <div><label htmlFor="userSelect" className="block text-sm font-medium text-gray-600">Benutzer</label>
              <select 
                id="userSelect" 
                value={userIdForBooking} 
                onChange={(e) => setUserIdForBooking(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="">-- Benutzer wählen --</option>
                {availableUsersForBooking.map(user => ( <option key={user.id} value={user.id}>{user.name} ({user.email})</option> ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">
                {isGroupEdit && bookingToEdit ? 'Start (Segment)' : 'Startdatum'}
            </label>
            <input 
                type="date" id="startDate" 
                value={isGroupEdit && bookingToEdit ? actualStartDate : displayStartDate} 
                onChange={(e) => {
                    const newDate = e.target.value;
                    if (!(isGroupEdit && bookingToEdit)) setDisplayStartDate(newDate);
                    setActualStartDate(newDate); 
                }}
                required 
                readOnly={isGroupEdit && !!bookingToEdit} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-600">
                 {isGroupEdit && bookingToEdit ? 'Ende (Segment)' : 'Enddatum'}
            </label>
            <input 
                type="date" id="endDate" 
                value={isGroupEdit && bookingToEdit ? actualEndDate : displayEndDate} 
                onChange={(e) => {
                    const newDate = e.target.value;
                    if (!(isGroupEdit && bookingToEdit)) setDisplayEndDate(newDate);
                    setActualEndDate(newDate);
                }}
                required 
                readOnly={isGroupEdit && !!bookingToEdit} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          
          {/* Status field logic */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
            <select 
              id="status" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading || (bookingToEdit && bookingToEdit.status === BOOKING_STATUS.ANFRAGE && currentUser?.role !== USER_ROLES.ADMIN)}
            >
              {/* Admin can choose any status, or if editing a confirmed/reserved booking */}
              {(currentUser?.role === USER_ROLES.ADMIN || (bookingToEdit && (status === BOOKING_STATUS.CONFIRMED || status === BOOKING_STATUS.RESERVED))) && (
                  <>
                    <option value={BOOKING_STATUS.CONFIRMED}>Bestätigt</option>
                    <option value={BOOKING_STATUS.RESERVED}>Reserviert</option>
                  </>
              )}
              {/* Always show "Anfrage" if it's the current status or if admin is editing */}
              {( (bookingToEdit && status === BOOKING_STATUS.ANFRAGE) || currentUser?.role === USER_ROLES.ADMIN ) && (
                  <option value={BOOKING_STATUS.ANFRAGE}>Anfrage</option>
              )}
              
              {/* For new bookings by non-admin, status is determined by logic, show default */}
               {!bookingToEdit && currentUser?.role !== USER_ROLES.ADMIN && (
                  <option value={BOOKING_STATUS.RESERVED} disabled>Reserviert (Standard)</option>
               )}
            </select>
            {!bookingToEdit && currentUser?.role !== USER_ROLES.ADMIN && (
                <p className="text-xs text-gray-500 mt-1">Ihr Wunschstatus ist 'Reserviert'. Bei Überschneidungen wird 'Anfrage' erstellt.</p>
            )}
             {bookingToEdit && bookingToEdit.status === BOOKING_STATUS.ANFRAGE && currentUser?.role !== USER_ROLES.ADMIN && (
                <p className="text-xs text-gray-500 mt-1">Dies ist eine Anfrage. Nur ein Admin kann den Status ändern.</p>
            )}
          </div>


          <div className="flex justify-between items-center pt-2">
            <div>
                {bookingToEdit && (currentUser?.role === USER_ROLES.ADMIN || currentUser?.id === bookingToEdit.userId) && (
                    <button 
                        type="button" 
                        onClick={handleDeleteClick}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        Löschen
                    </button>
                )}
            </div>
            <div className="flex space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Abbrechen</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">{isLoading ? 'Speichern...' : (bookingToEdit ? 'Speichern' : 'Erstellen')}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ handleOpenNewBookingModal, handleOpenEditBookingModal }) => {
  const { bookings, deleteBooking: deleteBookingFromCtx, updateBooking } = useBookings(); 
  const { currentUser, loading: authLoading } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState(''); const [filterStatus, setFilterStatus] = useState('');

  if (authLoading) return <LoadingSpinner />; if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) return null; 

  const filteredBookings = bookings
    .filter(b => b.userName.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase()) || (b.originalRequestId && b.originalRequestId.includes(searchTerm)))
    .filter(b => filterStatus ? b.status === filterStatus : true)
    .sort((a,b) => parseDateString(a.startDate).getTime() - parseDateString(b.startDate).getTime());
  
  const handleDelete = async (bookingId) => { 
    console.warn(`TODO: Custom confirmation modal for deleting booking ${bookingId}`); if (true) await deleteBookingFromCtx(bookingId); 
  }; 
  const handleChangeStatus = async (bookingId, newStatus) => await updateBooking(bookingId, { status: newStatus }); 

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input type="text" placeholder="Suche Name/ID/RequestID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="">Alle Status</option>
            <option value={BOOKING_STATUS.RESERVED}>Reserviert</option>
            <option value={BOOKING_STATUS.CONFIRMED}>Bestätigt</option>
            <option value={BOOKING_STATUS.ANFRAGE}>Anfrage</option> 
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{['Segment ID', 'Orig. Req. ID', 'Benutzer', 'Start', 'Ende', 'Status', 'Aktionen'].map(h => (<th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 && (<tr><td colSpan="7" className="text-center py-4 text-gray-500">Keine Buchungen.</td></tr>)}
              {filteredBookings.map(b => (<tr key={b.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 truncate" title={b.id}>{b.id.substring(b.id.lastIndexOf('_') + 1)}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 truncate" title={b.originalRequestId}>{b.originalRequestId ? b.originalRequestId.substring(4, 13) + '...' : '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{b.userName}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{b.startDate}</td><td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{b.endDate}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm">
                  <select value={b.status} onChange={(e) => handleChangeStatus(b.id, e.target.value)}
                      className={`p-1 rounded-md text-xs ${
                        b.status === BOOKING_STATUS.CONFIRMED ? 'bg-green-100 text-green-700' :
                        b.status === BOOKING_STATUS.RESERVED ? 'bg-yellow-100 text-yellow-700' :
                        b.status === BOOKING_STATUS.ANFRAGE ? 'bg-orange-100 text-orange-700' : '' 
                      }`}>
                    <option value={BOOKING_STATUS.RESERVED}>Reserviert</option>
                    <option value={BOOKING_STATUS.CONFIRMED}>Bestätigt</option>
                    <option value={BOOKING_STATUS.ANFRAGE}>Anfrage</option>
                  </select>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium space-x-1 sm:space-x-2">
                  <button onClick={() => handleOpenEditBookingModal(b)} className="p-1 text-blue-600 hover:text-blue-800" title="Bearbeiten"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1 text-red-600 hover:text-red-800" title="Löschen"><Trash2 size={18}/></button>
                </td></tr>))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end"><button onClick={() => handleOpenNewBookingModal(null)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"><PlusCircle size={20}/><span>Neue Buchung</span></button></div>
      </div>
    </div>
  );
};

const UserModal = ({ isOpen, onClose, userToEdit, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState(USER_ROLES.USER);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name || '');
            setEmail(userToEdit.email || '');
            setPhone(userToEdit.phone || '');
            setRole(userToEdit.role || USER_ROLES.USER);
            setPassword(''); 
        } else { 
            setName(''); setEmail(''); setPassword(''); setPhone(''); setRole(USER_ROLES.USER);
        }
        setError(''); 
    }, [isOpen, userToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name || !email) { setError('Name und Email sind Pflichtfelder.'); return; }
        if (!userToEdit && !password) { setError('Passwort ist für neue Benutzer ein Pflichtfeld.'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Bitte eine gültige Email-Adresse eingeben.'); return; }
        
        setIsLoading(true);
        const userData = { name, email, phone, role };
        if (password) { 
            userData.password = password;
        }

        try {
            await onSave(userData, userToEdit ? userToEdit.id : null);
            onClose();
        } catch (err) {
            setError(err.message || 'Fehler beim Speichern des Benutzers.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-6 text-gray-700">{userToEdit ? 'Benutzer bearbeiten' : 'Neuen Benutzer hinzufügen'}</h3>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-600">Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserCircle className="h-5 w-5 text-gray-400" /></div>
                            <input type="text" id="userName" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Max Mustermann"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-600">Email</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                            <input type="email" id="userEmail" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="max@example.com"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userPassword" className="block text-sm font-medium text-gray-600">Passwort {userToEdit ? '(leer lassen, um nicht zu ändern)' : ''}</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                            <input type="password" id="userPassword" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Mind. 6 Zeichen"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userPhone" className="block text-sm font-medium text-gray-600">Telefon (optional)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                            <input type="tel" id="userPhone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="0123456789"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userRole" className="block text-sm font-medium text-gray-600">Rolle</label>
                        <select id="userRole" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value={USER_ROLES.USER}>Benutzer</option>
                            <option value={USER_ROLES.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Abbrechen</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                            {isLoading ? 'Speichern...' : (userToEdit ? 'Änderungen speichern' : 'Benutzer erstellen')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UserManagementPage = ({ openUserModal, setUserToEditGlobal }) => { 
  const { currentUser, users, deleteUser, loading: authLoading } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  
  if (authLoading) return <LoadingSpinner />; 
  if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) return null; 

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditUser = (user) => { 
    setUserToEditGlobal(user); 
    openUserModal(); 
  };

  const handleDeleteUser = async (userId) => { 
    console.warn(`TODO: Custom confirmation modal for deleting user ${userId}`); 
    if (true) { 
        try {
            await deleteUser(userId); 
        } catch (error) {
            console.error("Fehler beim Löschen des Benutzers:", error);
        }
    }
  };
  
  const handleAddUser = () => { 
    setUserToEditGlobal(null); 
    openUserModal(); 
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Benutzerverwaltung</h2>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input type="text" placeholder="Suche Name/Email/Telefon..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full sm:w-1/2 md:w-1/3"/>
          <button onClick={handleAddUser} className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center space-x-2 w-full sm:w-auto"><PlusCircle size={20}/><span>Benutzer hinzufügen</span></button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{['Name','Email','Telefon', 'Rolle','Aktionen'].map(h=>(<th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 && (<tr><td colSpan="5" className="text-center py-4 text-gray-500">Keine Benutzer.</td></tr>)}
              {filteredUsers.map(u => (<tr key={u.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{u.phone || '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role===USER_ROLES.ADMIN ? 'bg-red-100 text-red-800':'bg-blue-100 text-blue-800'}`}>{u.role}</span></td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium space-x-1 sm:space-x-2">
                  <button onClick={()=>handleEditUser(u)} className="p-1 text-blue-600 hover:text-blue-800" title="Bearbeiten"><Edit3 size={18}/></button>
                  {currentUser?.id!==u.id && u.id!=='admin1' && (<button onClick={()=>handleDeleteUser(u.id)} className="p-1 text-red-600 hover:text-red-800" title="Löschen"><Trash2 size={18}/></button>)}
                </td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// New Component for Occupancy Statistics
const OccupancyStatsPage = () => {
    const { bookings } = useBookings();
    const { currentUser, loading: authLoading } = useAuth();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear); 

    const yearsForSelect = useMemo(() => {
        const uniqueYears = new Set();
        bookings.forEach(b => {
            uniqueYears.add(parseDateString(b.startDate).getFullYear());
            uniqueYears.add(parseDateString(b.endDate).getFullYear());
        });
        uniqueYears.add(currentYear -1);
        uniqueYears.add(currentYear);
        uniqueYears.add(currentYear + 1);
        return Array.from(uniqueYears).sort((a,b) => a - b);
    }, [bookings, currentYear]);


    const occupancyData = useMemo(() => {
        if (!bookings.length) return { bookedDays: 0, totalDaysInYear: isLeapYear(selectedYear) ? 366 : 365, percentage: 0 };

        const totalDaysInYear = isLeapYear(selectedYear) ? 366 : 365;
        const bookedDaySet = new Set();

        bookings.forEach(booking => {
            if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.RESERVED) {
                return;
            }
            
            let currentIterDate = parseDateString(booking.startDate);
            const bookingEndDate = parseDateString(booking.endDate);

            if (!currentIterDate || !bookingEndDate) return;

            while (currentIterDate <= bookingEndDate) {
                if (currentIterDate.getFullYear() === selectedYear) {
                    bookedDaySet.add(formatDateToYYYYMMDD(currentIterDate));
                }
                currentIterDate.setDate(currentIterDate.getDate() + 1);
            }
        });
        
        const bookedDays = bookedDaySet.size;
        const percentage = totalDaysInYear > 0 ? (bookedDays / totalDaysInYear) * 100 : 0;
        return { bookedDays, totalDaysInYear, percentage: parseFloat(percentage.toFixed(2)) };

    }, [bookings, selectedYear]);

    if (authLoading) return <LoadingSpinner />;
    if (!currentUser) return null; 

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">Belegungsstatistik</h2>
                
                <div className="mb-6">
                    <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700 mb-1">Jahr auswählen:</label>
                    <select 
                        id="yearSelect"
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        {yearsForSelect.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-lg text-gray-600">Ausgewähltes Jahr:</span>
                        <span className="text-lg font-semibold text-blue-600">{selectedYear}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg text-gray-600">Belegte Tage (Bestätigt/Reserviert):</span>
                        <span className="text-lg font-semibold text-blue-600">{occupancyData.bookedDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg text-gray-600">Tage im Jahr:</span>
                        <span className="text-lg font-semibold text-blue-600">{occupancyData.totalDaysInYear}</span>
                    </div>
                    <hr className="my-4"/>
                    <div className="flex justify-between items-center">
                        <span className="text-xl text-gray-700 font-semibold">Auslastung:</span>
                        <span className="text-2xl font-bold text-green-600">{occupancyData.percentage}%</span>
                    </div>
                </div>
                 <div className="mt-6 text-xs text-gray-500">
                    <p>* Die Statistik berücksichtigt alle bestätigten und reservierten Tage innerhalb eines Buchungszeitraums, die in das ausgewählte Jahr fallen. 'Anfragen' werden nicht als belegt gezählt.</p>
                </div>
            </div>
        </div>
    );
};


export default function App() {
  return (<AuthProvider><BookingProviderWrapper><AppContent /></BookingProviderWrapper></AuthProvider>);
}

const AppContent = () => {
  const [currentView, setCurrentView] = useState('login');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalParams, setBookingModalParams] = useState({ 
      startDate: null, 
      endDate: null, 
      bookingToEdit: null,
      overallStartDate: null, 
      overallEndDate: null 
  });
  const [selectionStart, setSelectionStart] = useState(null); 
  const [selectionEnd, setSelectionEnd] = useState(null);   
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const { currentUser, loading: authLoading, addUser, updateUser } = useAuth(); 
  const { bookings, deleteBooking } = useBookings(); 


  useEffect(() => {
    if (authLoading) return; 
    const protectedViews = ['calendar', 'admin', 'userManagement', 'statistics', 'bookingListAdmin']; 
    const adminViews = ['admin', 'userManagement', 'bookingListAdmin'];
    if (currentUser) {
      if (currentView === 'login') { setCurrentView('calendar'); } 
      else if (adminViews.includes(currentView) && currentUser.role !== USER_ROLES.ADMIN) { setCurrentView('calendar'); }
    } else { if (protectedViews.includes(currentView)) { setCurrentView('login'); } }
  }, [currentUser, currentView, authLoading, setCurrentView]);

  const getBookingsOnDate = useCallback((dateStr) => {  
    return bookings.filter(b => { 
        const current = parseDateString(dateStr);
        const bookingStart = parseDateString(b.startDate);
        const bookingEnd = parseDateString(b.endDate);
        if (!current || !bookingStart || !bookingEnd) return false;
        return current >= bookingStart && current <= bookingEnd;
    });
  }, [bookings]); 
  
  const handleBookingIndicatorClick = useCallback((bookingSegment) => { 
    handleOpenEditBookingModal(bookingSegment);
  }, [bookings]); // Added bookings as handleOpenEditBookingModal uses it

  const handleCalendarDateClick = useCallback((dateStr) => {
    const clickedDateObj = parseDateString(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (clickedDateObj < today) {
        console.warn("Vergangene Daten können nicht ausgewählt oder bearbeitet werden.");
        setSelectionStart(null); 
        setSelectionEnd(null);
        return; 
    }
    
    if (!selectionStart) {
        setSelectionStart(dateStr); 
        setSelectionEnd(null);
    } else { 
        const currentSelectionStart = parseDateString(selectionStart);
        let finalStartDate = selectionStart; 
        let finalEndDate = dateStr;
        if (clickedDateObj < currentSelectionStart) { 
            finalStartDate = dateStr; 
            finalEndDate = selectionStart; 
        }
        setSelectionEnd(finalEndDate); 
        if (finalStartDate !== selectionStart) { 
            setSelectionStart(finalStartDate); 
        }
        setBookingModalParams({ 
            startDate: finalStartDate, 
            endDate: finalEndDate, 
            bookingToEdit: null,
            overallStartDate: finalStartDate, 
            overallEndDate: finalEndDate 
        });
        setIsBookingModalOpen(true);
    }
  }, [selectionStart, setSelectionStart, setSelectionEnd, setBookingModalParams, setIsBookingModalOpen]);

  const handleOpenNewBookingModal = useCallback((booking = null) => { 
    const isEditing = !!booking;
    let overallStart = booking ? booking.startDate : null;
    let overallEnd = booking ? booking.endDate : null;

    if (isEditing && booking.originalRequestId) {
        const relatedSegments = bookings.filter(b => b.originalRequestId === booking.originalRequestId);
        if (relatedSegments.length > 0) {
            const startDates = relatedSegments.map(s => parseDateString(s.startDate)).filter(d => d);
            const endDates = relatedSegments.map(s => parseDateString(s.endDate)).filter(d => d);
            if (startDates.length > 0) {
                overallStart = formatDateToYYYYMMDD(new Date(Math.min(...startDates.map(d => d.getTime()))));
            }
            if (endDates.length > 0) {
                overallEnd = formatDateToYYYYMMDD(new Date(Math.max(...endDates.map(d => d.getTime()))));
            }
        }
    }

    setSelectionStart(isEditing ? null : (booking ? booking.startDate : null)); 
    setSelectionEnd(isEditing ? null : (booking ? booking.endDate : null));
    setBookingModalParams({ 
        startDate: booking ? booking.startDate : null, 
        endDate: booking ? booking.endDate : null, 
        bookingToEdit: booking,
        overallStartDate: overallStart,
        overallEndDate: overallEnd
    });
    setIsBookingModalOpen(true);
  }, [bookings, setSelectionStart, setSelectionEnd, setBookingModalParams, setIsBookingModalOpen]);

  const handleOpenEditBookingModal = useCallback((bookingSegment) => { 
    let overallStart = bookingSegment.startDate;
    let overallEnd = bookingSegment.endDate;

    if (bookingSegment.originalRequestId) {
        const relatedSegments = bookings.filter(b => b.originalRequestId === bookingSegment.originalRequestId);
        if (relatedSegments.length > 0) {
            const startDates = relatedSegments.map(s => parseDateString(s.startDate)).filter(d => d);
            const endDates = relatedSegments.map(s => parseDateString(s.endDate)).filter(d => d);
             if (startDates.length > 0) {
                overallStart = formatDateToYYYYMMDD(new Date(Math.min(...startDates.map(d => d.getTime()))));
            }
            if (endDates.length > 0) {
                overallEnd = formatDateToYYYYMMDD(new Date(Math.max(...endDates.map(d => d.getTime()))));
            }
        }
    }
    
    setSelectionStart(null); setSelectionEnd(null);
    setBookingModalParams({ 
      startDate: bookingSegment.startDate, 
      endDate: bookingSegment.endDate,   
      bookingToEdit: bookingSegment,
      overallStartDate: overallStart,    
      overallEndDate: overallEnd         
    });
    setIsBookingModalOpen(true);
  }, [bookings, setSelectionStart, setSelectionEnd, setBookingModalParams, setIsBookingModalOpen]);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false); setSelectionStart(null); setSelectionEnd(null);
    setBookingModalParams({ startDate: null, endDate: null, bookingToEdit: null, overallStartDate: null, overallEndDate: null });
  }, [setIsBookingModalOpen, setSelectionStart, setSelectionEnd, setBookingModalParams]);

  const handleDeleteBookingInModal = useCallback(async (bookingId) => {
    console.warn(`TODO: Implement custom confirmation modal for deleting booking segment ${bookingId} from BookingModal`);
    if (true) { 
        try {
            await deleteBooking(bookingId); 
            closeBookingModal(); 
        } catch (error) {
            console.error("Fehler beim Löschen des Buchungssegments im Modal:", error);
        }
    }
  }, [deleteBooking, closeBookingModal]);

  const openUserModal = useCallback(() => setIsUserModalOpen(true), [setIsUserModalOpen]);
  const closeUserModal = useCallback(() => { setIsUserModalOpen(false); setUserToEdit(null); }, [setIsUserModalOpen, setUserToEdit]);
  
  const handleSaveUser = useCallback(async (userData, userIdToUpdate) => {
    if (userIdToUpdate) { 
        await updateUser(userIdToUpdate, userData);
    } else { 
        await addUser(userData);
    }
  }, [addUser, updateUser]);
  
  const renderView = () => {
    if (authLoading && !currentUser) { return <LoadingSpinner />; }
    switch (currentView) {
      case 'login': return <LoginPage />;
      case 'calendar': return <CalendarView 
                                selectionStart={selectionStart} 
                                selectionEnd={selectionEnd} 
                                onDateClick={handleCalendarDateClick} 
                                handleOpenNewBookingModal={() => handleOpenNewBookingModal()} 
                                handleBookingIndicatorClick={handleBookingIndicatorClick} 
                             />;
      case 'admin': 
      case 'bookingListAdmin': 
                return <AdminDashboard 
                            handleOpenNewBookingModal={() => handleOpenNewBookingModal(null)} 
                            handleOpenEditBookingModal={handleOpenEditBookingModal} 
                        />;
      case 'userManagement': return <UserManagementPage openUserModal={openUserModal} setUserToEditGlobal={setUserToEdit} />;
      case 'statistics': return <OccupancyStatsPage />;
      default: return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <Navbar setCurrentView={setCurrentView} />
        <main className="flex-grow">{renderView()}</main>
        <BookingModal 
            isOpen={isBookingModalOpen} 
            onClose={closeBookingModal} 
            initialStartDate={bookingModalParams.startDate} 
            initialEndDate={bookingModalParams.endDate}
            bookingToEdit={bookingModalParams.bookingToEdit}
            onDeleteBooking={handleDeleteBookingInModal} 
            initialOverallStartDate={bookingModalParams.overallStartDate} 
            initialOverallEndDate={bookingModalParams.overallEndDate}
            />
        <UserModal isOpen={isUserModalOpen} onClose={closeUserModal} userToEdit={userToEdit} onSave={handleSaveUser} />
        <Footer />
    </div>
  );
};

const BookingProviderWrapper = ({ children }) => {
  const auth = useAuth(); 
  if (auth === null) { return <LoadingSpinner />; }
  return <BookingProvider>{children}</BookingProvider>;
};

const Footer = () => (<footer className="bg-gray-800 text-white text-center p-4 mt-auto"><p>&copy; {new Date().getFullYear()} Casa Regno Dei Cieli.</p></footer>);

