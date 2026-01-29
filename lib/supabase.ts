import { createClient } from './supabase/client'

// Create a single supabase client for interacting with your database
const supabase = createClient()

export default supabase

export type Book = {
  id?: string | number
  name: string
  author: string
  intraduction: string,
  count: number
}


export const createBook = async (book: Book) => {
  const { data, error } = await supabase.from('books').insert(book)
  if (error) {
    console.error(error)
    throw error
  }
  return data
}

export const getBooks = async () => {
  const { data, error } = await supabase.from('books').select()
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

export const uploadFile = async (file: File) => {
  const { data, error } = await supabase.storage.from('supabase-bucket').upload('public/' + file.name, file)
  if (error) {
    console.error(error)
    throw error
  }
  console.log("uploadFile success: ", data)
  return data
}

export const getFileUrl = (path: string) => {
  const {data} = supabase.storage.from('supabase-bucket').getPublicUrl(path)
  console.log("getFileUrl success: ", data)
  return data.publicUrl
}

export const downloadFile = async (path: string) => {
  const { data, error } = await supabase.storage.from('supabase-bucket').download(path)
  if (error) {
    console.error(error)
    throw error
  }
  console.log("downloadFile success: ", data)
  return data
}

// Create a channel with a descriptive topic name
export const channel = supabase.channel('table:books')




export const callEdgeFunction = async () => {
  const { data, error } = await supabase.functions.invoke('hyper-endpoint', {body: { }})
  if (error) {
    console.error(error)
    throw error
  }
  return data
}

