// app/actions/novels.ts
"use server";

import { revalidatePath } from "next/cache";
import { getNovels, getComments, saveNovels, saveComments } from "../../lib/db";
import { Novel, Comment } from "../../lib/db";

export async function createNovel(formData: {
  title: string;
  content: string;
  author?: string;
  authorId?: string;
  tags: string[];
}) {
  const novels = await getNovels();

  const newNovel: Novel = {
    id: novels.length + 1,
    title: formData.title,
    content: formData.content,
    excerpt: formData.content.slice(0, 150) + "...",
    author: formData.author || "Anonymous User",
    authorId: "anonymous",
    likes: 0,
    comments: 0,
    tags: formData.tags.length >= 1 ? formData.tags : ["General"],
    createdAt: new Date().toISOString(),
    readingTime: `${Math.ceil(formData.content.split(" ").length / 200)} min`,
    status: "published",
  };

  await saveNovels([newNovel, ...novels]);
  revalidatePath("/");
  return newNovel;
}

export async function likeNovel(novelId: number) {
  const novels = await getNovels();
  const updatedNovels = novels.map((novel) =>
    novel.id === novelId ? { ...novel, likes: novel.likes + 1 } : novel
  );

  await saveNovels(updatedNovels);
  revalidatePath("/");
  return updatedNovels.find((novel) => novel.id === novelId);
}

export async function createComment(formData: {
  novelId: number;
  content: string;
  author?: string;
  authorId?: string;
}) {
  const [novels, comments] = await Promise.all([getNovels(), getComments()]);

  const newComment: Comment = {
    id: comments.length + 1,
    novelId: formData.novelId,
    author: formData.author || "Anonymous User",
    authorId: "anonymous",
    content: formData.content,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  const updatedNovels = novels.map((novel) =>
    novel.id === formData.novelId
      ? { ...novel, comments: novel.comments + 1 }
      : novel
  );

  await Promise.all([
    saveComments([...comments, newComment]),
    saveNovels(updatedNovels),
  ]);

  revalidatePath("/");
  return newComment;
}
