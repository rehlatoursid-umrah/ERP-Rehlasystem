export async function sendWhatsAppMessage(targetPhone: string, message: string) {
  try {
    const BASE_URL = (process.env.WA_API_URL || 'https://gowa-veqeqo5hgucr.cgk-robin.sumopod.my.id').replace(/\/$/, '');
    const WA_AUTH = process.env.WA_API_AUTH;

    // Format phone: remove non-digits
    let phone = targetPhone.replace(/\D/g, '');
    // Normalize Indonesian numbers: replace leading 0 with 62, remove 0 after 62
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    if (phone.startsWith('620')) phone = '62' + phone.slice(3);

    const payload = new FormData();
    payload.append('phone', phone);
    payload.append('message', message);

    const headers: HeadersInit = {};
    if (WA_AUTH) {
      const encodedAuth = Buffer.from(WA_AUTH).toString('base64');
      headers['Authorization'] = `Basic ${encodedAuth}`;
    }

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

// Send a document file via WhatsApp
// Downloads the file from URL, then sends as binary document
export async function sendWhatsAppFile(targetPhone: string, fileUrl: string, caption: string, fileName?: string) {
  try {
    const BASE_URL = (process.env.WA_API_URL || 'https://gowa-veqeqo5hgucr.cgk-robin.sumopod.my.id').replace(/\/$/, '');
    const WA_AUTH = process.env.WA_API_AUTH;

    let phone = targetPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    if (phone.startsWith('620')) phone = '62' + phone.slice(3);

    // Download the file from R2 URL first
    console.log('[WA-File] Downloading file from:', fileUrl);
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      console.error('[WA-File] Failed to download file:', fileResponse.status);
      return false;
    }
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    const finalFileName = fileName || 'document.pdf';
    console.log('[WA-File] File downloaded, size:', fileBuffer.length, 'bytes');

    const headers: HeadersInit = {};
    if (WA_AUTH) {
      const encodedAuth = Buffer.from(WA_AUTH).toString('base64');
      headers['Authorization'] = `Basic ${encodedAuth}`;
    }

    // Create a Blob from the buffer for FormData
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

    // Try method 1: /send/document with binary file
    const payload = new FormData();
    payload.append('phone', phone);
    payload.append('caption', caption);
    payload.append('document', fileBlob, finalFileName);

    console.log('[WA-File] Sending document to:', phone);
    let response = await fetch(`${BASE_URL}/send/document`, {
      method: 'POST',
      headers,
      body: payload
    });

    // Fallback: try /send/file with binary
    if (!response.ok) {
      const errText1 = await response.text();
      console.warn('[WA-File] /send/document failed:', response.status, errText1);

      const payload2 = new FormData();
      payload2.append('phone', phone);
      payload2.append('caption', caption);
      payload2.append('file', fileBlob, finalFileName);

      response = await fetch(`${BASE_URL}/send/file`, {
        method: 'POST',
        headers,
        body: payload2
      });

      if (!response.ok) {
        const errText2 = await response.text();
        console.error('[WA-File] /send/file also failed:', response.status, errText2);

        // Fallback 2: try /send/message with the URL as text
        console.log('[WA-File] Falling back to text message with download link');
        const linkMsg = `${caption}\n\n📥 Download dokumen:\n${fileUrl}`;
        return sendWhatsAppMessage(phone, linkMsg);
      }
    }

    const result = await response.text();
    console.log('[WA-File] Document sent successfully:', result);
    return true;
  } catch (error) {
    console.error('[WA-File] Failed to send WhatsApp file:', error);
    return false;
  }
}

export async function sendAdminNotification(message: string) {
  const ADMIN_PHONE = process.env.WA_ADMIN_PHONE || '6283197321658';
  return sendWhatsAppMessage(ADMIN_PHONE, message);
}
