import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Users,
  DollarSign,
  Clock,
  ArrowLeft,
  Crown,
  Key,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AuthUser } from '../types';
import { getSupabaseClient } from '../services/authService';

interface PendingPayment {
  id: string;
  email: string;
  name: string;
  comprovanteNome?: string;
  amount: number;
  pixKey?: string;
  date: string;
  status: 'pending_approval' | 'approved' | 'rejected';
}

interface AdminApprovalPanelProps {
  onGoBack?: () => void;
  authUser?: AuthUser | null;
}

const AUTHORIZED_ADMIN_EMAIL = 'cauafffelipedacosta@gmail.com';

export const AdminApprovalPanel: React.FC<AdminApprovalPanelProps> = ({
  onGoBack,
  authUser,
}) => {
  // Autenticação administrativa
  const [adminPin, setAdminPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Se o usuário logado for exatamente a conta oficial do administrador
    if (authUser?.email && authUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
      return true;
    }
    // Ou se já tiver autenticado na sessão atual
    return sessionStorage.getItem('menteup_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Dados do painel
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Ativação manual avulsa
  const [manualEmail, setManualEmail] = useState('');
  const [isActivatingManual, setIsActivatingManual] = useState(false);

  // Carregar lista de pagamentos pendentes do servidor
  const fetchPendingPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/pending-pix?adminEmail=${encodeURIComponent(
          authUser?.email || AUTHORIZED_ADMIN_EMAIL
        )}&adminSecret=MENTEUP2026`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.payments) {
          setPayments(data.payments);
        }
      }
    } catch (err) {
      console.error('[Admin Panel] Erro ao buscar pagamentos pendentes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Redirecionamento estrito: Se o usuário logado NÃO for o administrador oficial, redireciona imediatamente para a página inicial
    if (authUser?.email && authUser.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/');
      }
      onGoBack?.();
    }
  }, [authUser, onGoBack]);

  useEffect(() => {
    // Validação automática de sessão Supabase para a conta oficial
    const client = getSupabaseClient();
    if (client) {
      client.auth.getUser().then(({ data }) => {
        if (data?.user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
          setIsAuthenticated(true);
          sessionStorage.setItem('menteup_admin_auth', 'true');
        } else if (data?.user?.email) {
          // Outro usuário logado no Supabase: redireciona para a home
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', '/');
          }
          onGoBack?.();
        }
      }).catch(() => {});
    }
  }, [onGoBack]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingPayments();
      const interval = setInterval(fetchPendingPayments, 10000); // Polling suave a cada 10s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handler de login administrativo
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (
      authUser?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL ||
      adminPin.trim() === 'MENTEUP2026' ||
      adminPin.trim() === 'admin123'
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('menteup_admin_auth', 'true');
    } else {
      setAuthError('Chave administrativa incorreta ou conta não autorizada.');
    }
  };

  // Handler para Aprovar Pro Vitalício
  const handleApprovePro = async (targetEmail: string, studentName?: string) => {
    try {
      const res = await fetch('/api/admin/approve-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          adminEmail: authUser?.email || AUTHORIZED_ADMIN_EMAIL,
          adminSecret: 'MENTEUP2026',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(`✅ Acesso Pro Vitalício ativado com sucesso para ${targetEmail}!`);
        setTimeout(() => setActionMessage(null), 5000);
        fetchPendingPayments();
      } else {
        alert(data.error || 'Erro ao aprovar Pro.');
      }
    } catch {
      alert('Falha de conexão com o servidor.');
    }
  };

  // Handler para Revogar Pro
  const handleRevokePro = async (targetEmail: string) => {
    if (!window.confirm(`Tem certeza que deseja revogar o Pro de ${targetEmail}?`)) return;

    try {
      const res = await fetch('/api/admin/revoke-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          adminEmail: authUser?.email || AUTHORIZED_ADMIN_EMAIL,
          adminSecret: 'MENTEUP2026',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(`⚠️ Pro revogado para ${targetEmail}.`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchPendingPayments();
      }
    } catch {
      alert('Falha ao revogar Pro.');
    }
  };

  // Ativação manual rápida
  const handleManualActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    setIsActivatingManual(true);
    await handleApprovePro(manualEmail.trim());
    setManualEmail('');
    setIsActivatingManual(false);
  };

  // Filtragem de pagamentos
  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.email.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.comprovanteNome && p.comprovanteNome.toLowerCase().includes(q))
    );
  });

  const pendingCount = payments.filter((p) => p.status === 'pending_approval').length;
  const approvedCount = payments.filter((p) => p.status === 'approved').length;
  const estimatedRevenue = approvedCount * 5.0;

  // TELA DE ACESSO BLOQUEADO (Se não for o administrador)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Painel de Aprovações MenteUp
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acesso restrito exclusivamente à conta administradora autorizada (
              <strong className="text-amber-300 font-mono">{AUTHORIZED_ADMIN_EMAIL}</strong>).
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Chave Mestra de Administrador:
              </label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Insira a chave mestra (MENTEUP2026)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Painel de Controle</span>
            </button>
          </form>

          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              Voltar ao aplicativo do estudante
            </button>
          )}
        </div>
      </div>
    );
  }

  // PAINEL ADMINISTRATIVO DESBLOQUEADO
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Barra Superior / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Crown className="w-7 h-7 fill-amber-300 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  Painel de Aprovações Pix • MenteUp Pro
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerencie pedidos Pix de R$ 5,00, aprove acessos vitalícios e audite pagamentos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={fetchPendingPayments}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Recarregar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            {onGoBack && (
              <button
                type="button"
                onClick={onGoBack}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao App</span>
              </button>
            )}
          </div>
        </div>

        {/* Mensagem de Ação Realizada */}
        {actionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Pagamentos Pendentes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{pendingCount}</div>
            <p className="text-[11px] text-slate-400">Aguardando confirmação bancária</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Acessos Vitalícios Ativos</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{approvedCount}</div>
            <p className="text-[11px] text-slate-400">Alunos com Pro liberado</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Faturamento Estimado</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-400">
              R$ {estimatedRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-[11px] text-slate-400">R$ 5,00 por acesso único</p>
          </div>
        </div>

        {/* Ativação Manual Rápida por E-mail */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Ativação Manual Direta</h3>
          </div>
          <form onSubmit={handleManualActivation} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="Digite o e-mail do estudante para liberar o Pro Vitalício..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isActivatingManual || !manualEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs transition cursor-pointer disabled:opacity-50 shrink-0 shadow-md flex items-center justify-center gap-1.5"
            >
              {isActivatingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Liberar Pro Imediatamente</span>
            </button>
          </form>
        </div>

        {/* Tabela de Pedidos Pix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white">Fila de Conferência Pix</h3>
              <p className="text-xs text-slate-400">
                Confira o extrato do seu banco e aprove os alunos que enviaram o comprovante.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 space-y-2 border border-dashed border-slate-800 rounded-xl">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400">Nenhum pagamento na fila no momento.</p>
              <p className="text-xs text-slate-500">
                Assim que um estudante enviar o comprovante Pix, o pedido aparecerá aqui para aprovação.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                    <th className="py-3 px-3">Estudante</th>
                    <th className="py-3 px-3">Nome no Comprovante</th>
                    <th className="py-3 px-3">Valor</th>
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.map((p) => {
                    const isPending = p.status === 'pending_approval';
                    const isApproved = p.status === 'approved';

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white">{p.name || 'Estudante'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.email}</div>
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-amber-300">
                          {p.comprovanteNome || '—'}
                        </td>

                        <td className="py-3.5 px-3 font-bold text-white">
                          R$ {Number(p.amount || 5.0).toFixed(2).replace('.', ',')}
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {new Date(p.date).toLocaleString('pt-BR')}
                        </td>

                        <td className="py-3.5 px-3">
                          {isApproved ? (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Aprovado Pro
                            </span>
                          ) : isPending ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pendente
                            </span>
                          ) : (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Recusado
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => handleApprovePro(p.email, p.name)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
                                title="Aprovar Pro Vitalício"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRevokePro(p.email)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 text-xs font-semibold transition cursor-pointer"
                                title="Revogar acesso Pro"
                              >
                                Revogar
                              </button>
                            )}

                            {/* Link de WhatsApp com o Aluno */}
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `Olá ${p.name || ''}! Aqui é o administrador do MenteUp a respeito do seu Pix de R$ 5,00.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalPanel;
