import { getSupabaseClient } from './supabase'

export async function fetchUserPhotos({ userId, page = 0, limit = 12 }) {
  const supabase = getSupabaseClient()
  const from = page * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('photos')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    photos: data,
    total: count,
    hasMore: count > to + 1,
  }
}

export async function deletePhoto(photoId) {
  const supabase = getSupabaseClient()
  
  // 먼저 스토리지에서 파일 삭제
  const { data: photo } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', photoId)
    .single()

  if (photo?.storage_path) {
    await supabase.storage
      .from('photos')
      .remove([photo.storage_path])
  }

  // 그 다음 데이터베이스에서 레코드 삭제
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    throw error
  }
}

export async function uploadPhoto({ userId, file, title }) {
  const supabase = getSupabaseClient()
  
  // 스토리지에 파일 업로드
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (uploadError) {
    throw uploadError
  }

  // 데이터베이스에 레코드 생성
  const { data, error } = await supabase
    .from('photos')
    .insert([
      {
        user_id: userId,
        title,
        storage_path: fileName,
      },
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
