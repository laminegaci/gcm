import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Ligne {
    id?: number;
    medicament_nom: string;
    dosage: string;
    frequence: string;
    duree: string;
    instructions: string;
    ordre?: number;
}

interface Favori {
    id: number;
    nom: string;
    dosage_defaut: string | null;
    frequence_defaut: string | null;
    instructions_defaut: string | null;
}

interface Props {
    ligne: Ligne;
    index: number;
    onChange: (next: Ligne) => void;
    onDelete: () => void;
    favoris?: Favori[];
    errors?: Record<string, string>;
}

export function PrescriptionLigneRow({
    ligne,
    index,
    onChange,
    onDelete,
    errors,
}: Props) {
    function update<K extends keyof Ligne>(key: K, value: Ligne[K]) {
        onChange({ ...ligne, [key]: value });
    }

    return (
        <div className="rounded-xl border border-ocean-aqua/40 bg-white p-4 shadow-sm dark:border-sidebar-border dark:bg-card">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-ocean-deep dark:text-sidebar-foreground">
                    Médicament #{index + 1}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-5">
                    <Label className="text-xs">Nom *</Label>
                    <Input
                        value={ligne.medicament_nom}
                        onChange={(e) =>
                            update('medicament_nom', e.target.value)
                        }
                        placeholder="ex: Paracétamol"
                        required
                    />
                    {errors?.medicament_nom && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.medicament_nom}
                        </p>
                    )}
                </div>
                <div className="md:col-span-3">
                    <Label className="text-xs">Dosage *</Label>
                    <Input
                        value={ligne.dosage}
                        onChange={(e) => update('dosage', e.target.value)}
                        placeholder="ex: 500mg"
                        required
                    />
                    {errors?.dosage && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.dosage}
                        </p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <Label className="text-xs">Fréquence</Label>
                    <Input
                        value={ligne.frequence}
                        onChange={(e) => update('frequence', e.target.value)}
                        placeholder="2x/jour"
                    />
                </div>
                <div className="md:col-span-2">
                    <Label className="text-xs">Durée</Label>
                    <Input
                        value={ligne.duree}
                        onChange={(e) => update('duree', e.target.value)}
                        placeholder="7 jours"
                    />
                </div>
                <div className="md:col-span-12">
                    <Label className="text-xs">Instructions</Label>
                    <Input
                        value={ligne.instructions}
                        onChange={(e) => update('instructions', e.target.value)}
                        placeholder="à prendre pendant les repas"
                    />
                </div>
            </div>
        </div>
    );
}
