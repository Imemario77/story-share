"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ScrollText,
  Book,
  PlusCircle,
  Heart,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createNovel, likeNovel, createComment } from "../app/actions/novels";
import { Novel, Comment } from "../lib/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NovelAppProps {
  initialNovels: Novel[];
  initialComments: Comment[];
}

const AVAILABLE_GENRES = [
  "Fiction",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Mystery",
  "Horror",
  "Adventure",
  "Drama",
];

export default function NovelApp({
  initialNovels,
  initialComments,
}: NovelAppProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [novels, setNovels] = useState(initialNovels);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateNovel = async () => {
    if (!title || !content || isSubmitting) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setIsSubmitting(true);
    try {
      const newNovel = await createNovel({
        title,
        content,
        author: user.username,
        authorId: user.id,
        tags: selectedGenres,
      });
      setNovels([newNovel, ...novels]);
      setTitle("");
      setContent("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create novel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (novelId: number) => {
    if (!newComment.trim() || isSubmitting) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setIsSubmitting(true);
    try {
      const newCommentObj = await createComment({
        novelId,
        content: newComment,
        author: user.username,
        authorId: user.id,
      });

      setComments([...comments, newCommentObj]);
      setNewComment("");
      setNovels(
        novels.map((novel) =>
          novel.id === novelId
            ? { ...novel, comments: novel.comments + 1 }
            : novel
        )
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleLike = async (novelId: number) => {
    try {
      const updatedNovel = await likeNovel(novelId);
      if (updatedNovel) {
        setNovels(
          novels.map((novel) => (novel.id === novelId ? updatedNovel : novel))
        );
      }
    } catch (error) {
      console.error("Failed to like novel:", error);
    }
  };

  const handleAddGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };
  const filteredNovels = selectedTag
    ? novels.filter((novel) => novel.tags.includes(selectedTag))
    : novels;

  const allTags = Array.from(new Set(novels.flatMap((novel) => novel.tags)));

  // Rest of the component JSX remains the same as before
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Book className="h-8 w-8" />
            <h1 className="text-2xl font-bold">StoryShare</h1>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Share Your Story
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Tags Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={selectedTag === "" ? "default" : "outline"}
            onClick={() => setSelectedTag("")}
            size="sm"
          >
            All
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              onClick={() => setSelectedTag(tag)}
              size="sm"
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Create Novel Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle>Share Your Story</DialogTitle>
              <DialogDescription>
                Share your story with readers worldwide
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Your Story Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Genres
                </label>
                <Select
                  onValueChange={handleAddGenre}
                  value={selectedGenres[selectedGenres.length - 1] || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedGenres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {genre}
                      <button
                        onClick={() => handleRemoveGenre(genre)}
                        className="hover:text-indigo-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Write your story here..."
                className="min-h-[300px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateNovel} disabled={isSubmitting}>
                  {isSubmitting ? "Sharing..." : "Share Story"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Novel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNovels.map((novel) => (
            <Card
              key={novel.id}
              className="bg-white hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-xl text-indigo-600">
                  {novel.title}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    {novel.author} • {novel.readingTime} read
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {novel.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">{novel.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedNovel(novel)}
                  className="flex items-center gap-2"
                >
                  <ScrollText className="h-4 w-4" />
                  Read More
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleLike(novel.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    {novel.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedNovel(novel)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {novel.comments}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        {/* Novel Details Dialog */}
        <Dialog
          open={!!selectedNovel}
          onOpenChange={() => setSelectedNovel(null)}
        >
          <DialogContent className="sm:max-w-[725px]">
            {selectedNovel && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedNovel.title}</DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      {selectedNovel.author} • {selectedNovel.readingTime} read
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="prose max-w-none">
                    <p>{selectedNovel.content}</p>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Comments</h3>
                    <div className="space-y-4">
                      {comments
                        .filter(
                          (comment) => comment.novelId === selectedNovel.id
                        )
                        .map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-gray-50 p-3 rounded"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {comment.author}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button
                          onClick={() => handleAddComment(selectedNovel.id)}
                          disabled={isSubmitting || !newComment.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// "use client";

// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   ScrollText,
//   Book,
//   PlusCircle,
//   Heart,
//   MessageCircle,
//   User,
//   X,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { createNovel, likeNovel, createComment } from "@/app/actions/novels";
// import { Novel, Comment } from "../lib/db";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface NovelAppProps {
//   initialNovels: Novel[];
//   initialComments: Comment[];
// }

// // Available genres/tags
// const AVAILABLE_GENRES = [
//   "Fiction",
//   "Fantasy",
//   "Sci-Fi",
//   "Romance",
//   "Mystery",
//   "Horror",
//   "Adventure",
//   "Drama",
// ];

// export default function NovelApp({
//   initialNovels,
//   initialComments,
// }: NovelAppProps) {
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
//   const [novels, setNovels] = useState(initialNovels);
//   const [comments, setComments] = useState(initialComments);
//   const [newComment, setNewComment] = useState("");
//   const [selectedTag, setSelectedTag] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleCreateNovel = async () => {
//     if (!title || !content || selectedGenres.length === 0 || isSubmitting) {
//       alert("Please fill in all fields and select at least one genre");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const newNovel = await createNovel({
//         title,
//         content,
//         tags: selectedGenres,
//       });
//       setNovels([newNovel, ...novels]);
//       setTitle("");
//       setContent("");
//       setSelectedGenres([]);
//       setShowCreateForm(false);
//     } catch (error) {
//       console.error("Failed to create novel:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAddGenre = (genre: string) => {
//     if (!selectedGenres.includes(genre)) {
//       setSelectedGenres([...selectedGenres, genre]);
//     }
//   };

//   const handleRemoveGenre = (genre: string) => {
//     setSelectedGenres(selectedGenres.filter((g) => g !== genre));
//   };

//   const handleLike = async (novelId: number) => {
//     try {
//       const updatedNovel = await likeNovel(novelId);
//       if (updatedNovel) {
//         setNovels(
//           novels.map((novel) => (novel.id === novelId ? updatedNovel : novel))
//         );
//       }
//     } catch (error) {
//       console.error("Failed to like novel:", error);
//     }
//   };

//   const handleAddComment = async (novelId: number) => {
//     if (!newComment.trim() || isSubmitting) return;

//     setIsSubmitting(true);
//     try {
//       const newCommentObj = await createComment({
//         novelId,
//         content: newComment,
//       });

//       setComments([...comments, newCommentObj]);
//       setNewComment("");

//       // Update comment count on the novel
//       setNovels(
//         novels.map((novel) =>
//           novel.id === novelId
//             ? { ...novel, comments: (novel.comments || 0) + 1 }
//             : novel
//         )
//       );
//     } catch (error) {
//       console.error("Failed to add comment:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const filteredNovels = selectedTag
//     ? novels.filter((novel) => novel.tags.includes(selectedTag))
//     : novels;

//   const allTags = Array.from(new Set(novels.flatMap((novel) => novel.tags)));

//   // Novel Details Dialog
//   const novelComments = comments.filter(
//     (comment) => selectedNovel && comment.novelId === selectedNovel.id
//   );

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <header className="bg-indigo-600 text-white p-6">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <Book className="h-8 w-8" />
//             <h1 className="text-2xl font-bold">StoryShare</h1>
//           </div>
//           <Button
//             variant="secondary"
//             onClick={() => setShowCreateForm(true)}
//             className="flex items-center gap-2"
//           >
//             <PlusCircle className="h-4 w-4" />
//             Share Your Story
//           </Button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto p-6">
//         {/* Tags Filter */}
//         <div className="mb-6 flex gap-2 flex-wrap">
//           <Button
//             variant={selectedTag === "" ? "default" : "outline"}
//             onClick={() => setSelectedTag("")}
//             size="sm"
//           >
//             All
//           </Button>
//           {allTags.map((tag) => (
//             <Button
//               key={tag}
//               variant={selectedTag === tag ? "default" : "outline"}
//               onClick={() => setSelectedTag(tag)}
//               size="sm"
//             >
//               {tag}
//             </Button>
//           ))}
//         </div>

//         {/* Create Novel Dialog */}
//         <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
//           <DialogContent className="sm:max-w-[725px]">
//             <DialogHeader>
//               <DialogTitle>Share Your Story</DialogTitle>
//               <DialogDescription>
//                 Share your story with readers worldwide
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 mt-4">
//               <Input
//                 placeholder="Your Story Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//               <Textarea
//                 placeholder="Write your story here..."
//                 className="min-h-[300px]"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//               />
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   Select Genres
//                 </label>
//                 <Select
//                   onValueChange={handleAddGenre}
//                   value={selectedGenres[selectedGenres.length - 1] || ""}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a genre" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {AVAILABLE_GENRES.map((genre) => (
//                       <SelectItem key={genre} value={genre}>
//                         {genre}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <div className="flex gap-2 mt-2 flex-wrap">
//                   {selectedGenres.map((genre) => (
//                     <span
//                       key={genre}
//                       className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-1"
//                     >
//                       {genre}
//                       <button
//                         onClick={() => handleRemoveGenre(genre)}
//                         className="hover:text-indigo-600"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => setShowCreateForm(false)}
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </Button>
//                 <Button onClick={handleCreateNovel} disabled={isSubmitting}>
//                   {isSubmitting ? "Sharing..." : "Share Story"}
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Novel Details Dialog */}
//         <Dialog
//           open={!!selectedNovel}
//           onOpenChange={() => setSelectedNovel(null)}
//         >
//           <DialogContent className="sm:max-w-[725px]">
//             {selectedNovel && (
//               <>
//                 <DialogHeader>
//                   <DialogTitle>{selectedNovel.title}</DialogTitle>
//                   <DialogDescription>
//                     <div className="flex items-center gap-2 mb-2">
//                       <User className="h-4 w-4" />
//                       {selectedNovel.author} • {selectedNovel.readingTime} read
//                     </div>
//                     <div className="flex gap-1 flex-wrap">
//                       {selectedNovel.tags.map((tag) => (
//                         <span
//                           key={tag}
//                           className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs"
//                         >
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="mt-4 space-y-4">
//                   <div className="prose max-w-none">
//                     <p>{selectedNovel.content}</p>
//                   </div>
//                   <div className="border-t pt-4">
//                     <h3 className="font-semibold mb-2">Comments</h3>
//                     <div className="space-y-4">
//                       {novelComments.map((comment) => (
//                         <div
//                           key={comment.id}
//                           className="bg-gray-50 p-3 rounded"
//                         >
//                           <div className="flex items-center gap-2 mb-1">
//                             <User className="h-4 w-4" />
//                             <span className="text-sm font-medium">
//                               {comment.author}
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600">
//                             {comment.content}
//                           </p>
//                         </div>
//                       ))}
//                       <div className="flex gap-2">
//                         <Input
//                           placeholder="Add a comment..."
//                           value={newComment}
//                           onChange={(e) => setNewComment(e.target.value)}
//                         />
//                         <Button
//                           onClick={() => handleAddComment(selectedNovel.id)}
//                           disabled={isSubmitting || !newComment.trim()}
//                         >
//                           Post
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </DialogContent>
//         </Dialog>

//         {/* Novel Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredNovels.map((novel) => (
//             <Card
//               key={novel.id}
//               className="bg-white hover:shadow-lg transition-shadow"
//             >
//               <CardHeader>
//                 <CardTitle className="text-xl text-indigo-600">
//                   {novel.title}
//                 </CardTitle>
//                 <CardDescription>
//                   <div className="flex items-center gap-2 mb-2">
//                     <User className="h-4 w-4" />
//                     {novel.author} • {novel.readingTime} read
//                   </div>
//                   <div className="flex gap-1 flex-wrap">
//                     {novel.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600 line-clamp-3">{novel.excerpt}</p>
//               </CardContent>
//               <CardFooter className="flex justify-between">
//                 <Button
//                   variant="ghost"
//                   onClick={() => setSelectedNovel(novel)}
//                   className="flex items-center gap-2"
//                 >
//                   <ScrollText className="h-4 w-4" />
//                   Read More
//                 </Button>
//                 <div className="flex items-center gap-2">
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleLike(novel.id)}
//                     className="flex items-center gap-2"
//                   >
//                     <Heart className="h-4 w-4" />
//                     {novel.likes}
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     onClick={() => setSelectedNovel(novel)}
//                     className="flex items-center gap-2"
//                   >
//                     <MessageCircle className="h-4 w-4" />
//                     {novel.comments || 0}
//                   </Button>
//                 </div>
//               </CardFooter>
//             </Card>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }
