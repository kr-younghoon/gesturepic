import { getSupabaseClient } from './supabase'

export async function updateUserProfile({ name, avatar }) {
  const supabase = getSupabaseClient()
  let avatarUrl = undefined

  // Upload avatar if provided
  if (avatar) {
    const fileExt = avatar.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatar)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    avatarUrl = publicUrl
  }

  // Update user metadata
  const { data, error } = await supabase.auth.updateUser({
    data: {
      name,
      ...(avatarUrl && { avatar_url: avatarUrl }),
    },
  })

  if (error) {
    throw error
  }

  return data
}
