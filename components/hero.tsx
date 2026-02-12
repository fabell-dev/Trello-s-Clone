export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center"></div>
      <h1 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Trello's Clone with{" "}
        <p>
          <span className="font-bold hover:underline">Supabase </span>and
          <span className="font-bold hover:underline"> Next.js </span>
        </p>
      </h1>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
