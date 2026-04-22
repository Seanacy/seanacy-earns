import Link from "next/link";

export default function SuccessPage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-4xl">
        &#10003;
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Purchase Successful!
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Thank you for your purchase. You will receive an email with your
        download link shortly. Check your inbox (and spam folder) for the
        delivery.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent-hover"
        >
          Browse More Guides
        </Link>
      </div>
    </section>
  );
}
