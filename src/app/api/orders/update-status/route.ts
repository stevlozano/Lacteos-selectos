import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, customerEmail } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Send personalized notification to customer
    if (customerEmail) {
      let notificationTitle = '';
      let notificationBody = '';
      const notificationType = 'order_update';

      switch (status) {
        case 'approved':
          notificationTitle = '¡Pedido Aprobado!';
          notificationBody = 'Tu pedido ha sido aprobado y está en preparación.';
          break;
        case 'in_delivery':
          notificationTitle = '¡Pedido en Camino!';
          notificationBody = 'Tu pedido está en camino a tu ubicación.';
          break;
        case 'completed':
          notificationTitle = '¡Pedido Entregado!';
          notificationBody = 'Tu pedido ha sido entregado exitosamente.';
          break;
        case 'cancelled':
          notificationTitle = 'Pedido Cancelado';
          notificationBody = 'Tu pedido ha sido cancelado.';
          break;
        default:
          notificationTitle = 'Actualización de Pedido';
          notificationBody = `Tu pedido ahora está: ${status}`;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/push/send-customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail,
            notification: {
              title: notificationTitle,
              body: notificationBody,
              type: notificationType,
              orderId,
              tag: `order-${orderId}`,
              requireInteraction: true,
              url: '/tienda'
            }
          })
        });

        if (response.ok) {
          console.log(`Notification sent to ${customerEmail} for order ${orderId}`);
        } else {
          console.error('Failed to send notification:', await response.text());
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order updated successfully' 
    });

  } catch (error) {
    console.error('Error in order status update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
