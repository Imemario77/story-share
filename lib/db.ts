// app/lib/db.ts
import { promises as fs } from "fs";
import path from "path";

const novelsPath = path.join(process.cwd(), "data/novels.json");
const commentsPath = path.join(process.cwd(), "data/comments.json");

export type Novel = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorId: string;
  likes: number;
  comments: number;
  tags: string[];
  createdAt: string;
  readingTime: string;
  status: "published" | "draft";
};

export type Comment = {
  id: number;
  novelId: number;
  author: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: string;
};

export async function getNovels(): Promise<Novel[]> {
  try {
    const data = await fs.readFile(novelsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with initial data
    const initialNovels: Novel[] = [
      {
        id: 1,
        title: "The Midnight Garden",
        content: "In the depths of winter, when the moon cast long shadows...",
        excerpt: "In the depths of winter, when the moon cast long shadows...",
        author: "Alice Thompson",
        authorId: "user1",
        likes: 42,
        comments: 15,
        tags: ["Fantasy", "Mystery"],
        createdAt: new Date().toISOString(),
        readingTime: "5 min",
        status: "published",
      },
    ];
    await fs.mkdir(path.dirname(novelsPath), { recursive: true });
    await fs.writeFile(novelsPath, JSON.stringify(initialNovels, null, 2));
    return initialNovels;
  }
}

export async function getComments(): Promise<Comment[]> {
  try {
    const data = await fs.readFile(commentsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    const initialComments: Comment[] = [
      {
        id: 1,
        novelId: 1,
        author: "Sarah Wilson",
        authorId: "user3",
        content: "This story gave me chills! Can't wait to read more.",
        likes: 12,
        createdAt: new Date().toISOString(),
      },
    ];
    await fs.mkdir(path.dirname(commentsPath), { recursive: true });
    await fs.writeFile(commentsPath, JSON.stringify(initialComments, null, 2));
    return initialComments;
  }
}

export async function saveNovels(novels: Novel[]) {
  await fs.writeFile(novelsPath, JSON.stringify(novels, null, 2));
}

export async function saveComments(comments: Comment[]) {
  await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2));
}
