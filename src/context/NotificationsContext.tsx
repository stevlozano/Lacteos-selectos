'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationData {
  title: string;
  body: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: {
    orderId?: string;
    isAdmin?: boolean;
    url?: string;
  };
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

interface NotificationsContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
  subscribe: (userType: 'customer' | 'admin') => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendNotification: (subscription: PushSubscription, notification: NotificationData) => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Check for existing subscription
  const checkExistingSubscription = async () => {
    try {
      console.log('[Notifications] Checking existing subscription...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[Notifications] SW ready, checking push subscription...');
      const existingSubscription = await registration.pushManager.getSubscription();
      console.log('[Notifications] Existing subscription:', existingSubscription ? 'FOUND' : 'NONE');
      
      if (existingSubscription) {
        const sub = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
          }
        };
        console.log('[Notifications] Setting subscription state:', sub.endpoint.substring(0, 50) + '...');
        setSubscription(sub);
        setIsSubscribed(true);
        
        // Verify subscription exists in Supabase
        const { data: dbSub } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('endpoint', sub.endpoint)
          .single();
        console.log('[Notifications] Subscription in database:', dbSub ? 'YES' : 'NO');
      } else {
        console.log('[Notifications] No active push subscription found in browser');
      }
    } catch (error) {
      console.error('[Notifications] Error checking subscription:', error);
    }
  };

  // Check if notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    }
  };

  // Subscribe to push notifications
  const subscribe = async (userType: 'customer' | 'admin', customerId?: string): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      // Request permission first
      const perm = await requestPermission();
      if (perm !== 'granted') return false;

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not available');
        return false;
      }

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      // Convert subscription to JSON-serializable format
      const sub = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      // Save to Supabase with customer_id for personalized notifications
      const subscriptionData: {
        endpoint: string;
        p256dh: string;
        auth: string;
        user_type: 'customer' | 'admin';
        created_at: string;
        customer_id?: string;
      } = {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_type: userType,
        created_at: new Date().toISOString()
      };

      if (userType === 'customer' && customerId) {
        subscriptionData.customer_id = customerId;
      }

      const { error } = await supabase.from('push_subscriptions').upsert(
        subscriptionData,
        {
          onConflict: 'endpoint'
        }
      );

      if (error) {
        console.error('Error saving subscription:', error);
        return false;
      }

      setSubscription(sub);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();

        // Remove from Supabase
        await supabase.from('push_subscriptions')
          .delete()
          .eq('endpoint', existingSubscription.endpoint);
      }

      setSubscription(null);
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  };

  // Send notification via API
  const sendNotification = async (
    targetSubscription: PushSubscription,
    notification: NotificationData
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: targetSubscription,
          notification
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Convert URL-safe base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <NotificationsContext.Provider value={{
      isSupported,
      permission,
      subscription,
      isSubscribed,
      subscribe,
      unsubscribe,
      sendNotification,
      requestPermission
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
