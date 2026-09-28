import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, X, CheckCircle2, Lock, ArrowRight, ExternalLink } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy';

interface TermsAndPrivacyModalProps {
  initialTab?: LegalTab;
  onClose: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                {activeTab === 'terms' ? (
                  <FileText className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Shield className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {activeTab === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
                </h3>
                <p className="text-xs text-slate-400">
                  MenteUp • Atualizado em Setembro de 2026
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/50 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Termos de Uso</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Política de Privacidade (LGPD)</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed custom-scrollbar">
            {activeTab === 'terms' ? (
              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-indigo-400">1.</span> Objeto e Finalidade da Plataforma
                  </h4>
                  <p className="text-slate-300 text-xs">
                    O <strong>MenteUp</strong> é uma plataforma digital inteligente de apoio pedagógico desenvolvida para auxiliar estudantes na preparação para o <strong>Exame Nacional do Ensino Médio (ENEM)</strong> e vestibulares nacionais. O serviço oferece simulados calibrados com algoritmo TRI, flashcards com repetição espaçada, correção assistida de redação e tutoria com inteligência artificial pela <strong>Professora Gabi</strong>.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-indigo-400">2.</span> Cadastro, Acesso e Segurança da Conta
                  </h4>
                  <p className="text-slate-300 text-xs">
                    Para usufruir de todos os recursos personalizados, o usuário deve fornecer um endereço de e-mail válido e definir uma senha de segurança com no mínimo 6 caracteres. O acesso requer confirmação do endereço de e-mail por código ou link de ativação enviado para sua caixa postal. O usuário é o único responsável pela guarda e confidencialidade de suas credenciais de acesso.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-indigo-400">3.</span> Uso de Inteligência Artificial e Limitações
                  </h4>
                  <p className="text-slate-300 text-xs">
                    Os recursos da <strong>Professora Gabi</strong> e correções de redação utilizam modelos de inteligência artificial generativa avançados (Google Gemini). Embora treinados com rigor pedagógico e alinhamento à matriz de competências do INEP, as orientações servem como ferramenta complementar de estudo e não substituem o currículo formal de instituições de ensino.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-indigo-400">4.</span> Planos de Assinatura e Cancelamento
                  </h4>
                  <p className="text-slate-300 text-xs">
                    O MenteUp disponibiliza acesso gratuito a simulados e ferramentas diárias, bem como o <strong>Plano MenteUp Pro (R$ 5,00 / mês)</strong>. O plano Pro não possui fidelidade, carência ou taxa de rescisão, podendo ser cancelado a qualquer instante pelo painel de configurações da conta sem cobranças adicionais.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-indigo-400">5.</span> Propriedade Intelectual e Conduta
                  </h4>
                  <p className="text-slate-300 text-xs">
                    É vedada a cópia não autorizada, engenharia reversa, redistribuição em massa de questões ou uso de bots maliciosos que afetem a estabilidade e integridade da plataforma e da comunidade de estudantes.
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-4">
                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-emerald-400">1.</span> Compromisso com a Privacidade e LGPD
                  </h4>
                  <p className="text-slate-300 text-xs">
                    O MenteUp respeita integralmente a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>. Coletamos estritamente os dados necessários para o fornecimento do serviço educacional, personalização de planos de estudo e cálculo de estatísticas de aprovação.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-emerald-400">2.</span> Dados Coletados e Sua Finalidade
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    <li><strong>Dados Cadastrais:</strong> Nome e endereço de e-mail utilizados para autenticação segura via Supabase Auth e comunicação essencial.</li>
                    <li><strong>Dados de Desempenho Escolar:</strong> Respostas a questões, notas TRI estimadas, tempo de resolução e textos de redação submetidos para correção pedagógica.</li>
                    <li><strong>Preferências de Estudo:</strong> Metas diárias de questões, disciplinas de foco e histórico de revisões no Caderno de Erros.</li>
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-emerald-400">3.</span> Armazenamento Seguro e Criptografia
                  </h4>
                  <p className="text-slate-300 text-xs">
                    Todas as informações trafegam via protocolo criptografado HTTPS/TLS. As senhas de acesso são processadas com hashing criptográfico seguro através do serviço de autenticação Supabase, nunca sendo gravadas em texto puro em nossos bancos de dados.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-emerald-400">4.</span> Não Comercialização de Dados
                  </h4>
                  <p className="text-slate-300 text-xs">
                    O MenteUp <strong>NUNCA comercializa, aluga ou compartilha</strong> informações pessoais ou redações de estudantes com corretores de dados ou terceiros para finalidades publicitárias.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span className="text-emerald-400">5.</span> Direitos do Usuário (Titular dos Dados)
                  </h4>
                  <p className="text-slate-300 text-xs">
                    Você pode a qualquer momento solicitar a exportação de seus dados, retificação de informações cadastrais ou exclusão total de sua conta através das configurações de perfil da plataforma.
                  </p>
                </section>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ambiente Seguro com Proteção de Dados LGPD</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Entendido e Concordo</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TermsAndPrivacyModal;
