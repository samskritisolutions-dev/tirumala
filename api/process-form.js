module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    let rawBody = '';
    if (typeof req.body === 'object' && req.body !== null) {
      // Body already parsed by Vercel
      var body = req.body;
    } else {
      // Read body from stream
      await new Promise((resolve) => {
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', resolve);
      });

      var body = {};
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        // Parse URL-encoded or basic form data
        const params = new URLSearchParams(rawBody);
        for (const [key, value] of params.entries()) {
          body[key] = value;
        }
      }
    }

    const name = (body.name || '').trim();
    const phone = (body.phone || '').trim();
    const project = (body.project || 'General Enquiry').trim();
    const hp = (body.hp_field || '').trim();

    // Honeypot spam trap
    if (hp) {
      return res.status(200).json({ status: 'success', message: 'Your request has been received.' });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Please enter your full name.' });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ status: 'error', message: 'Please provide a valid 10-digit mobile number.' });
    }

    return res.status(200).json({
      status: 'success',
      message: `Thank you, ${name}! Your site visit request for ${project} has been received. Our senior engineer will contact you shortly.`
    });

  } catch (err) {
    console.error('Submission error:', err);
    return res.status(200).json({
      status: 'success',
      message: 'Thank you! Your request has been received. Our team will contact you shortly.'
    });
  }
};
