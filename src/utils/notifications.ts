// Local Notification Service using Browser Notification API

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" format e.g. "20:00"
  lastSentDate?: string; // "YYYY-MM-DD"
}

const SETTINGS_KEY = 'gabaritai_notification_settings_v1';

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler configurações de notificação:', e);
  }
  return {
    enabled: false,
    time: '20:00',
  };
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Erro ao salvar configurações de notificação:', e);
  }
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Erro ao solicitar permissão de notificação:', e);
    return 'denied';
  }
};

export const sendLocalNotification = (title: string, body: string, icon?: string) => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&auto=format&fit=crop&q=80',
      tag: 'gabaritai-streak-reminder',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (e) {
    console.error('Erro ao enviar notificação local:', e);
    return false;
  }
};

export const sendStreakReminderNotification = (streakDays: number, isStreakAtRisk: boolean = true) => {
  const title = isStreakAtRisk
    ? `🚨 Hora de Gabaritar! Sua streak de ${streakDays} dia${streakDays > 1 ? 's' : ''} está em risco!`
    : `🔥 Hora de Gabaritar! Mantenha sua sequência de ${streakDays} dia${streakDays > 1 ? 's' : ''}!`;

  const body = isStreakAtRisk
    ? `Você ainda não concluiu suas metas de estudo do cronograma hoje. Estude agora para não zerar sua sequência e ganhe +50 XP!`
    : `Seu horário de estudos agendado no cronograma chegou. Abra o GabaritaAí e revise sua matéria!`;

  return sendLocalNotification(title, body);
};

export const isTodayStudyCompleted = (): boolean => {
  try {
    const todayIso = new Date().toISOString().split('T')[0];
    const savedDates = localStorage.getItem('gabaritai_completed_study_dates_v1');
    if (savedDates) {
      const dates: string[] = JSON.parse(savedDates);
      if (dates.includes(todayIso)) return true;
    }

    const lastDate = localStorage.getItem('assistente_estudos_bento_last_date_v1');
    if (lastDate && lastDate === new Date().toDateString()) {
      return true;
    }
  } catch (e) {
    console.error('Erro ao verificar se estudo foi concluído hoje:', e);
  }
  return false;
};
