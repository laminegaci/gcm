import {
    Activity,
    Heart,
    Thermometer,
    Weight,
    Ruler,
    Droplets,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ConstantesVitales } from '@/types/consultation';

interface Props {
    values: ConstantesVitales;
    onChange: (next: ConstantesVitales) => void;
    errors?: Record<string, string>;
}

function update(
    values: ConstantesVitales,
    key: keyof ConstantesVitales,
    val: string,
) {
    const num = val === '' ? null : Number(val);

    return { ...values, [key]: Number.isNaN(num) ? null : num };
}

function imcRange(
    imc: number | null | undefined,
): { label: string; class: string } | null {
    if (imc === null || imc === undefined) {
return null;
}

    if (imc < 18.5) {
return {
            label: 'Insuffisance pondérale',
            class: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        };
}

    if (imc < 25) {
return {
            label: 'Normal',
            class: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
        };
}

    if (imc < 30) {
return {
            label: 'Surpoids',
            class: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        };
}

    return {
        label: 'Obésité',
        class: 'bg-red-100 text-red-700 hover:bg-red-100',
    };
}

function isAbnormal(key: string, val: number | null | undefined): boolean {
    if (val === null || val === undefined) {
return false;
}

    switch (key) {
        case 'tension_systolique':
            return val < 90 || val > 140;
        case 'tension_diastolique':
            return val < 60 || val > 90;
        case 'pouls':
            return val < 60 || val > 100;
        case 'temperature':
            return val < 36 || val > 38;
        case 'spo2':
            return val < 95;
        default:
            return false;
    }
}

export function VitalSignsInput({ values, onChange, errors }: Props) {
    const imc =
        values.poids && values.taille
            ? Math.round(
                  (values.poids /
                      ((values.taille / 100) * (values.taille / 100))) *
                      10,
              ) / 10
            : null;
    const imcInfo = imcRange(imc);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field
                    label="Tension systolique"
                    icon={<Activity className="h-4 w-4 text-ocean-teal" />}
                    unit="mmHg"
                    value={values.tension_systolique}
                    abnormal={isAbnormal(
                        'tension_systolique',
                        values.tension_systolique,
                    )}
                    onChange={(v) =>
                        onChange(update(values, 'tension_systolique', v))
                    }
                    error={errors?.tension_systolique}
                />
                <Field
                    label="Tension diastolique"
                    icon={<Activity className="h-4 w-4 text-ocean-teal" />}
                    unit="mmHg"
                    value={values.tension_diastolique}
                    abnormal={isAbnormal(
                        'tension_diastolique',
                        values.tension_diastolique,
                    )}
                    onChange={(v) =>
                        onChange(update(values, 'tension_diastolique', v))
                    }
                    error={errors?.tension_diastolique}
                />
                <Field
                    label="Pouls"
                    icon={<Heart className="h-4 w-4 text-ocean-coral" />}
                    unit="bpm"
                    value={values.pouls}
                    abnormal={isAbnormal('pouls', values.pouls)}
                    onChange={(v) => onChange(update(values, 'pouls', v))}
                />
                <Field
                    label="Température"
                    icon={<Thermometer className="h-4 w-4 text-amber-500" />}
                    unit="°C"
                    value={values.temperature}
                    abnormal={isAbnormal('temperature', values.temperature)}
                    onChange={(v) => onChange(update(values, 'temperature', v))}
                />
                <Field
                    label="Poids"
                    icon={<Weight className="h-4 w-4 text-ocean-deep" />}
                    unit="kg"
                    value={values.poids}
                    onChange={(v) => onChange(update(values, 'poids', v))}
                />
                <Field
                    label="Taille"
                    icon={<Ruler className="h-4 w-4 text-ocean-deep" />}
                    unit="cm"
                    value={values.taille}
                    onChange={(v) => onChange(update(values, 'taille', v))}
                />
                <Field
                    label="SpO₂"
                    icon={<Droplets className="h-4 w-4 text-blue-500" />}
                    unit="%"
                    value={values.spo2}
                    abnormal={isAbnormal('spo2', values.spo2)}
                    onChange={(v) => onChange(update(values, 'spo2', v))}
                />
                <div className="flex flex-col justify-end">
                    <Label className="mb-2 block text-xs text-slate-500">
                        IMC
                    </Label>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'text-lg font-bold',
                                imcInfo?.class.includes('red')
                                    ? 'text-red-600'
                                    : imcInfo?.class.includes('amber')
                                      ? 'text-amber-600'
                                      : 'text-emerald-600',
                            )}
                        >
                            {imc !== null ? imc.toFixed(1) : '—'}
                        </span>
                        {imcInfo && (
                            <Badge className={cn('text-[10px]', imcInfo.class)}>
                                {imcInfo.label}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    icon,
    unit,
    value,
    abnormal,
    onChange,
    error,
}: {
    label: string;
    icon: React.ReactNode;
    unit: string;
    value: number | null | undefined;
    abnormal?: boolean;
    onChange: (v: string) => void;
    error?: string;
}) {
    return (
        <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                {icon}
                {label}
            </Label>
            <div className="relative">
                <Input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        'pr-10',
                        abnormal &&
                            'border-red-400 ring-1 ring-red-200 focus-visible:ring-red-400',
                    )}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">
                    {unit}
                </span>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
