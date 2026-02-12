import { Suspense } from "react";
import { AcceptInvitationClient } from "@/components/new_refactor/accept-invitation-client";
import { Card } from "@/components/ui/card";

interface Props {
  params: Promise<{ code: string }>;
}

async function AcceptInvitationContent({ params }: Props) {
  const { code } = await params;
  return <AcceptInvitationClient code={code} />;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <h2 className="text-xl font-semibold">Procesando invitación...</h2>
          <p className="text-gray-500">Por favor espera</p>
        </div>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent params={params} />
    </Suspense>
  );
}
