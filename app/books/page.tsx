"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent} from "@/components/ui/card";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Trash2, Edit, Plus, BookOpen } from "lucide-react";
import supabase,{channel, Book, createBook, getBooks, updateBook, deleteBook } from "@/lib/supabase";



interface FormData {
  name: string;
  author: string;
  introduction: string;
  count: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    author: "",
    introduction: "",
    count: 0, 
  });

  useEffect(() => {
    fetchBooks();

    fetchEdgeFunction();

    // 创建实时订阅
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'books' }, 
        (payload) => {
          console.log('New message:', payload);
          fetchBooks(); // 当数据变化时重新获取书籍列表
        }
      )
      .subscribe();

    // 组件卸载时取消订阅
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEdgeFunction = async ()=>{

    console.log("fetch edge function");
    const data = await fetch("http://localhost:3000/api/edge-function");
    const json = await data.json();
    console.log("fetch edge function, data123:", json);
  }

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
      setIsSubmitting(true);
      const bookData = {
        name: formData.name,
        author: formData.author,
        intraduction: formData.introduction,
        count: formData.count || 0, 
      };

      if (editingBook) {
        await updateBook({ ...bookData, id: editingBook.id });
      } else {
        await createBook(bookData);
      }

      await fetchBooks();
      resetForm();
    } catch (error) {
      console.error("Error saving book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    setDeletingBookId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBookId) return;
    try {
      setIsDeleting(true);
      await deleteBook(deletingBookId);
      await fetchBooks();
      setIsDeleteModalOpen(false);
      setDeletingBookId(null);
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingBookId(null);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      name: book.name,
      author: book.author,
      introduction: book.intraduction,
      count: book.count || 0, 
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setFormData({ name: "", author: "", introduction: "", count: 0 });
    setEditingBook(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">书籍管理</h1>
          </div>
          <Button onClick={openAddModal} className="gap-2">
            <Plus className="h-4 w-4" />
            添加书籍
          </Button>
        </div>

        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalContent className="sm:max-w-md">
            <ModalHeader>
              <ModalTitle>{editingBook ? "编辑书籍" : "添加新书籍"}</ModalTitle>
              <ModalDescription>
                {editingBook ? "更新书籍信息" : "填写书籍详细信息"}
              </ModalDescription>
            </ModalHeader>
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
                  onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
                  placeholder="请输入数量"
                  required
                />
              </div>
              <ModalFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingBook ? "更新中..." : "添加中..."}
                    </>
                  ) : (
                    editingBook ? "更新" : "添加"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <ModalContent className="sm:max-w-md">
            <ModalHeader>
              <ModalTitle>确认删除</ModalTitle>
              <ModalDescription>
                您确定要删除这本书吗？此操作无法撤销。
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                取消
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    删除中...
                  </>
                ) : (
                  "删除"
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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
          <div className="space-y-4">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium">{book.name}</h3>
                          <p className="text-sm text-muted-foreground">作者: {book.author}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-sm font-medium">数量: {book.count}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(book)}
                              className="h-8 px-3"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(book.id || 0)}
                              className="h-8 px-3"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                      {book.intraduction && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {book.intraduction}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}