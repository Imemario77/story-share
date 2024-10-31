import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { User } from "@/types/auth";

const usersPath = path.join(process.cwd(), "data/users.json");

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Read users from file
    const data = await fs.readFile(usersPath, "utf-8");
    const users: User[] = JSON.parse(data);

    // Find user
    const user = users.find(
      (u) => u.email === email && u.password === password // In real apps, use proper password hashing
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to process login" },
      { status: 500 }
    );
  }
}
