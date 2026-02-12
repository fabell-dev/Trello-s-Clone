"use client";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import {
  X as CancelIcon,
  ChevronLeft as BackIcon,
  ClipboardPlus as CreateIcon,
  SquarePen as TemplateIcon,
} from "lucide-react";
import { createBoard } from "@/lib/actions/boards";

export default function CreateBoardButton() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [boardName, setBoardName] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    setOpenDropdown(openDropdown === "create" ? null : "create");
  };
  const handleCreateOptions = () => {
    setOpenDropdown("createOptions");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boardName.trim()) {
      setError("El nombre del board es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createBoard(boardName, visibility);

      if (result.error) {
        setError(result.error);
      } else {
        // Reset form
        setBoardName("");
        setVisibility("private");
        setOpenDropdown(null);
      }
    } catch (err) {
      setError("Error inesperado al crear el board");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div ref={containerRef}>
      <Button onClick={handleCreate}>Create</Button>
      {openDropdown === "create" && (
        <>
          <div className="bg-slate-700 flex flex-col absolute rounded-xl mt-2 z-50">
            <button
              onClick={handleCreateOptions}
              className="flex flex-col items-center gap-x-4 text-left text-wrap hover:bg-slate-400 p-5 rounded-xl "
            >
              <h1>Create New Board</h1>
              <div className="flex gap-x-3 items-center">
                <CreateIcon />
                <p className="text-gray-300 text-xs w-40 mb-1">
                  Create your new Board from scratch Create your new Board from
                  scratch.
                </p>
              </div>
            </button>
            <button className="flex flex-col items-center gap-x-4 text-left text-wrap hover:bg-slate-400 p-5 rounded-xl">
              <h1>Start with Template</h1>
              <div className="flex gap-x-3 items-center">
                <TemplateIcon />
                <p className="text-gray-300 text-xs w-40 mb-1">
                  Start with a beautiful Template.
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Create Options */}
      {openDropdown === "createOptions" && (
        <div className="bg-slate-700 flex flex-col  rounded-xl mt-2 z-50 absolute">
          <div className="flex mt-2 w-100 justify-evenly">
            <button className="" onClick={handleCreate}>
              <BackIcon />
            </button>
            <h1 className="self-center">Create New Board</h1>
            <button
              className=""
              onClick={() => {
                setOpenDropdown(null);
                setError(null);
              }}
            >
              <CancelIcon />
            </button>
          </div>
          <form
            className="flex flex-col mx-3 mt-10 gap-y-4 pb-5"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="boardName"
                className="block text-sm font-medium mb-2"
              >
                Board Title
              </label>
              <input
                type="text"
                id="boardName"
                name="boardName"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Enter board name"
                className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="visibility"
                className="block text-sm font-medium mb-2"
              >
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "private" | "public")
                }
                className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded font-medium"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
          <button className="px-5 pb-5 text-gray-300 text-sm hover:text-white">
            Start with a Template
          </button>
        </div>
      )}
    </div>
  );
}
