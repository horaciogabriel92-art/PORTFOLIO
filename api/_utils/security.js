/**
 * Módulo de utilidades de seguridad
 * Incluye: hashing, encriptación, rate limiting, sanitización
 */

import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { randomUUID } from 'crypto';
import { Redis } from '@upstash/redis';

// ==================== CONFIGURACIÓN ====================

// La contraseña de admin hasheada (bcrypt con 12 rounds)
// Original: Loquesea2007!
export const ADMIN_PASSWORD_HASH = '$2a$12$j8.JL5zNyHJ.DKQ8L0.Lz.Z7J2SfLtD6zNV7N8p2hYV3LJ4oK8l.q';

// Secretos para JWT y encriptación (deben estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'cambia-esto-en-produccion-32chars!';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'tu-clave-de-encriptacion-32-chars!';

// ==================== AUTENTICACIÓN ====================

/**
 * Verifica contraseña contra hash bcrypt
 */
export async function verifyPassword(password, hash = ADMIN_PASSWORD_HASH) {
  return bcrypt.compare(password, hash);
}

/**
 * Genera token JWT simple
 */
export function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const data = { ...payload, iat: now, exp: now + 3600 }; // 1 hora
  
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signature = CryptoJS.HmacSHA256(`${encode(header)}.${encode(data)}`, JWT_SECRET).toString(CryptoJS.enc.Base64url);
  
  return `${encode(header)}.${encode(data)}.${signature}`;
}

/**
 * Verifica token JWT
 */
export function verifyToken(token) {
  try {
    const [headerB64, dataB64, signature] = token.split('.');
    const expectedSig = CryptoJS.HmacSHA256(`${headerB64}.${dataB64}`, JWT_SECRET).toString(CryptoJS.enc.Base64url);
    
    if (signature !== expectedSig) return null;
    
    const data = JSON.parse(Buffer.from(dataB64, 'base64url').toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return null; // Expirado
    
    return data;
  } catch {
    return null;
  }
}

/**
 * Extrae y verifica token de la request
 */
export function getAuthUser(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}

// ==================== ENCRIPTACIÓN DE DATOS ====================

/**
 * Encripta texto sensible (AES-256-GCM simulado con AES)
 */
export function encrypt(text) {
  if (!text || typeof text !== 'string') return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Desencripta texto
 */
export function decrypt(encrypted) {
  if (!encrypted || typeof encrypted !== 'string') return encrypted;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

/**
 * Encripta objeto de cliente (email, teléfono, etc.)
 */
export function encryptClientData(cliente) {
  return {
    ...cliente,
    nombre: encrypt(cliente.nombre),
    email: encrypt(cliente.email),
    telefono: cliente.telefono ? encrypt(cliente.telefono) : null,
    empresa: cliente.empresa ? encrypt(cliente.empresa) : null
  };
}

/**
 * Desencripta objeto de cliente
 */
export function decryptClientData(cliente) {
  return {
    ...cliente,
    nombre: decrypt(cliente.nombre) || cliente.nombre,
    email: decrypt(cliente.email) || cliente.email,
    telefono: cliente.telefono ? decrypt(cliente.telefono) : null,
    empresa: cliente.empresa ? decrypt(cliente.empresa) : null
  };
}

// ==================== RATE LIMITING ====================

/**
 * Rate limiting simple con Redis
 * @param {string} key - Identificador (IP, user ID, etc.)
 * @param {number} maxRequests - Máximo de requests permitidos
 * @param {number} windowSeconds - Ventana de tiempo en segundos
 */
export async function rateLimit(key, maxRequests = 10, windowSeconds = 60) {
  const redis = new Redis({
    url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
    token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
  });
  
  const rateKey = `rate_limit:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;
  
  // Obtener requests recientes
  const requests = await redis.get(rateKey) || [];
  const validRequests = Array.isArray(requests) 
    ? requests.filter(t => t > windowStart)
    : [];
  
  if (validRequests.length >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: windowSeconds - (now - validRequests[0]) };
  }
  
  // Agregar request actual
  validRequests.push(now);
  await redis.set(rateKey, validRequests, { ex: windowSeconds });
  
  return { allowed: true, remaining: maxRequests - validRequests.length - 1 };
}

// ==================== SANITIZACIÓN ====================

const PATRONES_PELIGROSOS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /eval\s*\(/gi,
  /document\.cookie/gi,
  /document\.location/gi,
  /window\.location/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /data:text\/html/gi
];

/**
 * Detecta intentos de inyección
 */
export function detectInjection(value) {
  if (typeof value !== 'string') return false;
  return PATRONES_PELIGROSOS.some(pattern => pattern.test(value));
}

/**
 * Sanitiza HTML escapando caracteres peligrosos
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return str;
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;'
  };
  return str.replace(/[&<>"'`\/]/g, char => entities[char] || char).substring(0, 5000);
}

/**
 * Sanitiza objeto completo recursivamente
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Primero detectar inyección, luego sanitizar
      if (detectInjection(value)) {
        console.warn(`⚠️ Posible inyección detectada en campo: ${key}`);
      }
      sanitized[key] = sanitizeHTML(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Valida email
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================== IDs SEGUROS ====================

/**
 * Genera UUID seguro para usar como ID
 */
export function generateSecureId(prefix = 'item') {
  return `${prefix}_${randomUUID()}`;
}

// ==================== HEADERS DE SEGURIDAD ====================

/**
 * Aplica headers de seguridad estándar
 */
export function setSecurityHeaders(res) {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS Protection (legacy pero útil)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // HSTS (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy básico
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'");
}

/**
 * CORS restringido al dominio permitido
 */
export function setCORSHeaders(res, allowedOrigin = 'https://portfolio.estudioforgelab.com') {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ==================== LOGGING DE AUDITORÍA ====================

/**
 * Log de acción de administrador
 */
export async function auditLog(action, details, req) {
  const redis = new Redis({
    url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
    token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
  });
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details: sanitizeObject(details),
    ip: req.headers['x-forwarded-for'] || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  };
  
  // Guardar en lista de logs (mantener últimos 1000)
  const logs = await redis.get('audit_logs') || [];
  const currentLogs = Array.isArray(logs) ? logs : [];
  currentLogs.unshift(logEntry);
  
  // Mantener solo últimos 1000
  if (currentLogs.length > 1000) {
    currentLogs.pop();
  }
  
  await redis.set('audit_logs', currentLogs);
  console.log(`[AUDIT] ${action}: ${JSON.stringify(details)}`);
}
