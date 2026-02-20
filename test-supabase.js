import { supabase, STORAGE_BUCKET } from './src/lib/supabase.ts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Storage connection...\n')

  try {
    // Test 1: List buckets
    console.log('1. Checking if bucket exists...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return
    }

    const mediaBucket = buckets?.find(b => b.name === STORAGE_BUCKET)
    if (mediaBucket) {
      console.log(`✅ Bucket '${STORAGE_BUCKET}' exists`)
      console.log(`   Public: ${mediaBucket.public}`)
    } else {
      console.error(`❌ Bucket '${STORAGE_BUCKET}' not found!`)
      console.log('\nAvailable buckets:', buckets?.map(b => b.name).join(', '))
      console.log('\n💡 Create the bucket in Supabase Dashboard:')
      console.log('   https://bwjhzfsmhxiwyxphlhpr.supabase.co/project/_/storage/buckets')
      return
    }

    // Test 2: Try uploading a test file
    console.log('\n2. Testing file upload...')
    const testContent = Buffer.from('This is a test file')
    const testFileName = `test-${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError)
      return
    }

    console.log('✅ Upload successful:', uploadData.path)

    // Test 3: Get public URL
    console.log('\n3. Getting public URL...')
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(testFileName)

    console.log('✅ Public URL:', urlData.publicUrl)

    // Test 4: Clean up - delete test file
    console.log('\n4. Cleaning up...')
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([testFileName])

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError)
    } else {
      console.log('✅ Test file deleted')
    }

    console.log('\n🎉 All tests passed! Your Supabase storage is configured correctly.')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

testSupabaseConnection()
