import { FlaskConical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Examen } from '@/types/consultation';

interface Props {
    consultationId: number;
    onCreated?: () => void;
}

export function AnalyseDialog({ consultationId, onCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [examens, setExamens] = useState<Examen[]>([
        { nom: '', code: '', urgence: false },
    ]);
    const [instructions, setInstructions] = useState('');
    const [saving, setSaving] = useState(false);

    function updateExamen(idx: number, next: Examen) {
        setExamens((prev) => prev.map((e, i) => (i === idx ? next : e)));
    }

    function addExamen() {
        setExamens((prev) => [...prev, { nom: '', code: '', urgence: false }]);
    }

    function removeExamen(idx: number) {
        if (examens.length === 1) {
            toast.error('Au moins un examen est requis.');

            return;
        }

        setExamens((prev) => prev.filter((_, i) => i !== idx));
    }

    async function save() {
        const valid = examens.filter((e) => e.nom.trim());

        if (valid.length === 0) {
            toast.error('Au moins un examen est requis.');

            return;
        }

        setSaving(true);

        try {
            const res = await fetch(
                `/consultations/${consultationId}/analyses`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        examens: valid,
                        instructions_laboratoire: instructions || null,
                    }),
                },
            );

            if (!res.ok) {
throw new Error('Erreur lors de la création');
}

            toast.success("Demande d'analyses créée.");
            setOpen(false);
            setExamens([{ nom: '', code: '', urgence: false }]);
            setInstructions('');
            onCreated?.();
        } catch {
            toast.error('Erreur lors de la création.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Demande d'analyses
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Nouvelle demande d'analyses</DialogTitle>
                    <DialogDescription>
                        Ajoutez les examens à prescrire.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Examens</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addExamen}
                            >
                                <Plus className="mr-1 h-3 w-3" />
                                Ajouter
                            </Button>
                        </div>
                        {examens.map((ex, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-2 rounded-lg border border-slate-200 p-3"
                            >
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="Nom de l'examen"
                                        value={ex.nom}
                                        onChange={(e) =>
                                            updateExamen(i, {
                                                ...ex,
                                                nom: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        placeholder="Code (optionnel)"
                                        value={ex.code ?? ''}
                                        onChange={(e) =>
                                            updateExamen(i, {
                                                ...ex,
                                                code: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <label className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Checkbox
                                            checked={!!ex.urgence}
                                            onCheckedChange={(c) =>
                                                updateExamen(i, {
                                                    ...ex,
                                                    urgence: !!c,
                                                })
                                            }
                                        />
                                        Urgent
                                    </label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                                        onClick={() => removeExamen(i)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label>Instructions pour le laboratoire</Label>
                        <Textarea
                            rows={3}
                            placeholder="Instructions optionnelles..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Annuler
                    </Button>
                    <Button type="button" onClick={save} disabled={saving}>
                        {saving ? 'Création...' : 'Créer la demande'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
