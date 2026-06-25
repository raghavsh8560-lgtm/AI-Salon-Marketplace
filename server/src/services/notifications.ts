export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// In-memory notifications store
export let notificationsCache: InAppNotification[] = [];

export async function sendBookingNotification(bookingId: string, userId: string, status: string) {
  let title = 'Booking Alert';
  let message = `Your booking ${bookingId} has been updated.`;
  
  if (status === 'CONFIRMED' || status === 'ACCEPTED') {
    title = 'Booking Accepted 🌸';
    message = `Congratulations! Your appointment ${bookingId} has been accepted by the salon.`;
  } else if (status === 'REJECTED') {
    title = 'Booking Rejected 😔';
    message = `We are sorry. Your appointment ${bookingId} could not be accepted by the salon. Please choose another time slot.`;
  } else if (status === 'IN_PROGRESS') {
    title = 'Service In-Progress ✂️';
    message = `Your treatment session for booking ${bookingId} has started. Enjoy your pampering!`;
  } else if (status === 'COMPLETED') {
    title = 'Booking Completed 🎉';
    message = `Your booking ${bookingId} has been marked as completed. Thank you for choosing Glowique! Please feel free to leave a review.`;
  } else if (status === 'CANCELLED') {
    title = 'Booking Cancelled 🚫';
    message = `Booking ${bookingId} has been cancelled successfully.`;
  }

  const newNotif: InAppNotification = {
    id: `notif-${Math.random().toString(36).substring(2, 9)}`,
    userId,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false
  };

  notificationsCache.push(newNotif);

  // Print logs to simulate Email notifications
  console.log(`\n========================================`);
  console.log(`[SIMULATED EMAIL NOTIFICATION ALERT]`);
  console.log(`Recipient User ID: ${userId}`);
  console.log(`Subject: ${title}`);
  console.log(`Body: ${message}`);
  console.log(`========================================\n`);
}

export function getNotificationsByUserId(userId: string) {
  return notificationsCache.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationsAsRead(userId: string) {
  notificationsCache.forEach(n => {
    if (n.userId === userId) {
      n.read = true;
    }
  });
  return true;
}
