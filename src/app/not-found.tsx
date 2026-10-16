import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Shift not found</h1>
      <p>
        That shift doesn&apos;t exist, or it has been removed.{' '}
        <Link
          href="/"
          className="text-blue-800 underline outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          See the upcoming shifts
        </Link>
        .
      </p>
    </>
  )
}
