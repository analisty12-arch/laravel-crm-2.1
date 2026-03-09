import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    X,
    Calendar as CalendarIcon,
    MapPin,
    Check
} from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    type: 'meeting' | 'interview' | 'training' | 'other';
    location?: string;
    attendees?: string[];
}

export function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
        type: 'meeting',
        start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm")
    });

    useEffect(() => {
        fetchAppointments();
    }, [currentMonth]);

    async function fetchAppointments() {
        // Fallback para mock se a tabela não existir
        const { data, error } = await supabase
            .from('appointments')
            .select('*');

        if (error) {
            console.warn("Table 'appointments' not found, using mock data.");
            setAppointments(MOCK_APPOINTMENTS);
        } else {
            setAppointments(data || []);
        }
    }

    const onDateClick = (day: Date) => {
        setSelectedDate(day);
        const dateStr = format(day, "yyyy-MM-dd");
        setNewAppointment({
            ...newAppointment,
            start_time: `${dateStr}T09:00`,
            end_time: `${dateStr}T10:00`
        });
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-rose-gold-dark capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                    <p className="text-muted-foreground mt-1">Gerencie seus compromissos e agendamentos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentMonth(new Date())} className="text-xs">
                        Hoje
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-rose-gold hover:bg-rose-gold-dark text-white ml-4 gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Agendamento
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const rows: React.ReactNode[] = [];
        let daysInRow: React.ReactNode[] = [];

        days.forEach((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayAppointments = appointments.filter(app =>
                format(new Date(app.start_time), "yyyy-MM-dd") === dateStr
            );

            daysInRow.push(
                <div
                    key={dateStr}
                    className={`
                        min-h-[120px] p-2 border border-slate-100 transition-all cursor-pointer
                        ${!isSameMonth(day, monthStart) ? "bg-slate-50/50 text-slate-300" : "bg-white"}
                        ${isSameDay(day, selectedDate) ? "ring-2 ring-rose-gold ring-inset bg-rose-gold/5" : ""}
                        hover:bg-slate-50
                    `}
                    onClick={() => onDateClick(day)}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`
                            text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                            ${isToday(day) ? "bg-rose-gold text-white" : ""}
                        `}>
                            {format(day, "d")}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map(app => (
                            <div
                                key={app.id}
                                className={`
                                    text-[10px] px-1.5 py-0.5 rounded border truncate
                                    ${app.type === 'interview' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        app.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'}
                                `}
                            >
                                {format(new Date(app.start_time), "HH:mm")} {app.title}
                            </div>
                        ))}
                        {dayAppointments.length > 3 && (
                            <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                                + {dayAppointments.length - 3} mais
                            </div>
                        )}
                    </div>
                </div>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(<div key={i} className="grid grid-cols-7">{daysInRow}</div>);
                daysInRow = [];
            }
        });

        return <div className="border rounded-xl overflow-hidden shadow-soft">{rows}</div>;
    };

    const handleSave = async () => {
        if (!newAppointment.title) return;

        const appointment = {
            id: Math.random().toString(36).substr(2, 9),
            ...newAppointment,
            created_at: new Date().toISOString()
        } as Appointment;

        // Try to save to supabase or just mock update
        setAppointments([...appointments, appointment]);
        setIsModalOpen(false);
        setNewAppointment({
            type: 'meeting',
            start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm")
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {renderHeader()}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Calendário Principal */}
                <div className="lg:col-span-3">
                    {renderDays()}
                    {renderCells()}
                </div>

                {/* Sidebar com Detalhes */}
                <div className="space-y-6">
                    <Card className="border-none shadow-soft">
                        <CardHeader className="pb-3 border-b border-rose-gold/10">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-gold flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-6">
                            <div className="space-y-4">
                                {appointments
                                    .filter(app => isSameDay(new Date(app.start_time), selectedDate))
                                    .length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-muted-foreground italic">Nenhum compromisso agendado para este dia.</p>
                                    </div>
                                ) : (
                                    appointments
                                        .filter(app => isSameDay(new Date(app.start_time), selectedDate))
                                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                        .map(app => (
                                            <div key={app.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-rose-gold/30 transition-all group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <Badge variant="outline" className="text-[10px] h-4 uppercase">
                                                        {app.type}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(app.start_time), "HH:mm")}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-sm text-slate-800">{app.title}</h4>
                                                {app.location && (
                                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {app.location}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                )
                                }
                                <Button
                                    className="w-full bg-rose-gold/5 text-rose-gold hover:bg-rose-gold hover:text-white border-dashed border-rose-gold/20"
                                    variant="outline"
                                    onClick={() => {
                                        onDateClick(selectedDate);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Evento
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-rose-gold/5 border-rose-gold/10">
                        <CardContent className="p-4 flex gap-3 text-xs text-rose-gold-dark italic">
                            <Clock className="h-4 w-4 shrink-0" />
                            <p>Os horários seguem o fuso de Brasília. Você receberá notificações no feed internos para compromissos do dia.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Agendamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="bg-white dark:bg-card w-full max-w-[450px] border-rose-gold/20 shadow-2xl">
                        <CardHeader className="bg-muted/10 border-b border-rose-gold/10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-serif text-rose-gold-dark">
                                    Agendar Compromisso
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Título do Evento</Label>
                                <Input
                                    placeholder="Ex: Entrevista Marketing"
                                    value={newAppointment.title || ''}
                                    onChange={e => setNewAppointment({ ...newAppointment, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Início</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newAppointment.start_time}
                                        onChange={e => setNewAppointment({ ...newAppointment, start_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fim</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newAppointment.end_time}
                                        onChange={e => setNewAppointment({ ...newAppointment, end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
                                    value={newAppointment.type}
                                    onChange={e => setNewAppointment({ ...newAppointment, type: e.target.value as any })}
                                >
                                    <SelectItem value="meeting">Reunião</SelectItem>
                                    <SelectItem value="interview">Entrevista</SelectItem>
                                    <SelectItem value="training">Treinamento</SelectItem>
                                    <SelectItem value="other">Outro</SelectItem>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Localização / Link</Label>
                                <Input
                                    placeholder="Ex: Sala 2 ou Link Meet"
                                    value={newAppointment.location || ''}
                                    onChange={e => setNewAppointment({ ...newAppointment, location: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-rose-gold/10">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSave} className="bg-rose-gold text-white hover:bg-rose-gold-dark gap-2">
                                    <Check className="h-4 w-4" />
                                    Confirmar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function SelectItem({ value, children }: { value: string, children: React.ReactNode }) {
    return <option value={value}>{children}</option>;
}

const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: "1",
        title: "Entrevista - Analista Financeiro",
        type: "interview",
        start_time: format(addDays(new Date(), 1), "yyyy-MM-dd'T'14:00"),
        end_time: format(addDays(new Date(), 1), "yyyy-MM-dd'T'15:00"),
        location: "Sala de Reuniões 01"
    },
    {
        id: "2",
        title: "Treinamento Boas-Vindas",
        type: "training",
        start_time: format(addDays(new Date(), 2), "yyyy-MM-dd'T'09:00"),
        end_time: format(addDays(new Date(), 2), "yyyy-MM-dd'T'11:00"),
        location: "Auditório Principal"
    }
];
