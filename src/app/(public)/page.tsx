export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          We build digital products that matter.
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Pentarch Agency partners with businesses to design, build, and scale
          web applications and digital platforms.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/contact"
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get in touch
          </a>
          <a
            href="/projects"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View our work
          </a>
        </div>
      </div>
    </div>
  );
}
