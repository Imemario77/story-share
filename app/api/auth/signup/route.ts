import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { User } from "@/types/auth";

const usersPath = path.join(process.cwd(), "data/users.json");

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    console.log({ username, email, password });
    // Create users.json if it doesn't exist
    try {
      await fs.access(usersPath);
    } catch {
      await fs.mkdir(path.dirname(usersPath), { recursive: true });
      await fs.writeFile(usersPath, "[]");
    }

    // Read existing users
    const data = await fs.readFile(usersPath, "utf-8");
    const users: User[] = JSON.parse(data);

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user${users.length + 1}`,
      username,
      email,
      password, // In real apps, hash the password
      createdAt: new Date().toISOString(),
    };

    // Save to file
    await fs.writeFile(usersPath, JSON.stringify([...users, newUser], null, 2));

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
