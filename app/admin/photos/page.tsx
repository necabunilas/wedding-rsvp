import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { getAllPhotos } from "@/lib/photos";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import AdminPhotoGrid from "@/components/AdminPhotoGrid";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const photos = await getAllPhotos();

  // Get the base URL for QR code
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const uploadUrl = `${baseUrl}/photos/upload`;

  // Count unique uploaders
  const uniqueUploaders = new Set(photos.map((p) => p.uploaderName)).size;

  return (
    <main className="min-h-screen bg-wedding-off-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/admin"
              className="text-wedding-gray hover:text-wedding-wine text-sm mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif text-wedding-wine italic">
              Photo Gallery
            </h1>
          </div>
          <Link
            href="/photos"
            className="inline-block py-2 px-4 border border-wedding-gold/30 rounded-lg text-wedding-wine hover:bg-wedding-gold/10 transition-colors text-sm"
          >
            View Public Gallery →
          </Link>
        </div>

        {/* Stats & QR Code Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-6 border border-wedding-gold/10 shadow-sm">
            <h2 className="text-lg font-medium text-wedding-charcoal mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-wedding-cream rounded-xl p-4 text-center">
                <p className="text-3xl font-serif text-wedding-wine">
                  {photos.length}
                </p>
                <p className="text-wedding-gray text-sm">Photos</p>
              </div>
              <div className="bg-wedding-cream rounded-xl p-4 text-center">
                <p className="text-3xl font-serif text-wedding-wine">
                  {uniqueUploaders}
                </p>
                <p className="text-wedding-gray text-sm">Guests</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-6 border border-wedding-gold/10 shadow-sm">
            <h2 className="text-lg font-medium text-wedding-charcoal mb-4 text-center">
              QR Code for Guests
            </h2>
            <QRCodeDisplay url={uploadUrl} />
          </div>
        </div>

        {/* Photos Grid */}
        <div className="bg-white rounded-2xl p-6 border border-wedding-gold/10 shadow-sm">
          <h2 className="text-lg font-medium text-wedding-charcoal mb-6">
            All Photos ({photos.length})
          </h2>
          <AdminPhotoGrid initialPhotos={photos} />
        </div>
      </div>
    </main>
  );
}
