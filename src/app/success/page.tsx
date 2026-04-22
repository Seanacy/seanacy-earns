"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface DownloadData {
  product_name: string;
  download_url: string | null;
  customer_email: string | null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    async function fetchDownload() {
      try {
        const res = await fetch(`/api/download?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setDownloadData(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDownload();
  }, [sessionId]);

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-4xl">
        &#10003;
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Purchase Successful!
      </h1>

      {loading ? (
        <p className="mt-4 text-lg text-muted">Loading your download...</p>
      ) : downloadData?.download_url ? (
        <>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Thank you for purchasing{" "}
            <span className="font-semibold text-foreground">
              {downloadData.product_name}
            </span>
            ! Your download is ready.
          </p>
          {downloadData.customer_email && (
            <p className="mt-2 text-sm text-muted">
              A confirmation was sent to{" "}
              <span className="text-foreground">
                {downloadData.customer_email}
              </span>
            </p>
          )}
          <div className="mt-8">
            <a
              href={downloadData.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-accent-hover"
            >
              <span className="text-2xl">&#8595;</span> Download Your Ebook
            </a>
          </div>
        </>
      ) : error ? (
        <p className="mt-4 text-lg leading-relaxed text-muted">
          We couldn&apos;t verify your purchase right now. Please check your
          email for the download link, or contact support.
        </p>
      ) : (
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Thank you for your purchase! You will receive an email with your
          download link shortly. Check your inbox (and spam folder) for the
          delivery.
        </p>
      )}

      <div className="mt-10 flex gap-4">
        <Link
          href="/"
          className="rounded-lg border border-card-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-card-bg"
        >
          Browse More Guides
        </Link>
      </div>
    </section>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-4xl">
            &#10003;
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Purchase Successful!
          </h1>
          <p className="mt-4 text-lg text-muted">
            Loading your download...
          </p>
        </section>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
