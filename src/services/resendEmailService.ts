// Serviço de envio de e-mails transacionais (Resend)
// Dispara notificações automáticas de boas-vindas ao Pro e confirmação de cancelamento

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export async function sendProWelcomeEmail(email: string, name?: string): Promise<EmailSendResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || 'Estudante';

    const res = await fetch('/api/emails/send-welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        name: cleanName,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[ResendService] Falha ao enviar e-mail de boas-vindas:', err);
    return {
      success: false,
      error: err?.message || 'Falha na conexão com serviço de e-mail.',
    };
  }
}

export async function sendSubscriptionCancelledEmail(email: string, name?: string): Promise<EmailSendResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || 'Estudante';

    const res = await fetch('/api/emails/send-cancellation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        name: cleanName,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[ResendService] Falha ao enviar e-mail de cancelamento:', err);
    return {
      success: false,
      error: err?.message || 'Falha na conexão com serviço de e-mail.',
    };
  }
}
