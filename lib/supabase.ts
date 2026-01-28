import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default supabase

export type Book = {
  id?: string | number
  name: string
  author: string
  introduction: string,
  count: number
}


export const createBook = async (book: Book) => {
  const { data, error } = await supabase.from('books').insert([book])
  if (error) {
    console.error(error)
    throw error
  }
  return data
}

export const getBooks = async () => {
  const { data, error } = await supabase.from('books').select()
  console.log("getBooks", data)
  if (error) {
    console.error(error)
    throw error
  }
  return data
}

export const updateBook = async (book: Book) => {
  const { error } = await supabase.from('books').update(book).eq('id', book.id)
  if (error) {
    console.error(error)
    throw error
  }
  return book
}

export const deleteBook = async (id: string | number) => {
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) {
    console.error(error)
    throw error
  }
}
