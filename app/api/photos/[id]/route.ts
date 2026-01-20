import { NextRequest, NextResponse } from "next/server";
import { deletePhoto, getPhotoById } from "@/lib/photos";
import { isAuthenticated } from "@/lib/auth";

// DELETE - Delete a photo (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if photo exists
    const photo = await getPhotoById(id);
    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Delete the photo
    const deleted = await deletePhoto(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
