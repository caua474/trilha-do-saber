import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Users,
  Sparkles,
  ChevronRight,
  Clock,
  Star,
  CheckCircle2,
  BookOpen,
  PenTool,
} from 'lucide-react';

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  change: 'up' | 'down' | 'same';
  changeValue?: number;
  badge: string;
  isCurrentUser?: boolean;
  specialty: string;
  uf: string;
  cidade: string;
  curso: string;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'Lucas Ferreira',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    xp: 2840,
    streak: 18,
    change: 'same',
    badge: '1º Lugar (Ouro)',
    specialty: 'Mestre da Matemática & Redação',
    uf: 'SP',
    cidade: 'São Paulo',
    curso: 'Medicina',
  },
  {
    rank: 2,
    name: 'Mariana Souza',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    xp: 2450,
    streak: 14,
    change: 'up',
    changeValue: 1,
    badge: '2º Lugar (Prata)',
    specialty: 'Fera em Biologia',
    uf: 'RJ',
    cidade: 'Rio de Janeiro',
    curso: 'Medicina',
  },
  {
    rank: 3,
    name: 'Gabriel Costa',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    xp: 2100,
    streak: 12,
    change: 'down',
    changeValue: 1,
    badge: '3º Lugar (Bronze)',
    specialty: 'Gabaritador de História',
    uf: 'MG',
    cidade: 'Belo Horizonte',
    curso: 'Direito',
  },
  {
    rank: 4,
    name: 'Você (Aluno GabaritaAí)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    xp: 1850,
    streak: 10,
    change: 'up',
    changeValue: 2,
    badge: 'Subindo para o Pódio! 🚀',
    isCurrentUser: true,
    specialty: 'Foco em Redação e Física',
    uf: 'SP',
    cidade: 'Campinas',
    curso: 'Medicina',
  },
  {
    rank: 5,
    name: 'Beatriz Lima',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    xp: 1720,
    streak: 9,
    change: 'down',
    changeValue: 1,
    badge: 'TOP 5',
    specialty: 'Especialista em Química',
    uf: 'PR',
    cidade: 'Curitiba',
    curso: 'Engenharia',
  },
  {
    rank: 6,
    name: 'Felipe Rocha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    xp: 1540,
    streak: 7,
    change: 'same',
    badge: 'Liga Diamante',
    specialty: 'Focado em Literatura',
    uf: 'RS',
    cidade: 'Porto Alegre',
    curso: 'Ciência da Computação',
  },
  {
    rank: 7,
    name: 'Camila Alves',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    xp: 1410,
    streak: 6,
    change: 'up',
    changeValue: 3,
    badge: 'Liga Diamante',
    specialty: 'Gabaritando Geografia',
    uf: 'BA',
    cidade: 'Salvador',
    curso: 'Psicologia',
  },
  {
    rank: 8,
    name: 'Rafael Mendes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    xp: 1290,
    streak: 5,
    change: 'down',
    changeValue: 2,
    badge: 'Liga Diamante',
    specialty: 'Mandando bem em Filosofia',
    uf: 'PE',
    cidade: 'Recife',
    curso: 'Direito',
  },
];

interface WeeklyRankingSectionProps {
  onStudyClick?: () => void;
}

export const WeeklyRankingSection: React.FC<WeeklyRankingSectionProps> = ({ onStudyClick }) => {
  const [selectedLeague, setSelectedLeague] = useState<'diamante' | 'ouro' | 'redacao'>('diamante');
  const [selectedUF, setSelectedUF] = useState<string>('Todos');
  const [selectedCurso, setSelectedCurso] = useState<string>('Todos');
  const [searchCidade, setSearchCidade] = useState<string>('');

  // Filter leaderboard users
  const filteredUsers = MOCK_LEADERBOARD.filter((user) => {
    if (selectedUF !== 'Todos' && user.uf !== selectedUF) return false;
    if (selectedCurso !== 'Todos' && user.curso !== selectedCurso) return false;
    if (
      searchCidade.trim() &&
      !user.cidade.toLowerCase().includes(searchCidade.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const top3 = filteredUsers.length >= 3 ? filteredUsers.slice(0, 3) : MOCK_LEADERBOARD.slice(0, 3);
  const currentUser = MOCK_LEADERBOARD.find((u) => u.isCurrentUser);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6">
      {/* Top Header & Countdown Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0 text-2xl">
            🏆
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                Gamificação ENEM
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Reset em 3d 18h
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Ranking Regional e por Curso Pretendido 🗺️
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare seu desempenho por Estado/Cidade e concorra com candidatos do mesmo curso pretendido!
            </p>
          </div>
        </div>

        {/* League selector tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setSelectedLeague('diamante')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              selectedLeague === 'diamante'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>💎 Liga Diamante</span>
          </button>
          <button
            onClick={() => setSelectedLeague('ouro')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              selectedLeague === 'ouro'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🥇 Liga Ouro</span>
          </button>
          <button
            onClick={() => setSelectedLeague('redacao')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              selectedLeague === 'redacao'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>✍️ Liga Redação</span>
          </button>
        </div>
      </div>

      {/* REGIONAL & COURSE FILTERS BAR */}
      <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-500" /> Filtros Regionais e de Carreira:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* State / UF Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Estado (UF):
            </label>
            <select
              value={selectedUF}
              onChange={(e) => setSelectedUF(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="Todos">🇧🇷 Brasil Inteiro (Nacional)</option>
              <option value="SP">SP - São Paulo</option>
              <option value="RJ">RJ - Rio de Janeiro</option>
              <option value="MG">MG - Minas Gerais</option>
              <option value="PR">PR - Paraná</option>
              <option value="RS">RS - Rio Grande do Sul</option>
              <option value="BA">BA - Bahia</option>
              <option value="PE">PE - Pernambuco</option>
              <option value="CE">CE - Ceará</option>
              <option value="DF">DF - Distrito Federal</option>
            </select>
          </div>

          {/* City Search */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Cidade / Município:
            </label>
            <input
              type="text"
              value={searchCidade}
              onChange={(e) => setSearchCidade(e.target.value)}
              placeholder="Ex: São Paulo, Campinas..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Target Course Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Curso Pretendido:
            </label>
            <select
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="Todos">🎓 Todos os Cursos</option>
              <option value="Medicina">🩺 Medicina</option>
              <option value="Direito">⚖️ Direito</option>
              <option value="Engenharia">⚙️ Engenharia</option>
              <option value="Psicologia">🧠 Psicologia</option>
              <option value="Ciência da Computação">💻 Ciência da Computação</option>
            </select>
          </div>
        </div>
      </div>

      {/* PODIUM DISPLAY (1st, 2nd, 3rd) */}
      <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            Pódio da Semana • Liga Diamante
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center space-y-2 order-1">
            <div className="relative">
              <img
                src={top3[1].avatar}
                alt={top3[1].name}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-slate-300 shadow-lg"
              />
              <span className="absolute -top-3 -right-2 w-7 h-7 bg-slate-300 text-slate-950 rounded-full font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
                2º
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[100px] sm:max-w-none">
                {top3[1].name}
              </h4>
              <p className="text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {top3[1].xp} XP
              </p>
            </div>
            {/* Podium step */}
            <div className="w-full h-20 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-300/50">
              <Medal className="w-6 h-6 text-slate-300" />
              <span className="text-[10px] font-black uppercase text-slate-300 mt-1">Prata</span>
            </div>
          </div>

          {/* 1st Place (CENTER & HIGHER) */}
          <div className="flex flex-col items-center space-y-2 order-2 -mt-4">
            <div className="relative">
              <Crown className="w-8 h-8 text-amber-400 fill-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-400 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/30"
              />
              <span className="absolute -top-3 -right-2 w-8 h-8 bg-amber-400 text-slate-950 rounded-full font-black text-sm flex items-center justify-center border-2 border-slate-900 shadow-lg">
                1º
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-sm sm:text-base font-black text-amber-300 truncate max-w-[110px] sm:max-w-none">
                {top3[0].name}
              </h4>
              <p className="text-xs font-mono font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                {top3[0].xp} XP
              </p>
            </div>
            {/* Podium step */}
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-amber-500/30 via-slate-800 to-amber-500/20 rounded-t-2xl flex flex-col items-center justify-center border-t-4 border-amber-400 shadow-inner">
              <Trophy className="w-8 h-8 text-amber-400" />
              <span className="text-[11px] font-black uppercase text-amber-300 mt-1">Campeão</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center space-y-2 order-3">
            <div className="relative">
              <img
                src={top3[2].avatar}
                alt={top3[2].name}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-amber-700 shadow-lg"
              />
              <span className="absolute -top-3 -right-2 w-7 h-7 bg-amber-700 text-white rounded-full font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
                3º
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[100px] sm:max-w-none">
                {top3[2].name}
              </h4>
              <p className="text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {top3[2].xp} XP
              </p>
            </div>
            {/* Podium step */}
            <div className="w-full h-16 sm:h-24 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-700/60">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-[10px] font-black uppercase text-amber-600 mt-1">Bronze</span>
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT USER PROMINENT RANK CARD */}
      {currentUser && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-amber-400/60 dark:border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-md shrink-0">
              #{currentUser.rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Sua Posição Atual
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2 posições hoje
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Faltam apenas <strong className="text-amber-500">250 XP</strong> para entrar no Pódio 🏆
              </h4>
            </div>
          </div>

          <button
            onClick={onStudyClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Ganhar +100 XP Estudando Agora</span>
          </button>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs font-black text-slate-400 uppercase tracking-wider">
          <span>Posição & Estudante</span>
          <span>XP Total & Sequência</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">
              Nenhum estudante encontrado com os filtros selecionados ({selectedUF !== 'Todos' ? `UF: ${selectedUF}` : ''} {selectedCurso !== 'Todos' ? `Curso: ${selectedCurso}` : ''}).
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.rank}
                className={`p-3.5 sm:p-4 flex items-center justify-between transition ${
                  user.isCurrentUser
                    ? 'bg-amber-400/10 dark:bg-amber-400/15 font-bold border-l-4 border-amber-400'
                    : 'hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Rank number & Trend */}
                  <div className="flex items-center space-x-2 w-10 shrink-0">
                    <span
                      className={`text-sm font-black ${
                        user.rank === 1
                          ? 'text-amber-500'
                          : user.rank === 2
                          ? 'text-slate-400'
                          : user.rank === 3
                          ? 'text-amber-700'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      #{user.rank}
                    </span>
                    {user.change === 'up' && (
                      <span title="Subiu no ranking"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /></span>
                    )}
                    {user.change === 'down' && (
                      <span title="Caiu no ranking"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /></span>
                    )}
                    {user.change === 'same' && (
                      <span title="Manteve posição"><Minus className="w-3.5 h-3.5 text-slate-400" /></span>
                    )}
                  </div>

                  {/* Avatar */}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />

                  {/* User info & Location badges */}
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        📍 {user.cidade} - {user.uf}
                      </span>
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        🎓 {user.curso}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs mt-0.5">
                      {user.specialty}
                    </p>
                  </div>
                </div>

                {/* XP & Streak */}
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{user.xp} XP</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span>{user.streak} dias seguidos</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GAMIFICATION XP RULES FOOTER */}
      <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
        <h5 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> Como Funciona a Pontuação de XP no GabaritaAí?
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400 font-medium">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block">+100 XP</strong> por Ciclo de Estudo concluído
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block">+150 XP</strong> por Redação Corrigida no ENEM
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block">+50 XP</strong> por Rodada de Flashcards
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block">+30 XP</strong> por Estudo Diário (Streak)
          </div>
        </div>
      </div>
    </div>
  );
};
