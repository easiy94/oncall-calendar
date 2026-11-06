import { useState, useEffect } from 'react';

const INITIAL_TEAMS = {
  arany: {
    name: 'Arany Csapat',
    members: [
      { id: '1', name: 'Kovács Péter', phone: '+36 30 123 4567', color: '#f59e0b' },
      { id: '2', name: 'Nagy Anna', phone: '+36 20 987 6543', color: '#10b981' },
    ],
    assignments: {}
  }
};

export default function App() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [currentTeamId, setCurrentTeamId] = useState('arany');
  const [loading, setLoading] = useState(true);

  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('#3b82f6');

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  // Adatok betöltése a saját Express szerverünkről
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.teams) setTeams(data.teams);
        if (data.currentTeamId) setCurrentTeamId(data.currentTeamId);
        setLoading(false);
      })
      .catch(err => {
        console.error('Hiba az adatok letöltésekor:', err);
        setLoading(false);
      });
  }, []);

  // Adatok mentése a szerverre
  const syncWithServer = (updatedTeams, updatedTeamId) => {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: updatedTeams, currentTeamId: updatedTeamId })
    }).catch(err => console.error('Hiba a mentés során:', err));
  };

  const activeTeam = teams[currentTeamId] || { name: 'Ismeretlen', members: [], assignments: {} };

  const handleTeamChange = (newId) => {
    setCurrentTeamId(newId);
    syncWithServer(teams, newId);
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const teamKey = 'team_' + Date.now();
    const updatedTeams = {
      ...teams,
      [teamKey]: { name: newTeamName.trim(), members: [], assignments: {} }
    };

    setTeams(updatedTeams);
    setCurrentTeamId(teamKey);
    setNewTeamName('');
    setIsAddingTeam(false);
    syncWithServer(updatedTeams, teamKey);
  };

  const handleDeleteCurrentTeam = () => {
    if (Object.keys(teams).length <= 1) {
      alert('Nem törölheted az utolsó megmaradt csoportot!');
      return;
    }

    if (window.confirm(`Biztosan törölni szeretnéd a(z) "${activeTeam.name}" csoportot?`)) {
      const updatedTeams = { ...teams };
      delete updatedTeams[currentTeamId];
      const nextTeamId = Object.keys(updatedTeams)[0];

      setTeams(updatedTeams);
      setCurrentTeamId(nextTeamId);
      syncWithServer(updatedTeams, nextTeamId);
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      color: newMemberColor,
    };

    const updatedTeams = {
      ...teams,
      [currentTeamId]: {
        ...activeTeam,
        members: [...activeTeam.members, newMember]
      }
    };

    setTeams(updatedTeams);
    setNewMemberName('');
    setNewMemberPhone('');
    syncWithServer(updatedTeams, currentTeamId);
  };

  const handleDeleteMember = (memberId) => {
    const updatedMembers = activeTeam.members.filter(m => m.id !== memberId);
    const updatedAssignments = { ...activeTeam.assignments };
    Object.keys(updatedAssignments).forEach(dateKey => {
      if (updatedAssignments[dateKey] === memberId) delete updatedAssignments[dateKey];
    });

    const updatedTeams = {
      ...teams,
      [currentTeamId]: { ...activeTeam, members: updatedMembers, assignments: updatedAssignments }
    };

    setTeams(updatedTeams);
    syncWithServer(updatedTeams, currentTeamId);
  };

  const handleAssignMember = (memberId) => {
    if (!selectedDateStr) return;
    const updatedAssignments = { ...activeTeam.assignments };

    if (memberId === null) delete updatedAssignments[selectedDateStr];
    else updatedAssignments[selectedDateStr] = memberId;

    const updatedTeams = {
      ...teams,
      [currentTeamId]: { ...activeTeam, assignments: updatedAssignments }
    };

    setTeams(updatedTeams);
    setSelectedDateStr(null);
    syncWithServer(updatedTeams, currentTeamId);
  };

  // Naptár navigáció
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; 

  const monthNames = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június', 
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayOnCallMemberId = activeTeam.assignments ? activeTeam.assignments[todayStr] : null;
  const todayOnCallMember = activeTeam.members.find(m => m.id === todayOnCallMemberId);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">Betöltés...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Fejléc */}
        <header className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-indigo-400">Készenléti Beosztás</h1>
              
              <select 
                value={currentTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="bg-slate-900 text-indigo-300 font-semibold border border-indigo-500/40 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                {Object.keys(teams).map(key => (
                  <option key={key} value={key}>{teams[key].name}</option>
                ))}
              </select>

              <button
                onClick={() => setIsAddingTeam(!isAddingTeam)}
                className="bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500/30 transition-colors cursor-pointer"
              >
                + Új csoport
              </button>
            </div>

            {isAddingTeam && (
              <form onSubmit={handleAddTeam} className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  placeholder="Új csoport neve..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer">
                  Mentés
                </button>
              </form>
            )}
            <p className="text-slate-400 text-sm">Aktív csoport: <span className="text-indigo-300 font-medium">{activeTeam.name}</span></p>
          </div>

          {/* Mai Készenlétes */}
          <div className="bg-slate-900/80 border border-slate-700/80 px-5 py-3 rounded-xl flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">MA:</span>
            {todayOnCallMember ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: todayOnCallMember.color }}></span>
                  <span className="font-semibold text-slate-100">{todayOnCallMember.name}</span>
                </div>
                {todayOnCallMember.phone && (
                  <a href={`tel:${todayOnCallMember.phone}`} className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-mono">
                    {todayOnCallMember.phone}
                  </a>
                )}
              </div>
            ) : (
              <span className="text-sm italic text-amber-400/90">Nincs kijelölve</span>
            )}
          </div>
        </header>

        {/* Fő tartalom grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bal oldalsáv: Tagok kezelése */}
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-xl space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">{activeTeam.name} tagjai</h2>
              {Object.keys(teams).length > 1 && (
                <button
                  onClick={handleDeleteCurrentTeam}
                  className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-lg cursor-pointer"
                >
                  Csoport törlése
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeTeam.members.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Nincsenek tagok.</p>
              ) : (
                activeTeam.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }}></span>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                      {member.phone && <span className="text-xs text-slate-400 pl-6 font-mono">{member.phone}</span>}
                    </div>
                    <button onClick={() => handleDeleteMember(member.id)} className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 cursor-pointer">
                      Törlés
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 pt-3 border-t border-slate-700">
              <input 
                type="text" placeholder="Tag neve..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <input 
                type="tel" placeholder="Telefonszám..." value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Jelölő szín:</label>
                <input type="color" value={newMemberColor} onChange={(e) => setNewMemberColor(e.target.value)} className="w-8 h-8 bg-transparent rounded cursor-pointer border border-slate-700" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-sm cursor-pointer shadow-lg shadow-indigo-600/25">
                + Tag hozzáadása
              </button>
            </form>
          </div>

          {/* Jobb oldal: Naptár */}
          <div className="md:col-span-2 bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">{currentYear}. {monthNames[currentMonth]}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-sm cursor-pointer">&lt; Előző</button>
                <button onClick={handleNextMonth} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-sm cursor-pointer">Következő &gt;</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 border-b border-slate-700 pb-2">
              <div>Hé</div><div>Ke</div><div>Sze</div><div>Csü</div><div>Pé</div><div>Szo</div><div>Va</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startOffset }).map((_, index) => (
                <div key={`offset-${index}`} className="h-16 sm:h-20 rounded-xl bg-slate-900/20 border border-slate-800/40 opacity-30"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const assignedMemberId = activeTeam.assignments ? activeTeam.assignments[dateStr] : null;
                const assignedMember = activeTeam.members.find(m => m.id === assignedMemberId);
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-16 sm:h-20 p-2 rounded-xl border flex flex-col justify-between items-start text-left transition-all hover:scale-[1.02] cursor-pointer ${
                      isToday ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/10' : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-500'
                    }`}
                  >
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                      {dayNumber}
                    </span>
                    {assignedMember && (
                      <div className="w-full text-xs font-medium px-2 py-1 rounded-lg truncate text-slate-900 shadow-sm" style={{ backgroundColor: assignedMember.color }}>
                        {assignedMember.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Kiválasztó Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Beosztás: <span className="text-indigo-400">{selectedDateStr}</span></h3>
            <p className="text-xs text-indigo-300">Csoport: {activeTeam.name}</p>
            <div className="space-y-2">
              {activeTeam.members.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleAssignMember(member.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-left font-medium cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }}></span>
                  <div className="flex flex-col">
                    <span>{member.name}</span>
                    {member.phone && <span className="text-xs text-slate-400 font-mono">{member.phone}</span>}
                  </div>
                </button>
              ))}
              {activeTeam.assignments?.[selectedDateStr] && (
                <button onClick={() => handleAssignMember(null)} className="w-full p-2 text-center text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer">
                  Készenlét törlése erről a napról
                </button>
              )}
            </div>
            <button onClick={() => setSelectedDateStr(null)} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 rounded-xl text-sm cursor-pointer">
              Mégse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}