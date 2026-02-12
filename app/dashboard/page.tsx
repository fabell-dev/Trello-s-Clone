import CreateBoardButton from "@/components/new_refactor/create-board-button";
import Board from "@/components/new_refactor/board";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function BoardsContent() {
  const supabase = await createClient();
  const { data } = await supabase.from("boards").select("*");
  return (
    <div className="flex justify-center gap-x-10 h-80 mt-10">
      {data &&
        data.map((item, index) => (
          <Board
            key={index}
            id={item.id}
            name={item.name}
            description={item.description}
          />
        ))}
    </div>
  );
}

export default async function Boards() {
  return (
    <main className="   flex flex-col justify-evenly mt-20 border border-white-500 rounded-lg  mx-20 h-50 ">
      <div className="flex justify-evenly mt-5">
        <h1 className="text-4xl">Boards</h1>

        <CreateBoardButton />
      </div>
      <Suspense fallback="Cargando">
        <BoardsContent />
      </Suspense>
    </main>
  );
}
