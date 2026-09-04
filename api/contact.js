const recipient = 'shabab23105101104@diu.edu.bd';

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const { name, email, message } = request.body || {};

  if (!name || !email || !message) {
    return response.status(400).json({ error: 'Please fill in all fields.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(500).json({ error: 'Email service is not configured.' });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio contact form <onboarding@resend.dev>',
        to: [recipient],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      return response.status(502).json({ error: 'The email service could not send your message.' });
    }

    return response.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    return response.status(502).json({ error: 'The email service could not be reached.' });
  }
}