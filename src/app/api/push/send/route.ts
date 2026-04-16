import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Define error type for web-push
interface WebPushError extends Error {
  statusCode?: number;
  body?: string;
}

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
    
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notification)
      );
      console.log('[API Push] Notification sent successfully');
      return NextResponse.json({ success: true });
    } catch (error) {
      const webPushError = error as WebPushError;
      console.error('[API Push] WebPush error:', webPushError);
      
      // Handle specific error codes
      const statusCode = webPushError.statusCode;
      const body = webPushError.body;
      
      console.log('[API Push] Error status code:', statusCode);
      console.log('[API Push] Error body:', body);
      
      // 410 Gone = Subscription expired, 404 = Not found, 403 = Invalid
      if (statusCode === 410 || statusCode === 404 || statusCode === 403) {
        console.log('[API Push] Subscription is expired or invalid, should be removed from database');
        return NextResponse.json({ 
          error: 'Subscription expired', 
          expired: true,
          details: body 
        }, { status: 410 });
      }
      
      // Other errors
      return NextResponse.json(
        { error: 'Failed to send notification', details: body || webPushError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    const generalError = error as Error;
    console.error('[API Push] General error:', generalError);
    return NextResponse.json(
      { error: 'Failed to send notification', details: generalError.message },
      { status: 500 }
    );
  }
}
