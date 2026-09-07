const PageTemplate = ({
  icon,
  title,
  description,
  purpose,
  functionality = [],
}) => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-spark-tertiary text-spark-primary">
            {icon}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-spark-primary">
            {title}
          </h1>

          <p className="mt-2 max-w-3xl text-base leading-7 text-gray-600">
            {description}
          </p>
        </div>
      </div>

      {/* Purpose */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-spark-secondary">
          Page Purpose
        </p>

        <p className="text-gray-700">
          {purpose}
        </p>
      </div>

      {/* Planned Functionality */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-spark-secondary">
            Planned Functionality
          </p>

          <p className="mt-1 text-sm text-gray-500">
            This page is currently a development template.
          </p>
        </div>

        <div className="space-y-3">
          {functionality.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-spark-neutral p-4"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-spark-primary text-xs font-bold text-white">
                {index + 1}
              </span>

              <p className="text-sm text-gray-700">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Development Notice */}
      <div className="rounded-2xl border border-spark-secondary/30 bg-spark-tertiary/40 p-6">
        <p className="font-semibold text-spark-primary">
          🚧 Development Template
        </p>

        <p className="mt-2 text-sm leading-6 text-spark-primary/80">
          This page provides the initial structure and requirements for the
          assigned development task. Replace this template with the completed
          page functionality when implementation begins.
        </p>
      </div>
    </div>
  );
};

export default PageTemplate;