import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, notification } = await request.json();

    if (!customerEmail || !notification) {
      return NextResponse.json({ error: 'Customer email and notification are required' }, { status: 400 });
    }

    // Get customer info
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerEmail)
      .eq('is_active', true)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check notification preferences
    const notificationType = notification.type || 'order_update';
    if (notificationType === 'order_update' && !customer.notification_preferences.order_updates) {
      return NextResponse.json({ message: 'Customer has disabled order notifications' }, { status: 200 });
    }
    if (notificationType === 'credit_status' && !customer.notification_preferences.credit_status) {
      return NextResponse.json({ message: 'Customer has disabled credit notifications' }, { status: 200 });
    }

    // Get customer's push subscriptions
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('user_type', 'customer');

    if (subscriptionError) {
      console.error('Error fetching subscriptions:', subscriptionError);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No active subscriptions found for customer' }, { status: 200 });
    }

    // Send notifications to all customer's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          };

          await webpush.sendNotification(pushSubscription, JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: notification.tag || 'customer-notification',
            requireInteraction: notification.requireInteraction || false,
            data: {
              customerId: customer.id,
              orderId: notification.orderId,
              type: notificationType,
              url: notification.url || '/tienda'
            },
            actions: notification.actions || []
          }));

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          console.error('Failed to send notification to subscription:', subscription.id, error);
          return { success: false, subscriptionId: subscription.id, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
    const failed = results.length - successful;

    // Log notification attempt
    await supabase
      .from('notification_queue')
      .insert({
        customer_id: customer.id,
        title: notification.title,
        body: notification.body,
        type: notificationType,
        sent: successful > 0,
        sent_at: successful > 0 ? new Date().toISOString() : null
      });

    return NextResponse.json({
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      successful,
      failed,
      customerId: customer.id
    });

  } catch (error) {
    console.error('Error in customer notification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
