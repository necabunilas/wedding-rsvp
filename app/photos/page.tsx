import Link from "next/link";
import { getAllPhotos } from "@/lib/photos";
import PhotoGallery from "@/components/PhotoGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PhotosPage() {
  const photos = await getAllPhotos();

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-wedding-gold text-3xl mb-6">✦</div>
          <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-2 italic">
            Nic & Ban
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-8 bg-wedding-gold/50"></span>
            <p className="text-sm text-wedding-charcoal tracking-wider uppercase">
              Photo Gallery
            </p>
            <span className="h-px w-8 bg-wedding-gold/50"></span>
          </div>
          <p className="text-wedding-gray">
            {photos.length} {photos.length === 1 ? "memory" : "memories"} shared
          </p>
        </div>

        {/* Gallery */}
        <PhotoGallery photos={photos} />

        {/* Upload CTA */}
        <div className="text-center mt-12 py-8 border-t border-wedding-gold/20">
          <p className="text-wedding-gray mb-4">Have photos to share?</p>
          <Link
            href="/photos/upload"
            className="inline-block py-3 px-6 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-colors font-medium"
          >
            Upload Photos
          </Link>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-wedding-gray hover:text-wedding-wine text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="text-center mt-12 text-wedding-gold/50 text-2xl tracking-widest">
          ✦ ✦ ✦
        </div>
      </div>
    </main>
  );
}
