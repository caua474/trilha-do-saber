// Local Notification Service using Browser Notification API defensively

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
  } catch {
    // Falha silenciosa defensiva
  }
  return {
    enabled: false,
    time: '20:00',
  };
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Falha silenciosa defensiva
  }
};

export const isNotificationSupported = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    // Don't attempt to access Notification API inside an iframe (such as AI Studio preview)
    const isIframe = window.self !== window.top || window !== window.parent;
    if (isIframe) return false;
    return 'Notification' in window && typeof Notification !== 'undefined';
  } catch {
    return false;
  }
};

export const getNotificationPermission = (): NotificationPermission => {
  try {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
  } catch {
    return 'denied';
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
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
  } catch {
    return false;
  }
};

export const sendStreakReminderNotification = (streakDays: number, isStreakAtRisk: boolean = true) => {
  const title = isStreakAtRisk
    ? `🚨 Hora de Estudar! Sua streak de ${streakDays} dia${streakDays > 1 ? 's' : ''} está em risco!`
    : `🔥 Hora de Estudar! Mantenha sua sequência de ${streakDays} dia${streakDays > 1 ? 's' : ''}!`;

  const body = isStreakAtRisk
    ? `Você ainda não concluiu suas metas de estudo do cronograma hoje. Estude agora para não zerar sua sequência e ganhe +50 XP!`
    : `Seu horário de estudos agendado no cronograma chegou. Abra o MenteUp e revise sua matéria!`;

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
  } catch {
    // Falha silenciosa defensiva
  }
  return false;
};
