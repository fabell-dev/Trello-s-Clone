"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { acceptBoardInvitation } from "@/lib/actions/invitations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface AcceptInvitationClientProps {
  code: string;
}

export function AcceptInvitationClient({ code }: AcceptInvitationClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    acceptInvitation();
  }, [code]);

  async function acceptInvitation() {
    try {
      const result = await acceptBoardInvitation(code);

      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else if (result.success && result.boardId) {
        setStatus("success");
        setMessage("¡Invitación aceptada! Accediendo al board...");
        // Redirigir al board después de 2 segundos
        setTimeout(() => {
          router.push(`/board/${result.boardId}`);
        }, 2000);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Error inesperado al aceptar la invitación");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center gap-4">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <h2 className="text-xl font-semibold">
                Procesando invitación...
              </h2>
              <p className="text-gray-500">Por favor espera</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="text-green-600" size={48} />
              <h2 className="text-xl font-semibold text-green-600">
                ¡Bienvenido!
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="text-red-600" size={48} />
              <h2 className="text-xl font-semibold text-red-600">
                Error de Invitación
              </h2>
              <p className="text-gray-600">{message}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-4"
              >
                Volver al Dashboard
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
