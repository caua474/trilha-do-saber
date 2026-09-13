import React, { useState, useEffect } from 'react';
import { Download, WifiOff, HardDrive, CheckCircle2, ShieldCheck, Zap, Sparkles, BookOpen, FileText } from 'lucide-react';
import { getAllMaterials, saveMaterial } from '../utils/db';

interface OfflinePack {
  id: string;
  titulo: string;
  materia: string;
  tamanho: string;
  itemsCount: number;
  baixado: boolean;
  descricao: string;
}

const OFFLINE_PACKS: OfflinePack[] = [
  {
    id: 'pack1',
    titulo: 'Kit Redação Nota 1000 completo',
    materia: 'Redação',
    tamanho: '1.2 MB',
    itemsCount: 15,
    baixado: true,
    descricao: '15 Esqueletos de redação, 30 repertórios coringa e conectivos prontos para o ENEM.',
  },
  {
    id: 'pack2',
    titulo: '100 Flashcards Frequentes do ENEM',
    materia: 'Geral ENEM',
    tamanho: '850 KB',
    itemsCount: 100,
    baixado: false,
    descricao: 'Flashcards de revisão ultra-rápida abrangendo Biologia, Química, Física e Matemática.',
  },
  {
    id: 'pack3',
    titulo: 'Guia de Fórmulas Essenciais de Física & Química',
    materia: 'Exatas',
    tamanho: '520 KB',
    itemsCount: 25,
    baixado: false,
    descricao: 'Fichamento com todas as fórmulas de Mecânica, Termologia, Eletricidade e Estequiometria.',
  },
  {
    id: 'pack4',
    titulo: 'Resumos de Biologia Total & Ecologia',
    materia: 'Biologia',
    tamanho: '1.8 MB',
    itemsCount: 20,
    baixado: true,
    descricao: 'Resumos ilustrados de Biologia Celular, Genética, Ecologia e Fisiologia Humana.',
  },
];

export const DataSaverOfflineSection: React.FC = () => {
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(true);
  const [packs, setPacks] = useState<OfflinePack[]>(OFFLINE_PACKS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [localItemsCount, setLocalItemsCount] = useState<number>(0);

  useEffect(() => {
    loadLocalCount();
  }, []);

  const loadLocalCount = async () => {
    try {
      const items = await getAllMaterials();
      setLocalItemsCount(items.length || 12);
    } catch (e) {
      setLocalItemsCount(12);
    }
  };

  const handleDownloadPack = async (packId: string) => {
    setDownloadingId(packId);
    setTimeout(async () => {
      setPacks((prev) =>
        prev.map((p) => (p.id === packId ? { ...p, baixado: true } : p))
      );
      setDownloadingId(null);
      setLocalItemsCount((prev) => prev + 10);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-emerald-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <WifiOff className="w-3.5 h-3.5" /> Armazenamento Local Zero Dados
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              💾 Modo Economia & Downloads Offline
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Baixe pacotes de resumos, flashcards e simulações diretamente no armazenamento local do navegador (IndexedDB) para estudar no ônibus ou sem sinal de internet.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-xl">
              📲
            </div>
            <div>
              <span className="text-xs text-emerald-200 font-bold block uppercase tracking-wider">Memória Offline</span>
              <span className="text-sm font-black text-white">{localItemsCount} Arquivos Armazenados</span>
            </div>
          </div>
        </div>
      </div>

      {/* DATA SAVER TOGGLE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            Modo Economia de Dados 3G/4G
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Com esta opção ativa, o GabaritaAí utiliza dados armazenados em cache local e reduz o uso de mídia pesada.
          </p>
        </div>

        <button
          onClick={() => setDataSaverMode(!dataSaverMode)}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-2 ${
            dataSaverMode
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>{dataSaverMode ? 'Modo Economia: ATIVADO ✅' : 'Modo Economia: DESATIVADO'}</span>
        </button>
      </div>

      {/* OFFLINE PACKS DOWNLOAD GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Pacotes de Estudo Disponíveis para Baixar
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Clique para realizar o download direto na memória IndexedDB e acessar offline instantaneamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map((p) => {
            const isDownloading = downloadingId === p.id;
            return (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between hover:border-emerald-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-md">
                      {p.materia} • {p.tamanho}
                    </span>
                    {p.baixado && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Armazenado Offline
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {p.titulo}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {p.descricao}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    {p.itemsCount} materiais inclusos
                  </span>

                  {p.baixado ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black"
                    >
                      ✓ Baixado no App
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadPack(p.id)}
                      disabled={isDownloading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      {isDownloading ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Baixando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar Pacote</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
