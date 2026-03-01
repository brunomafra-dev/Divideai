"use client";

import { ArrowLeft, Check, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/ui/bottom-nav";

interface Participant {
  id: string;
  name: string;
  userId: string | null;
}

interface TransactionRow {
  id: string;
  value: number;
  description: string;
  payer_id: string;
  participants?: string[];
  splits?: Record<string, number>;
  status?: string;
}

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const expenseId = params.expenseId as string;

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [groupName, setGroupName] = useState("Editar gasto");

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [payerId, setPayerId] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [calculatedSplits, setCalculatedSplits] = useState<Record<string, number>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const [originalPayerId, setOriginalPayerId] = useState("");
  const [expenseStatus, setExpenseStatus] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canEdit = Boolean(currentUserId && originalPayerId && currentUserId === originalPayerId);
  const canDelete = canEdit && expenseStatus === "paid";

  useEffect(() => {
    if (!groupId || !expenseId) return;

    const load = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const uid = session.user.id;
      setCurrentUserId(uid);

      const { data: groupRow, error: groupError } = await supabase
        .from("groups")
        .select("id,name")
        .eq("id", groupId)
        .single();

      if (groupError || !groupRow) {
        console.error("edit-expense.group-load-error", groupError);
        router.replace("/");
        return;
      }

      setGroupName(String(groupRow.name || "Editar gasto"));

      const { data: participantRows, error: participantError } = await supabase
        .from("participants")
        .select("id,user_id,display_name")
        .eq("group_id", groupId);

      if (participantError) {
        console.error("edit-expense.participants-load-error", participantError);
        setLoading(false);
        return;
      }

      const rows = participantRows ?? [];
      const userIds = rows
        .map((row) => String((row as { user_id?: string | null }).user_id || "").trim())
        .filter(Boolean);

      let profileMap = new Map<string, { username?: string; full_name?: string }>();
      if (userIds.length > 0) {
        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select("id,username,full_name")
          .in("id", userIds);

        if (profilesError) {
          console.error("edit-expense.profiles-load-error", profilesError);
        } else {
          for (const row of profileRows ?? []) {
            const id = String((row as { id?: string }).id || "").trim();
            if (!id) continue;
            profileMap.set(id, {
              username: String((row as { username?: string }).username || "").trim(),
              full_name: String((row as { full_name?: string }).full_name || "").trim(),
            });
          }
        }
      }

      const normalizedParticipants: Participant[] = rows.map((row) => {
        const participantId = String((row as { id?: string }).id || "").trim();
        const userId = String((row as { user_id?: string | null }).user_id || "").trim() || null;
        const profile = userId ? profileMap.get(userId) : null;
        const displayName = String((row as { display_name?: string | null }).display_name || "").trim();
        const name = profile?.username || profile?.full_name || displayName || "Participante";

        return {
          id: participantId,
          name,
          userId,
        };
      });

      setParticipants(normalizedParticipants);

      const defaultWeights: Record<string, number> = {};
      for (const participant of normalizedParticipants) {
        defaultWeights[participant.id] = 1;
      }
      setWeights(defaultWeights);

      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .select("id,value,description,payer_id,participants,splits,status")
        .eq("id", expenseId)
        .single();

      if (txError || !tx) {
        console.error("edit-expense.transaction-load-error", txError);
        setLoading(false);
        return;
      }

      const transaction = tx as TransactionRow;
      setValue(String(Number(transaction.value) || ""));
      setDescription(String(transaction.description || ""));
      setPayerId(String(transaction.payer_id || ""));
      setOriginalPayerId(String(transaction.payer_id || ""));
      setExpenseStatus(String(transaction.status || ""));

      const participantIdsFromTx = Array.isArray(transaction.participants)
        ? transaction.participants.map((id) => String(id))
        : normalizedParticipants.map((p) => p.id);
      setSelectedParticipants(participantIdsFromTx);

      if (transaction.splits && Object.keys(transaction.splits).length > 0) {
        setCalculatedSplits(transaction.splits);
        const weightMap: Record<string, number> = { ...defaultWeights };
        for (const [key, splitValue] of Object.entries(transaction.splits)) {
          weightMap[key] = Number(splitValue) > 0 ? Number(splitValue) : 1;
        }
        setWeights(weightMap);

        const values = Object.values(transaction.splits);
        const first = Number(values[0] || 0);
        const allEqual = values.every((v) => Math.abs(Number(v) - first) < 0.005);
        setSplitType(allEqual ? "equal" : "custom");
      }

      setLoading(false);
    };

    load();
  }, [expenseId, groupId, router]);

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId]
    );
  };

  const calculateEqualSplits = () => {
    const total = Number.parseFloat(value);
    if (!total || total <= 0) {
      setCalculatedSplits({});
      return {} as Record<string, number>;
    }

    const list = selectedParticipants.length > 0 ? selectedParticipants : participants.map((p) => p.id);
    const per = Number((total / Math.max(list.length, 1)).toFixed(2));
    const next: Record<string, number> = {};
    for (const id of list) {
      next[id] = per;
    }

    setCalculatedSplits(next);
    return next;
  };

  const calculateCustomSplits = () => {
    const total = Number.parseFloat(value);
    if (!total || total <= 0) {
      setCalculatedSplits({});
      return {} as Record<string, number>;
    }

    const list = selectedParticipants.length > 0 ? selectedParticipants : participants.map((p) => p.id);
    const totalWeight = list.reduce((acc, id) => acc + Math.max(Number(weights[id] || 0), 0), 0);
    if (totalWeight <= 0) {
      setCalculatedSplits({});
      return {} as Record<string, number>;
    }

    const next: Record<string, number> = {};
    for (const id of list) {
      const w = Math.max(Number(weights[id] || 0), 0);
      next[id] = Number(((total * w) / totalWeight).toFixed(2));
    }

    setCalculatedSplits(next);
    return next;
  };

  const handleUpdate = async () => {
    if (!canEdit) {
      alert("Somente quem criou o gasto pode editar.");
      return;
    }

    if (!description.trim() || !value || Number(value) <= 0 || !payerId) {
      alert("Preencha valor, descrição e pagador.");
      return;
    }

    const selected = selectedParticipants.length > 0 ? selectedParticipants : participants.map((p) => p.id);
    if (!selected.includes(payerId)) {
      selected.push(payerId);
    }

    let splitsToSave = splitType === "equal" ? calculateEqualSplits() : calculateCustomSplits();
    if (Object.keys(splitsToSave).length === 0) {
      splitsToSave = calculateEqualSplits();
    }

    const { error } = await supabase
      .from("transactions")
      .update({
        value: Number(value),
        description: description.trim(),
        payer_id: payerId,
        participants: selected,
        splits: splitsToSave,
      })
      .eq("id", expenseId)
      .eq("payer_id", currentUserId);

    if (error) {
      console.error("edit-expense.update-error", error);
      alert("Erro ao atualizar gasto.");
      return;
    }

    router.replace(`/group/${groupId}`);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!canDelete || deleting) return;

    const confirmDelete = window.confirm("Excluir este gasto quitado? Essa ação não pode ser desfeita.");
    if (!confirmDelete) return;

    setDeleting(true);
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", expenseId)
      .eq("payer_id", currentUserId);

    if (error) {
      console.error("edit-expense.delete-error", error);
      alert("Erro ao excluir gasto.");
      setDeleting(false);
      return;
    }

    router.replace(`/group/${groupId}`);
    router.refresh();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col overflow-x-hidden">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/group/${groupId}`}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>

          <h1 className="text-lg font-semibold text-gray-800 truncate px-2">{groupName}</h1>

          <div className="flex gap-2">
            <button onClick={() => router.back()} className="px-3 py-1 rounded-lg border" title="Cancelar" type="button">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleUpdate}
              disabled={!canEdit}
              className="px-3 py-1 rounded-lg bg-[#5BC5A7] text-white flex items-center gap-2 disabled:opacity-60"
              type="button"
            >
              <Check className="w-4 h-4" /> Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))] space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <label className="text-gray-600 font-medium">Valor</label>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-3xl w-full text-center border-b mt-2"
            placeholder="0,00"
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="block font-medium text-gray-600">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Churrasco, Mercado..."
            className="w-full px-4 py-2 border mt-2 rounded-lg"
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-medium text-gray-600">Quem pagou?</label>
          {participants.map((participant) => (
            <button
              key={participant.id}
              onClick={() => setPayerId(participant.id)}
              className={`w-full text-left p-3 border rounded-lg mt-2 ${payerId === participant.id ? "border-[#5BC5A7] bg-green-50" : ""}`}
              type="button"
            >
              {participant.name}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-medium text-gray-600">Quem participou?</label>
          <div className="mt-2 space-y-2">
            {participants.map((participant) => {
              const isSelected = selectedParticipants.includes(participant.id);
              return (
                <button
                  key={participant.id}
                  onClick={() => toggleParticipant(participant.id)}
                  className={`w-full p-3 rounded-lg border flex justify-between items-center ${isSelected ? "border-[#5BC5A7] bg-green-50" : "border-gray-200"}`}
                  type="button"
                >
                  <span>{participant.name}</span>
                  <span className="text-sm text-gray-600">{isSelected ? "participa" : "não"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-medium text-gray-600">Como dividir?</label>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setSplitType("equal")}
              className={`flex-1 p-2 rounded-lg ${splitType === "equal" ? "bg-[#5BC5A7] text-white" : "bg-gray-200"}`}
              type="button"
            >
              Igual
            </button>
            <button
              onClick={() => setSplitType("custom")}
              className={`flex-1 p-2 rounded-lg ${splitType === "custom" ? "bg-[#5BC5A7] text-white" : "bg-gray-200"}`}
              type="button"
            >
              Personalizada
            </button>
          </div>

          {splitType === "custom" && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600">Defina o peso de cada pessoa (0 = não participa):</p>

              {participants.map((participant) => (
                <div key={participant.id} className="flex justify-between items-center border p-2 rounded-lg">
                  <span>{participant.name}</span>
                  <input
                    type="number"
                    min={0}
                    value={weights[participant.id] ?? 0}
                    onChange={(e) => setWeights({ ...weights, [participant.id]: Number(e.target.value) })}
                    className="w-20 border rounded p-1 text-center"
                  />
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <button onClick={calculateCustomSplits} className="bg-[#5BC5A7] text-white px-4 py-2 rounded-lg" type="button">
                  Calcular divisão
                </button>
                <button onClick={() => setCalculatedSplits({})} className="px-4 py-2 rounded-lg border" type="button">
                  Limpar
                </button>
              </div>

              {Object.keys(calculatedSplits).length > 0 && (
                <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                  {Object.entries(calculatedSplits).map(([id, split]) => {
                    const participantName = participants.find((p) => p.id === id)?.name ?? id;
                    return (
                      <p key={id}>
                        <strong>{participantName}:</strong> R$ {split.toFixed(2)}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-3 rounded-lg bg-red-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Excluindo..." : "Excluir gasto quitado"}
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
