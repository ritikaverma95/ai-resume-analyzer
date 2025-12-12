export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source to use local file
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log("Starting PDF conversion for:", file.name);
    const lib = await loadPdfJs();
    console.log("PDF.js library loaded");

    const arrayBuffer = await file.arrayBuffer();
    console.log("File read as arrayBuffer, size:", arrayBuffer.byteLength);

    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    console.log("PDF loaded successfully");

    const page = await pdf.getPage(1);
    console.log("Page 1 retrieved");

    const viewport = page.getViewport({ scale: 4 });
    console.log("Viewport created:", { width: viewport.width, height: viewport.height });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      console.error("ERROR: Could not get 2d context for canvas");
      return { imageUrl: "", file: null, error: "Missing canvas 2D context" };
    }

    context.imageSmoothingEnabled = true;
    // @ts-ignore
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;
    console.log("PDF page rendered to canvas");

    // Convert canvas to blob using dataURL (more reliable fallback)
    const dataUrl = canvas.toDataURL("image/png");
    console.log("Canvas converted to dataURL, length:", dataUrl.length);

    const res = await fetch(dataUrl);
    console.log("Fetch response status:", res.status);

    const blob = await res.blob();
    console.log("Blob created, size:", blob.size, "type:", blob.type);

    if (!blob || blob.size === 0) {
      console.error("ERROR: Canvas blob is empty or invalid", { blobSize: blob?.size });
      return { imageUrl: "", file: null, error: "Generated image blob is invalid" };
    }

    const originalName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([blob], `${originalName}.png`, {
      type: "image/png",
    });

    console.log("✓ PDF conversion successful", { fileName: imageFile.name, size: imageFile.size });
    return { imageUrl: URL.createObjectURL(blob), file: imageFile };
  } catch (err) {
    console.error("ERROR in convertPdfToImage:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}