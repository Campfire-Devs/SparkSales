function PageTemplate({ title, description, action, children }) {
  return <div><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-extrabold tracking-tight text-[#063D35] sm:text-4xl">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base">{description}</p>}</div>{action}</div>{children}</div>;
}
export default PageTemplate;
