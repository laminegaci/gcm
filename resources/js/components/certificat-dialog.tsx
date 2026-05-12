import { FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    consultationId: number;
    onCreated?: () => void;
}

export function CertificatDialog({ consultationId, onCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('repos');
    const [nombreJours, setNombreJours] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [contenu, setContenu] = useState('');
    const [saving, setSaving] = useState(false);

    async function save() {
        if (!contenu.trim()) {
            toast.error('Le contenu du certificat est requis.');

            return;
        }

        setSaving(true);

        try {
            const res = await fetch(
                `/consultations/${consultationId}/certificats`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        type,
                        nombre_jours: nombreJours ? Number(nombreJours) : null,
                        date_debut: dateDebut || null,
                        contenu,
                    }),
                },
            );

            if (!res.ok) {
throw new Error('Erreur lors de la création');
}

            toast.success('Certificat créé.');
            setOpen(false);
            reset();
            onCreated?.();
        } catch {
            toast.error('Erreur lors de la création du certificat.');
        } finally {
            setSaving(false);
        }
    }

    function reset() {
        setType('repos');
        setNombreJours('');
        setDateDebut('');
        setContenu('');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Certificat médical
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nouveau certificat médical</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations pour générer un certificat.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="repos">Repos</SelectItem>
                                <SelectItem value="aptitude">
                                    Aptitude
                                </SelectItem>
                                <SelectItem value="inaptitude">
                                    Inaptitude
                                </SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'repos' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nombre de jours</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={nombreJours}
                                    onChange={(e) =>
                                        setNombreJours(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Date de début</Label>
                                <Input
                                    type="date"
                                    value={dateDebut}
                                    onChange={(e) =>
                                        setDateDebut(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>Contenu du certificat</Label>
                        <Textarea
                            rows={6}
                            placeholder="Je soussigné, Dr. ..., certifie avoir examiné..."
                            value={contenu}
                            onChange={(e) => setContenu(e.target.value)}
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
                        {saving ? 'Création...' : 'Créer le certificat'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
