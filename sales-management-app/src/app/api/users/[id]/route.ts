import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'data', 'user_list.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: any[]) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updatedData = await request.json();
    const users = await readUsers();
    const userIndex = users.findIndex((user: any) => user.user_id === id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // パスワードが提供された場合のみハッシュ化して更新
    if (updatedData.user_pass) {
      const hashedPassword = await bcrypt.hash(updatedData.user_pass, 10);
      updatedData.user_pass = hashedPassword;
    } else {
      // パスワードが提供されなかった場合は既存のパスワードを保持
      updatedData.user_pass = users[userIndex].user_pass;
    }

    users[userIndex] = { ...users[userIndex], ...updatedData };
    await writeUsers(users);
    return NextResponse.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let users = await readUsers();
    const initialLength = users.length;
    users = users.filter((user: any) => user.user_id !== id);

    if (users.length === initialLength) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await writeUsers(users);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
