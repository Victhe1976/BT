import React, { useState, useEffect } from 'react';
import { Player, Match } from './types';
import { TABS } from './constants';
import PlayerManager from './components/PlayerManager';
import MatchRegistry from './components/MatchRegistry';
import MatchHistory from './components/MatchHistory';
import RankingDashboard from './components/RankingDashboard';
import ImportHistory from './components/ImportHistory';
import { RacketIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.PLAYERS);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingPlayers, setPendingPlayers] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem('bt_players');
      const storedMatches = localStorage.getItem('bt_matches');
      if (storedPlayers) {
        setPlayers(JSON.parse(storedPlayers));
      }
      if (storedMatches) {
        setMatches(JSON.parse(storedMatches));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bt_players', JSON.stringify(players));
    } catch (error) {
      console.error("Failed to save players to localStorage", error);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem('bt_matches', JSON.stringify(matches));
    } catch (error) {
      console.error("Failed to save matches to localStorage", error);
    }
  }, [matches]);

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...player,
      id: Date.now().toString(),
    };
    setPlayers(prev => [...prev, newPlayer]);
    setPendingPlayers(prev => prev.filter(pName => pName.toLowerCase() !== newPlayer.name.toLowerCase()));
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setMatches(prev => prev.filter(m => 
      !m.teamA.players.includes(playerId) && !m.teamB.players.includes(playerId)
    ));
  };
  
  const addMatches = (newMatches: Match[]) => {
    setMatches(prev => {
      let maxId = prev.reduce((max, m) => Math.max(max, m.dayId), 0);
      
      const processedNewMatches = newMatches.map(match => {
        // Assign new ID only if it's from an import (dayId=0)
        if (match.dayId === 0) {
          maxId++;
          return { ...match, dayId: maxId };
        }
        return match; // Keep existing dayId (from MatchRegistry)
      });

      const combined = [...prev, ...processedNewMatches];
      
      combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.dayId - b.dayId);
      
      return combined;
    });
  };


  const renderContent = () => {
    switch (activeTab) {
      case TABS.PLAYERS:
        return <PlayerManager 
          players={players}
          pendingPlayers={pendingPlayers}
          addPlayer={addPlayer} 
          updatePlayer={updatePlayer}
          deletePlayer={deletePlayer}
        />;
      case TABS.REGISTER_MATCH:
        return <MatchRegistry 
          players={players} 
          matches={matches} 
          addMatches={addMatches}
        />;
      case TABS.MATCH_HISTORY:
        return <MatchHistory matches={matches} players={players} />;
      case TABS.RANKING:
        return <RankingDashboard matches={matches} players={players} />;
      case TABS.IMPORT:
        return <ImportHistory
          players={players}
          matches={matches}
          setPlayers={setPlayers}
          addMatches={addMatches}
          setPendingPlayers={setPendingPlayers}
          setActiveTab={setActiveTab}
        />
      default:
        return <PlayerManager 
          players={players} 
          pendingPlayers={pendingPlayers}
          addPlayer={addPlayer} 
          updatePlayer={updatePlayer}
          deletePlayer={deletePlayer}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg shadow-cyan-500/10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <RacketIcon className="h-8 w-8 text-cyan-400" />
              <h1 className="ml-3 text-2xl font-bold tracking-tight text-white">BT dos Parça</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {Object.values(TABS).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-5 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-slate-700 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {Object.values(TABS).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === tab
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Built by a world-class senior frontend React engineer.</p>
      </footer>
    </div>
  );
};

export default App;