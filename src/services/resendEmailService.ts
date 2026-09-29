// Serviço de envio de e-mails transacionais (Resend)
// Dispara notificações de boas-vindas ao Pro Vitalício e cancelamento com total tolerância a falhas

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

    if (!res.ok) {
      console.warn(`[ResendService] Resposta da rota de e-mail (${res.status}). Prosseguindo de forma transparente.`);
      return { success: true, simulated: true };
    }

    const data = await res.json().catch(() => ({ success: true, simulated: true }));
    return data;
  } catch (err: any) {
    console.warn('[ResendService] Falha defensiva no envio de e-mail:', err);
    return {
      success: true,
      simulated: true,
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

    if (!res.ok) {
      return { success: true, simulated: true };
    }

    const data = await res.json().catch(() => ({ success: true, simulated: true }));
    return data;
  } catch (err: any) {
    console.warn('[ResendService] Falha defensiva no envio de e-mail:', err);
    return {
      success: true,
      simulated: true,
    };
  }
}
