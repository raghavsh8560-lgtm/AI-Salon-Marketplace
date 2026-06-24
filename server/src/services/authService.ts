import { findUserByEmail, createUser, updateUser } from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing.');
}

export interface AuthResult {
  token: string;
  user: any;
}

/**
 * Lightweight, passwordless authentication helper for development and demo mode.
 * Automatically signs in existing users or creates new profiles for new email addresses.
 */
export async function authenticateDemoUser(email: string, role?: string, password?: string): Promise<AuthResult> {
  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required.');
  }

  // Enforce credentials check for demo accounts
  if (email === 'admin@salonhub.com') {
    if (password !== 'Admin123') {
      throw new Error('Incorrect password for Admin demo account.');
    }
    role = 'ADMIN';
  } else if (email === 'owner@royalglow.com') {
    if (password !== 'Owner123') {
      throw new Error('Incorrect password for Salon Owner demo account.');
    }
    role = 'OWNER';
  }

  // 1. Check if email already exists
  let user = await findUserByEmail(email);
  
  if (user && user.suspended) {
    throw new Error('This account has been suspended by the administrator.');
  }

  // 2. If the email does not exist, automatically register a new profile
  if (!user) {
    // Extract a nice human-readable name from email
    const emailPrefix = email.split('@')[0];
    const name = email === 'admin@salonhub.com' 
      ? 'Hub Admin' 
      : email === 'owner@royalglow.com' 
      ? 'Royal Owner' 
      : (emailPrefix
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(part.charAt(0) ? 1 : 0))
          .join(' ') || 'Guest User');

    user = await createUser({
      name,
      email,
      role: role || 'USER',
    });
  } else if (role && user.role !== role) {
    // Enable switching roles in demo mode
    user = await updateUser(user.id, { role });
  }

  // 3. Generate a lightweight JWT session token containing userId and role
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hairType: user.hairType,
      hairLength: user.hairLength,
      hairGoals: user.hairGoals,
      hairConcerns: user.hairConcerns,
      skinType: user.skinType,
      skinTone: user.skinTone,
      skinConcerns: user.skinConcerns,
      budgetRange: user.budgetRange,
      occasion: user.occasion,
      preferences: user.preferences,
      favoriteSalons: user.favoriteSalons || [],
    }
  };
}
