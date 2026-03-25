export default function DestinationLoading() {
  return (
    <main className="min-h-screen bg-white animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[75vh] min-h-[520px] bg-gray-200" />

      {/* Overview skeleton */}
      <div className="py-12 max-w-5xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-px bg-gray-100 mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded-full w-full" />
          <div className="h-4 bg-gray-100 rounded-full w-5/6" />
          <div className="h-4 bg-gray-100 rounded-full w-4/6" />
        </div>
      </div>

      {/* Attractions skeleton */}
      <div className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="h-8 bg-gray-100 rounded-full w-48 mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotels skeleton */}
      <div className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-100">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
