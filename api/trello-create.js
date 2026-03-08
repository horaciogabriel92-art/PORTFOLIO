import { Redis } from '@upstash/redis';
import { getAuthUser, setCORSHeaders, setSecurityHeaders, auditLog, rateLimit } from './_utils/security.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verificar autenticación
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  // Rate limiting: 5 tableros por hora
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  const rateCheck = await rateLimit(`trello:${clientIP}`, 5, 3600);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: 'Demasiados tableros creados. Intenta más tarde.' });
  }

  try {
    const { quote_id, onboarding_id, project_name, client_name } = req.body;
    
    const item_id = quote_id || onboarding_id;
    
    if (!item_id || !project_name) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos: project_name' });
    }

    const TRELLO_KEY = process.env.TRELLO_API_KEY;
    const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
    
    if (!TRELLO_KEY || !TRELLO_TOKEN) {
      return res.status(500).json({ success: false, error: 'Trello no configurado' });
    }

    // 1. Crear el tablero
    const boardResponse = await fetch(
      `https://api.trello.com/1/boards/?name=${encodeURIComponent(project_name)}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&defaultLists=false`,
      { method: 'POST' }
    );
    
    if (!boardResponse.ok) throw new Error('Error creando tablero');
    const board = await boardResponse.json();

    // 2. Crear listas
    const lists = ['📋 Backlog', '🎯 To Do', '⚡ In Progress', '👀 Review', '✅ Done'];
    for (const listName of lists) {
      await fetch(
        `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${board.id}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
        { method: 'POST' }
      );
    }

    // 3. Agregar cards iniciales
    const backlogCards = [
      { name: '🚀 Kick-off Meeting', desc: 'Reunión inicial con el cliente para alinear expectativas' },
      { name: '📄 Discovery Document', desc: 'Completar preguntas exploratorias y definir alcance' },
      { name: '🎨 Wireframes/Diseño', desc: 'Crear prototipos y obtener aprobación del diseño' },
      { name: '⚙️ Setup Técnico', desc: 'Configurar dominio, hosting, repositorio' },
      { name: '💻 Desarrollo', desc: 'Implementación del proyecto' },
      { name: '🧪 Testing', desc: 'Pruebas en diferentes dispositivos y navegadores' },
      { name: '📚 Documentación', desc: 'Crear guías de uso y documentación técnica' },
      { name: '🎓 Handover', desc: 'Entrega final y capacitación' }
    ];

    const listsResponse = await fetch(
      `https://api.trello.com/1/boards/${board.id}/lists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    );
    const boardLists = await listsResponse.json();
    const backlogList = boardLists.find(l => l.name.includes('Backlog')) || boardLists[0];

    for (const card of backlogCards) {
      await fetch(
        `https://api.trello.com/1/cards?idList=${backlogList.id}&name=${encodeURIComponent(card.name)}&desc=${encodeURIComponent(card.desc)}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
        { method: 'POST' }
      );
    }

    // 4. Guardar URL en Redis
    const redis = new Redis({
      url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
      token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
    });

    const item = await redis.get(item_id);
    if (item) {
      item.trello_board_url = board.shortUrl;
      if (!item.historial) item.historial = [];
      item.historial.push({
        fecha: new Date().toISOString(),
        accion: 'trello_creado',
        notas: `Tablero Trello creado: ${board.shortUrl}`
      });
      await redis.set(item_id, item);
    }

    // Audit log
    await auditLog('trello_creado', { project_name, board_url: board.shortUrl }, req);

    return res.status(200).json({
      success: true,
      board_url: board.shortUrl,
      board_id: board.id
    });

  } catch (error) {
    console.error('Error Trello:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
