import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'user_list.json');

export async function GET() {
  try {
    const usersData = fs.readFileSync(usersFilePath, 'utf-8');
    const users = JSON.parse(usersData);
    return NextResponse.json(users);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // ファイルが存在しない場合は空の配列を返す
      return NextResponse.json([], { status: 200 });
    }
    console.error('Error reading users data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newUser = await request.json();
    const usersData = fs.readFileSync(usersFilePath, 'utf-8');
    const users = JSON.parse(usersData);
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
