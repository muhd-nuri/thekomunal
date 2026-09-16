// Komunal: admin page frame — title, one-line help, optional action on the right.
export function AdminPage({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight md:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </>
  )
}
