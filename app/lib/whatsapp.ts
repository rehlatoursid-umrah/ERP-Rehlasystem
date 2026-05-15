export async function sendWhatsAppMessage(targetPhone: string, message: string) {
  try {
    const BASE_URL = (process.env.WA_API_URL || 'https://gowa-veqeqo5hgucr.cgk-robin.sumopod.my.id').replace(/\/$/, '');
    const WA_AUTH = process.env.WA_API_AUTH;

    // Format phone: remove non-digits, ensure 62 prefix
    let phone = targetPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const payload = new FormData();
    payload.append('phone', phone);
    payload.append('message', message);

    const headers: HeadersInit = {};
    if (WA_AUTH) {
      const encodedAuth = Buffer.from(WA_AUTH).toString('base64');
      headers['Authorization'] = `Basic ${encodedAuth}`;
    }

    // Usually the text message endpoint is /send/message
    const response = await fetch(`${BASE_URL}/send/message`, {
      method: 'POST',
      headers,
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WhatsApp API Error (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

// Send a file (PDF, image, etc.) via WhatsApp
export async function sendWhatsAppFile(targetPhone: string, fileUrl: string, caption: string, fileName?: string) {
  try {
    const BASE_URL = (process.env.WA_API_URL || 'https://gowa-veqeqo5hgucr.cgk-robin.sumopod.my.id').replace(/\/$/, '');
    const WA_AUTH = process.env.WA_API_AUTH;

    let phone = targetPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const payload = new FormData();
    payload.append('phone', phone);
    payload.append('url', fileUrl);
    payload.append('caption', caption);
    if (fileName) payload.append('filename', fileName);

    const headers: HeadersInit = {};
    if (WA_AUTH) {
      const encodedAuth = Buffer.from(WA_AUTH).toString('base64');
      headers['Authorization'] = `Basic ${encodedAuth}`;
    }

    const response = await fetch(`${BASE_URL}/send/file`, {
      method: 'POST',
      headers,
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WhatsApp File API Error (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp file:', error);
    return false;
  }
}

export async function sendAdminNotification(message: string) {
  const ADMIN_PHONE = process.env.WA_ADMIN_PHONE || '6283197321658';
  return sendWhatsAppMessage(ADMIN_PHONE, message);
}
