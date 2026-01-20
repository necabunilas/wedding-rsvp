import Link from "next/link";
import PhotoUploadForm from "@/components/PhotoUploadForm";

export default function PhotoUploadPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <div className="text-wedding-gold text-4xl mb-8">✦</div>

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-2 italic">
            Nic & Ban
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-wedding-gold/50"></span>
            <p className="text-sm text-wedding-charcoal tracking-wider uppercase">
              June 20, 2026
            </p>
            <span className="h-px w-8 bg-wedding-gold/50"></span>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-wedding-gold/10">
          <div className="text-center mb-8">
            <p className="text-xs text-wedding-gold uppercase tracking-[0.2em] mb-2">
              Share Your
            </p>
            <h2 className="text-2xl font-serif text-wedding-wine italic">
              Memories
            </h2>
            <p className="text-wedding-gray text-sm mt-3">
              Upload your favorite moments from our celebration
            </p>
          </div>

          <PhotoUploadForm />
        </div>

        {/* Links */}
        <div className="text-center mt-8 space-y-3">
          <Link
            href="/photos"
            className="block text-wedding-wine hover:text-wedding-gold text-sm transition-colors"
          >
            View Photo Gallery →
          </Link>
          <Link
            href="/"
            className="block text-wedding-gray hover:text-wedding-wine text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">
        ✦ ✦ ✦
      </div>
    </main>
  );
}
