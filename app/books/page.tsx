"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus, BookOpen } from "lucide-react";
import { Book, createBook, getBooks, updateBook, deleteBook } from "@/lib/supabase";
import supabase from "@/lib/supabase";


interface FormData {
  name: string;
  author: string;
  introduction: string;
  count: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    author: "",
    introduction: "",
    count: "",
  });

  useEffect(() => {
    fetchBooks();

    
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      console.log("init load books:", data);
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookData = {
        name: formData.name,
        author: formData.author,
        introduction: formData.introduction,
        count: parseInt(formData.count) || 0,
      };

      if (editingBook) {
        await updateBook({ ...bookData, id: editingBook.id });
      } else {
        const { error } = await supabase.from("books").insert([bookData]);
        if (error) throw error;
      }

      await fetchBooks();
      resetForm();
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("确定要删除这本书吗？")) return;
    try {
      await deleteBook(id);
      await fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      name: book.name,
      author: book.author,
      introduction: book.introduction,
      count: book.count.toString(),
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", author: "", introduction: "", count: "" });
    setEditingBook(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">书籍管理</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            添加书籍
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingBook ? "编辑书籍" : "添加新书籍"}</CardTitle>
              <CardDescription>
                {editingBook ? "更新书籍信息" : "填写书籍详细信息"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">书名</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入书名"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">作者</label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="请输入作者"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">介绍</label>
                  <textarea
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    placeholder="请输入书籍介绍"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">数量</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.count}
                    onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                    placeholder="请输入数量"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingBook ? "更新" : "添加"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : books.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无书籍，点击上方按钮添加第一本书</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{book.name}</CardTitle>
                  <CardDescription>作者: {book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {book.introduction || "暂无介绍"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">数量: {book.count}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(book)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(book.id || 0)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}