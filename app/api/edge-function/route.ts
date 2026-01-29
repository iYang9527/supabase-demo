import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient('https://hzgvyizalknzmogwfowz.supabase.co', 'fe43f0425fbf14a2f2d4b3433f93cee3f95b8aa69b4a151a3ca17282cf5b9425')

    const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'JavaScript' },
})
console.log(data)
    if (error) {
      console.error('Error calling edge function:', error);
      return NextResponse.json({ error: 'Failed to call edge function' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling edge function:', error);
    return NextResponse.json({ error: 'Failed to call edge function' }, { status: 500 });
  }
}

export async function POST() {
  try {
   const supabase = createClient('https://hzgvyizalknzmogwfowz.supabase.co', 'fe43f0425fbf14a2f2d4b3433f93cee3f95b8aa69b4a151a3ca17282cf5b9425')

     const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'JavaScript' },
})
    if (error) {
      console.error('Error calling edge function:', error);
      return NextResponse.json({ error: 'Failed to call edge function' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling edge function:', error);
    return NextResponse.json({ error: 'Failed to call edge function' }, { status: 500 });
  }
}
