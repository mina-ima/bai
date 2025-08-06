import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// usersFilePath のパスを修正
const usersFilePath = path.join(process.cwd(), 'public', 'data', 'user_list.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: any[]) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    return NextResponse.json({ message: 'Error reading users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newUser = await request.json();
    const users = await readUsers();
    users.push(newUser);
    await writeUsers(users);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error writing user:', error);
    return NextResponse.json({ message: 'Error writing user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let users = await readUsers();
    users = users.filter((user: any) => user.user_id !== id);
    await writeUsers(users);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}