"use client";

import Link from "next/link";

type Props = {
  id: string;
  name: string;
  description?: string;
};

export default function Board({ id, name, description }: Props) {
  return (
    <Link href={`/board/${id}`}>
      <div className="bg-slate-600 hover:bg-slate-500 w-40 h-52 cursor-pointer rounded-lg p-4 transition duration-200 flex flex-col">
        <h3 className="text-white font-semibold text-lg">{name}</h3>
        {description && (
          <p className="text-gray-300 text-sm mt-2">{description}</p>
        )}
      </div>
    </Link>
  );
}
