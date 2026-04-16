import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@lacteos-selectos.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, notification } = body;

    console.log('[API Push] Received request:', { subscription: subscription?.endpoint?.substring(0, 50), notification });

    if (!subscription || !notification) {
      console.log('[API Push] Missing subscription or notification');
      return NextResponse.json(
        { error: 'Subscription and notification data required' },
        { status: 400 }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('[API Push] VAPID keys not configured');
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    console.log('[API Push] Sending notification to:', subscription.endpoint?.substring(0, 50));
    
    await webpush.sendNotification(
      subscription,
      JSON.stringify(notification)
    );

    console.log('[API Push] Notification sent successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Push] Error sending push notification:', error);
    console.error('[API Push] Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body
    });
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}
