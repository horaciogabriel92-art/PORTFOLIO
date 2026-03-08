/**
 * API de Login para Admin
 * POST /api/auth-login
 */

import { verifyPassword, generateToken, setCORSHeaders, setSecurityHeaders, rateLimit } from './_utils/security.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting: 5 intentos por minuto
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`login:${clientIP}`, 5, 60);
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      success: false, 
      error: 'Demasiados intentos. Intenta en ' + rateCheck.resetIn + ' segundos' 
    });
  }

  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Contraseña requerida' });
    }

    // Verificar contraseña (hash almacenado en security.js)
    const valid = await verifyPassword(password);
    
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = generateToken({ role: 'admin', iat: Date.now() });

    return res.status(200).json({
      success: true,
      token,
      expiresIn: 3600 // 1 hora
    });

  } catch (error) {
    console.error('Error login:', error);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}
