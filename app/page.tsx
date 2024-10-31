import { getNovels, getComments } from "@/lib/db";
import NovelApp from "@/components/NovelApp";
import AuthWrapper from "@/components/AuthWrapper";

export default async function Home() {
  const [novels, comments] = await Promise.all([getNovels(), getComments()]);

  return (
    <AuthWrapper>
      <NovelApp initialNovels={novels} initialComments={comments} />
    </AuthWrapper>
  );
}
