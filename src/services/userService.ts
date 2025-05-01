'use server';

import { User, UserFormData } from '@/types/user';

// Uygulama ilk yüklendiğinde ekranda hazır olarak gözükecek users
let users: User[] = [
  { id: 1, name: 'Abdullah Şahin', email: 'sahinabdullah2003@hotmail.com', phone: '05435562456', address: 'İstanbul' },
  { id: 2, name: 'Berat Özbay', email: 'berat.ozbay@priviasecurity.com', phone: '123456789', address: 'Ataşehir' },
];

export async function getAllUsers() {
  'use server';
  return users;
}

export async function getUserById(id: number) {
  'use server';
  return users.find(user => user.id === id);
}

export async function createUser(userData: UserFormData) {
  'use server';
  const newUser: User = {
    id: users.length + 1,
    ...userData
  };
  users.push(newUser);
  return newUser;
}

export async function updateUser(id: number, userData: UserFormData) {
  'use server';
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return undefined;
  
  users[index] = { ...users[index], ...userData };
  return users[index];
}

export async function deleteUser(id: number) {
  'use server';
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length !== initialLength;
}

export async function searchUsers(query: string) {
  'use server';
  return users.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase())
  );
}