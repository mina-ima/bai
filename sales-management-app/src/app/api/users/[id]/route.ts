import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'user_list.json');

export async function DELETE(request: Request, { params }: any) {
  try {
    const { id } = params;
    const usersData = fs.readFileSync(usersFilePath, 'utf-8');
    let users = JSON.parse(usersData);
    const initialLength = users.length;
    users = users.filter((user: any) => user.user_id !== id);

    if (users.length === initialLength) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
