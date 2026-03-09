
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Simulate n8n processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('n8n Webhook received for CRM:', body);

  // En el backend real, aquí se usaría el SDK de Firebase para crear el pedido
  // y notificar a los vendedores mediante n8n/Slack/Email.

  return NextResponse.json({
    status: 'success',
    message: 'Lead sent to CRM',
    leadId: `LEAD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    actionsTaken: [
      'Lead created in CRM',
      'Email sent to sales team',
      'Task assigned to seller'
    ]
  });
}
