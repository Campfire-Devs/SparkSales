function PageTemplate({ title, icon, description, children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              {title}
            </h1>

            {icon && (
              <span className="text-3xl">
                {icon}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-2 max-w-3xl text-slate-600">
              {description}
            </p>
          )}
        </div>

        {/* Page Content */}
        <main>
          {children}
        </main>

      </div>
    </div>
  );
}

export default PageTemplate;