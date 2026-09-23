import React, { useEffect, useState, useRef } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShieldCheck, 
  Calendar, 
  ChevronDown, 
  Check, 
  X, 
  Car, 
  Home, 
  Building2, 
  Briefcase, 
  Truck, 
  Wrench, 
  CalendarDays, 
  Smartphone, 
  User, 
  Shield, 
  Layers 
} from 'lucide-react';

// --- MOCK DATA ---

const kpiData = {
  segurosNovos: {
    meta: 1200000,
    realizado: 800000,
    restante: 400000,
    percent: 67,
  },
  renovacoes: {
    meta: 800000,
    realizado: 150000,
    restante: 650000,
    percent: 19,
  }
};

const segurosStatusData = {
  emitidos: { count: 1245, percent: 68 },
  naoEmitidos: { count: 580, percent: 32 },
  total: 1825,
};

const donutStatusData = [
  { name: 'Seguros Emitidos', value: 1245, color: '#00E396' },
  { name: 'Seguros Não Emitidos', value: 580, color: '#F39C38' },
];

const produtosDataCol1 = [
  { name: 'Automóvel', percent: 22, color: '#2F80ED', icon: Car },
  { name: 'Residencial', percent: 15, color: '#00E396', icon: Home },
  { name: 'Condomínio', percent: 10, color: '#8B5CF6', icon: Building2 },
  { name: 'Empresarial', percent: 9, color: '#F39C38', icon: Briefcase },
  { name: 'Frota', percent: 8, color: '#00D2D3', icon: Truck },
  { name: 'Equipamento', percent: 6, color: '#FF4757', icon: Wrench },
];

const produtosDataCol2 = [
  { name: 'Evento', percent: 5, color: '#FFA502', icon: CalendarDays },
  { name: 'Mobi Livre', percent: 5, color: '#9B51E0', icon: Smartphone },
  { name: 'Vida', percent: 4, color: '#00D2D3', icon: User },
  { name: 'RC Profissional', percent: 3, color: '#2F80ED', icon: Shield },
  { name: 'Demais Produtos', percent: 3, color: '#718096', icon: Layers },
];

// Evolução Diária (Linhas suaves com pontos)
const evolucaoDiariaData = [
  { date: '01/04', novos: 55, renovacoes: 35 },
  { date: '03/04', novos: 65, renovacoes: 32 },
  { date: '05/04', novos: 60, renovacoes: 40 },
  { date: '07/04', novos: 70, renovacoes: 33 },
  { date: '09/04', novos: 100, renovacoes: 60 },
  { date: '11/04', novos: 90, renovacoes: 62 },
  { date: '13/04', novos: 78, renovacoes: 50 },
  { date: '15/04', novos: 68, renovacoes: 48 },
  { date: '17/04', novos: 105, renovacoes: 62 },
  { date: '19/04', novos: 88, renovacoes: 52 },
  { date: '21/04', novos: 112, renovacoes: 70 },
  { date: '23/04', novos: 92, renovacoes: 58 },
  { date: '25/04', novos: 125, renovacoes: 75 },
  { date: '27/04', novos: 140, renovacoes: 78 },
  { date: '29/04', novos: 120, renovacoes: 68 },
  { date: '30/04', novos: 158, renovacoes: 95 },
];

// --- HELPERS ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat('pt-BR').format(val);
};

// --- SPOTLIGHT CONTAINER CARD ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(450px circle at ${x}px ${y}px, rgba(243, 156, 56, 0.12), rgba(0, 227, 150, 0.05) 50%, transparent 80%)`;
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = 'transparent';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#0F141E] border border-[#1E2638] rounded-2xl relative overflow-hidden group shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 ${className}`}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
};

// --- CUSTOM TOOLTIP ---
const CustomEvolucaoTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E17]/95 border border-[#1E2638] p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-white/60 text-xs font-semibold mb-2">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs font-bold my-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white/80">{item.name}:</span>
            </div>
            <span className="text-white">{item.value} apólices</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function App() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('01/04/2025 - 30/04/2025');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-white font-['Plus_Jakarta_Sans'] flex flex-col p-4 sm:p-6 lg:p-8 cursor-none select-none">
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed w-4 h-4 rounded-full border-[1.5px] border-[#F39C38] z-[9999] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-[#F39C38]/15 backdrop-blur-xs shadow-[0_0_12px_rgba(243,156,56,0.4)]"
        style={{ left: '-100px', top: '-100px' }}
      >
        <div className="w-1.5 h-1.5 bg-[#F39C38] rounded-full shadow-[0_0_6px_#F39C38]" />
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F141E] border border-[#1E2638] flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Dashboard Comercial</h1>
              <p className="text-xs sm:text-sm text-white/50">Visão geral do desempenho da sua operação</p>
            </div>
          </div>

          {/* Date Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="bg-[#0F141E] hover:bg-[#151C2B] border border-[#1E2638] hover:border-white/20 text-white/80 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-white/60" />
              <span>{selectedDateRange}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${dateRangeOpen ? 'rotate-180' : ''}`} />
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0F141E] border border-[#1E2638] rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                {['01/04/2025 - 30/04/2025', 'Últimos 30 dias', 'Mês anterior', 'Ano atual (2025)'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedDateRange(range);
                      setDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors ${
                      selectedDateRange === range ? 'text-[#00E396] font-bold bg-[#00E396]/10' : 'text-white/70'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* --- ROW 1: CARDS PRINCIPAIS (SEGUROS NOVOS & RENOVAÇÕES) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Card: Seguros Novos */}
          <SpotlightCard className="p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[#F39C38] tracking-wider uppercase">
                SEGUROS NOVOS
              </span>
              <span className="bg-[#00E396]/15 border border-[#00E396]/30 text-[#00E396] text-xs font-bold px-2.5 py-0.5 rounded-full">
                {kpiData.segurosNovos.percent}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              {/* Highlighted Meta */}
              <div>
                <span className="text-[11px] font-semibold text-white/50 tracking-wider block mb-1 uppercase">META</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {formatCurrency(kpiData.segurosNovos.meta)}
                </span>
              </div>

              {/* Realizado & Restante */}
              <div className="flex items-center gap-6 sm:gap-8 text-right">
                <div>
                  <span className="text-[10px] font-semibold text-white/40 tracking-wider block uppercase mb-1">REALIZADO</span>
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {formatCurrency(kpiData.segurosNovos.realizado)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-white/40 tracking-wider block uppercase mb-1">RESTANTE</span>
                  <span className="text-sm sm:text-base font-bold text-white/60 tracking-tight">
                    {formatCurrency(kpiData.segurosNovos.restante)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#1A2234] rounded-full overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-[#00E396] rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(0,227,150,0.6)]"
                style={{ width: `${kpiData.segurosNovos.percent}%` }}
              />
            </div>
          </SpotlightCard>

          {/* Card: Renovações */}
          <SpotlightCard className="p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[#F39C38] tracking-wider uppercase">
                RENOVAÇÕES
              </span>
              <span className="bg-[#00E396]/15 border border-[#00E396]/30 text-[#00E396] text-xs font-bold px-2.5 py-0.5 rounded-full">
                {kpiData.renovacoes.percent}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              {/* Highlighted Meta */}
              <div>
                <span className="text-[11px] font-semibold text-white/50 tracking-wider block mb-1 uppercase">META</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {formatCurrency(kpiData.renovacoes.meta)}
                </span>
              </div>

              {/* Realizado & Restante */}
              <div className="flex items-center gap-6 sm:gap-8 text-right">
                <div>
                  <span className="text-[10px] font-semibold text-white/40 tracking-wider block uppercase mb-1">REALIZADO</span>
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {formatCurrency(kpiData.renovacoes.realizado)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-white/40 tracking-wider block uppercase mb-1">RESTANTE</span>
                  <span className="text-sm sm:text-base font-bold text-white/60 tracking-tight">
                    {formatCurrency(kpiData.renovacoes.restante)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#1A2234] rounded-full overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-[#00E396] rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(0,227,150,0.6)]"
                style={{ width: `${kpiData.renovacoes.percent}%` }}
              />
            </div>
          </SpotlightCard>

        </div>

        {/* --- ROW 2: SEGUROS EMITIDOS X NÃO EMITIDOS & DISTRIBUIÇÃO POR PRODUTO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* SEGUROS EMITIDOS x SEGUROS NÃO EMITIDOS (Left ~5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-6 flex flex-col justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider mb-6">
              SEGUROS EMITIDOS x SEGUROS NÃO EMITIDOS
            </h3>

            <div className="flex items-center justify-between gap-4 my-auto">
              
              {/* Left Column Stats */}
              <div className="flex flex-col gap-6">
                
                {/* Seguros Emitidos */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00E396] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,227,150,0.4)] mt-0.5">
                    <Check className="w-5 h-5 text-black stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white/70 block uppercase leading-tight">
                      SEGUROS<br />EMITIDOS
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-white tracking-tight">
                        {formatNumber(segurosStatusData.emitidos.count)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#00E396]">
                      {segurosStatusData.emitidos.percent}%
                    </span>
                  </div>
                </div>

                {/* Seguros Não Emitidos */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFA502] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,165,2,0.4)] mt-0.5">
                    <X className="w-5 h-5 text-black stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white/70 block uppercase leading-tight">
                      SEGUROS NÃO<br />EMITIDOS
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-white tracking-tight">
                        {formatNumber(segurosStatusData.naoEmitidos.count)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#FFA502]">
                      {segurosStatusData.naoEmitidos.percent}%
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Donut Chart with Center Total */}
              <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {donutStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TOTAL</span>
                  <span className="text-lg font-extrabold text-white tracking-tight">
                    {formatNumber(segurosStatusData.total)}
                  </span>
                </div>
              </div>

            </div>
          </SpotlightCard>

          {/* DISTRIBUIÇÃO POR PRODUTO (Right ~7 cols) */}
          <SpotlightCard className="lg:col-span-7 p-6 flex flex-col justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider mb-6">
              DISTRIBUIÇÃO POR PRODUTO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 my-auto">
              
              {/* Column 1 */}
              <div className="flex flex-col gap-3.5">
                {produtosDataCol1.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-[110px]">
                        <Icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                        <span className="font-semibold text-white/80">{item.name}</span>
                      </div>
                      
                      {/* Bar track */}
                      <div className="flex-1 h-2 bg-[#1A2234] rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percent * 3.5}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>

                      <span className="font-bold text-white/80 w-8 text-right">{item.percent}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-3.5">
                {produtosDataCol2.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-[110px]">
                        <Icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                        <span className="font-semibold text-white/80">{item.name}</span>
                      </div>
                      
                      {/* Bar track */}
                      <div className="flex-1 h-2 bg-[#1A2234] rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percent * 3.5}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>

                      <span className="font-bold text-white/80 w-8 text-right">{item.percent}%</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </SpotlightCard>

        </div>

        {/* --- ROW 3: EVOLUÇÃO DIÁRIA --- */}
        <SpotlightCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h3 className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
              EVOLUÇÃO DIÁRIA
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E396] shadow-[0_0_6px_#00E396]" />
                <span className="text-white/80">Seguros Novos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F80ED] shadow-[0_0_6px_#2F80ED]" />
                <span className="text-white/80">Renovações</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoDiariaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2234" />
                <XAxis 
                  dataKey="date" 
                  stroke="#4B5563" 
                  tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: '#1E2638' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#4B5563" 
                  domain={[0, 200]}
                  ticks={[0, 50, 100, 150, 200]}
                  tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomEvolucaoTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="novos" 
                  name="Seguros Novos"
                  stroke="#00E396" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#00E396', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#00E396', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="renovacoes" 
                  name="Renovações"
                  stroke="#2F80ED" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2F80ED', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#2F80ED', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

      </div>

      {/* Global CSS overrides for custom cursor */}
      <style dangerouslySetInnerHTML={{__html: `
        * { cursor: none !important; }
      `}} />
    </div>
  );
}
