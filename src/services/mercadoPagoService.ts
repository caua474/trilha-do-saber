// Serviço do Mercado Pago para Assinaturas Recorrentes (Preapproval)
// Gerencia a criação de links de pagamento mensal (R$ 5,00/mês), cancelamento e verificação de status

export interface PreapprovalSubscriptionResult {
  success: boolean;
  initPoint?: string;
  subscriptionId?: string;
  status?: string;
  message?: string;
  simulated?: boolean;
}

export interface SubscriptionStatusInfo {
  active: boolean;
  status: 'active' | 'cancelled' | 'inactive' | 'pending';
  planName: string;
  amount: number;
  currency: string;
  subscriptionId?: string;
  renewsAt?: string;
  nextPaymentDate?: string;
  payerEmail?: string;
}

export async function createMercadoPagoSubscription(params: {
  email: string;
  name: string;
  userId?: string;
  returnUrl?: string;
}): Promise<PreapprovalSubscriptionResult> {
  try {
    const res = await fetch('/api/mercadopago/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error('[MercadoPagoService] Erro ao criar assinatura:', error);
    return {
      success: false,
      message: error?.message || 'Falha ao conectar com o serviço do Mercado Pago.',
    };
  }
}

export async function cancelMercadoPagoSubscription(params: {
  subscriptionId?: string;
  email: string;
  name?: string;
  userId?: string;
}): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  try {
    const res = await fetch('/api/mercadopago/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error('[MercadoPagoService] Erro ao cancelar assinatura:', error);
    return {
      success: false,
      message: error?.message || 'Falha ao solicitar o cancelamento da assinatura.',
    };
  }
}

export async function getSubscriptionStatus(userIdOrEmail: string): Promise<SubscriptionStatusInfo> {
  try {
    const res = await fetch(`/api/mercadopago/subscription/${encodeURIComponent(userIdOrEmail)}`);
    const data = await res.json();
    if (data && data.success && data.subscription) {
      return data.subscription;
    }
  } catch (err) {
    console.warn('[MercadoPagoService] Não foi possível obter status do servidor, usando estado local:', err);
  }

  // Fallback baseado no localStorage
  try {
    const saved = localStorage.getItem('gabaritai_auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isPro) {
        return {
          active: true,
          status: 'active',
          planName: 'MenteUp Pro Vitalício (R$ 5,00)',
          amount: 5.0,
          currency: 'BRL',
          subscriptionId: parsed.subscriptionId || 'sub_mp_' + Math.abs(hashCode(parsed.email || 'user')),
          renewsAt: 'Vitalício (Sem mensalidades)',
          payerEmail: parsed.email,
        };
      }
    }
  } catch {}

  return {
    active: false,
    status: 'inactive',
    planName: 'Plano Gratuito',
    amount: 0,
    currency: 'BRL',
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
