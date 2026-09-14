import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, PieChart, Pie, Cell, Tooltip } from 'recharts';

// --- MOCK DATA ---
const currentDate = 15;
const totalDays = 30;
const idealPercent = (currentDate / totalDays) * 100;

// Re-mapped to match user requested values
const kpiData = {
  segurosNovos: { target: 1200000, current: 800000 },
  renovacoes: { target: 800000, current: 150000 },
};

// Funnel Data (Mapped to match Looker's 4-bar Lead to Win Funnel)
const funnelData = [
  { name: 'Leads', value: 597 },
  { name: 'Cotações', value: 411 },
  { name: 'Propostas', value: 130 },
  { name: 'Apólices', value: 18 },
];

// 3 Donuts Data (Mapped to match Looker's 3-donut breakdown)
const donut1 = [
  { name: 'Automóvel', value: 38 },
  { name: 'Residencial', value: 24 },
  { name: 'Empresarial', value: 19 },
  { name: 'Outros', value: 19 },
];

const donut2 = [
  { name: 'Corretores', value: 39 },
  { name: 'Direto', value: 28 },
  { name: 'Parceiros', value: 17 },
  { name: 'Digital', value: 16 },
];

const donut3 = [
  { name: 'Sul', value: 35 },
  { name: 'Sudeste', value: 35 },
  { name: 'Nordeste', value: 17 },
  { name: 'Outros', value: 13 },
];

const lineData = Array.from({ length: totalDays }, (_, i) => {
  const day = i + 1;
  const baseValue = 50000 * day;
  const variance = (Math.random() - 0.2) * 30000;
  
  const isPast = day <= currentDate;
  const isToday = day === currentDate;
  
  const atual = isPast ? Math.round(baseValue + variance) : null;
  
  let meta = null;
  if (day >= currentDate) {
    if (isToday) {
      meta = atual;
    } else {
      const growthRate = 60000;
      meta = Math.round((50000 * currentDate) + (growthRate * (day - currentDate)));
    }
  }

  return {
    dia: day.toString().padStart(2, '0'),
    atual,
    meta
  };
});

const historicoDados = [
  { id: 1, tipoEntrada: 'Automóvel', dataHora: '10/09/2026 10:10', observacao: 'Nova apólice gerada. Bônus classe 4.', time: 'Há 2 min' },
  { id: 2, tipoEntrada: 'Vida Individual', dataHora: '10/09/2026 09:57', observacao: 'Atualização de faixa etária.', time: 'Há 15 min' },
  { id: 3, tipoEntrada: 'Residencial', dataHora: '10/09/2026 09:30', observacao: 'Inclusão de cobertura vendaval.', time: 'Há 42 min' },
  { id: 4, tipoEntrada: 'Empresarial', dataHora: '10/09/2026 08:12', observacao: 'Inadimplência > 60 dias.', time: 'Há 2 horas' },
  { id: 5, tipoEntrada: 'Frota', dataHora: '10/09/2026 07:12', observacao: 'Frota atualizada confirmada.', time: 'Há 3 horas' },
  { id: 6, tipoEntrada: 'Mobi Livre', dataHora: '10/09/2026 06:12', observacao: 'Aguardando vistoria prévia.', time: 'Há 4 horas' },
];

// --- UTILS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

// Flat Dark Theme Palette (Orange, Dark Orange, Green, Gray, Dark Gray)
const colorsTheme = ['#F39C38', '#d8751e', '#00AE00', '#555555', '#333333'];

// --- COMPONENTS ---
const ProgressBar = ({ label, current, target, formatFn, showIdealMarker = true }: any) => {
  const percent = (current / target) * 100;
  const color = "#00AE00"; // Always green as requested

  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      <div className="flex justify-between items-end">
        <div className="flex flex-col justify-end pb-0.5">
          <span className="text-[13px] font-extrabold text-[#F39C38] uppercase tracking-[0.1em]">{label}</span>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-[40px] font-extrabold text-white tracking-tight">{formatFn(current)}</span>
            <span className="text-[10px] font-bold text-white bg-[#00AE00]/20 px-1.5 py-0.5 rounded border border-[#00AE00]/40" style={{ color }}>
              {percent.toFixed(0)}%
            </span>
          </div>
          <span className="text-[10px] font-semibold text-white/40 mt-1">META: {formatFn(target)}</span>
        </div>
      </div>
      
      {/* Progress Bar Track */}
      <div className="w-full h-4 bg-[#333333] rounded-full relative mt-2 overflow-hidden shadow-inner border border-[#444444]">
        {/* Filled Portion */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full" 
          style={{ 
            width: `${Math.min(percent, 100)}%`, 
            backgroundColor: color,
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.2)`
          }} 
        />
        {/* Ideal Marker */}
        {showIdealMarker && (
          <div 
            className="absolute top-0 bottom-0 w-[3px] bg-white z-10 shadow-[0_0_5px_white]" 
            style={{ left: `${idealPercent}%` }} 
            title="Ideal Esperado"
          />
        )}
      </div>
      <div className="flex justify-between items-center mt-1.5 px-1">
         <span className="text-[10px] text-white/50 font-medium">Realizado: {formatFn(current)}</span>
         <span className="text-[10px] text-white/50 font-medium tracking-wide">Restante: {formatFn(target - current)}</span>
      </div>
    </div>
  );
};

// --- FUNNEL COMPONENT ---
const LeadToWinFunnel = ({ data, colorsTheme }: any) => {
  return (
    <div className="flex w-full h-full items-end pb-16 pt-6 relative px-4 lg:px-8">
      {/* Background Y-axis grid lines (Looker style flat lines) */}
      <div className="absolute inset-0 top-6 bottom-16 pointer-events-none flex flex-col justify-between z-0">
        {[600, 400, 200, 0].map((val, i) => (
          <div key={i} className="flex items-center w-full">
            <span className="text-[10px] text-white/50 w-8 text-right pr-2">{val}</span>
            <div className="flex-1 border-t border-[#333333]"></div>
          </div>
        ))}
      </div>

      <div className="w-8 shrink-0"></div> {/* Spacer for Y-axis labels */}

      {data.map((item: any, index: number) => {
        const heightPct = (item.value / 600) * 100;
        const color = colorsTheme[index % colorsTheme.length];
        const nextItem = data[index + 1];
        const conversion = nextItem ? ((nextItem.value / item.value) * 100).toFixed(2) : null;
        
        return (
           <div key={item.name} className="flex-1 flex flex-col items-center justify-end relative h-full z-10 mx-2">
              {/* Value on top of bar */}
              <span className="text-white font-bold text-[13px] mb-2 opacity-90">{item.value}</span>
              
              {/* Static Bar */}
              <div 
                className="w-full max-w-[90px] rounded-t-lg shadow-lg"
                style={{ 
                  height: `${Math.max(heightPct, 2)}%`, 
                  background: `linear-gradient(to top, ${color}80, ${color})`,
                  borderTop: `2px solid ${color}`
                }}
              ></div>

              {/* Legend Label at bottom */}
              <div className="absolute -bottom-10 w-[120%] text-center flex flex-col items-center justify-center gap-1.5">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color: color }}></div>
                <span className="text-[11px] text-white/70 font-bold uppercase tracking-wider">{item.name}</span>
              </div>

              {/* Flat Conversion Percentage (Bottom line) */}
              {conversion && (
                <div className="absolute -bottom-10 right-0 translate-x-[50%] z-20 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#2A2A2A] border border-[#444444] text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                    {conversion}%
                    <svg className="w-2.5 h-2.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
           </div>
        )
      })}
    </div>
  )
};

// --- COMPONENTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-[#333333] p-3 rounded-md shadow-lg">
        <p className="text-white/60 text-[10px] mb-2 font-bold tracking-wider uppercase">Dia {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-bold">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Spotlight Rounded Card
const SpotlightCard = ({ title, children, className = "" }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Orange/Green subtle spotlight effect
    spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(243,156,56,0.15), transparent 40%)`;
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
      className={`bg-[#121212] border border-[#2A2A2A] rounded-2xl flex flex-col shadow-lg relative overflow-hidden group/card ${className}`}
    >
      <div 
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover/card:opacity-100"
      />
      <div className="relative z-10 flex flex-col h-full">
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] shrink-0">
             <h3 className="text-white/90 font-semibold text-[13px] uppercase tracking-wider">{title}</h3>
          </div>
        )}
        <div className={`flex-1 px-5 ${title ? 'pt-4' : 'pt-0'} pb-2 relative flex flex-col min-h-0`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { 
    setMounted(true); 
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
    <div className="min-h-screen bg-[#050505] text-white font-['Plus_Jakarta_Sans'] flex overflow-hidden cursor-none selection:bg-[#F39C38]/30">
      
      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className="pointer-events-none fixed w-4 h-4 rounded-full border-[1.5px] border-[#F39C38] z-[9999] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-[#F39C38]/10 backdrop-blur-sm shadow-[0_0_10px_rgba(243,156,56,0.3)] transition-transform duration-75 ease-out"
        style={{ left: '-1000px', top: '-1000px' }}
      >
        <div className="w-1 h-1 bg-[#F39C38] rounded-full"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Header - Custom for Dashboard */}
        <header className="px-6 py-5 flex items-center justify-between shrink-0 border-b border-[#222222] bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
             <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white uppercase">
                  DASHBOARD <span className="text-[#F39C38]">TEST 01</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00AE00] shadow-[0_0_8px_#00AE00]"></div>
                  <p className="text-[10px] md:text-[11px] font-bold text-[#00AE00] uppercase tracking-[0.3em]">Status Atualizado</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right mr-4">
              <span className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Ciclo Operacional</span>
              <span className="text-sm md:text-base font-extrabold text-white tracking-widest">DIA {currentDate.toString().padStart(2, '0')} <span className="text-white/30 font-medium">/ {totalDays}</span></span>
            </div>
          </div>
        </header>

        {/* Scrollable Grid Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 custom-scrollbar">
          <div className="flex flex-col gap-4 lg:gap-6 max-w-[1600px] mx-auto">
            
            {/* Row 1: 2 Big KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <SpotlightCard className="h-[140px] p-5">
                <ProgressBar 
                  label="Seguros Novos" 
                  current={kpiData.segurosNovos.current} 
                  target={kpiData.segurosNovos.target} 
                  formatFn={formatCurrency} 
                />
              </SpotlightCard>
              
              <SpotlightCard className="h-[140px] p-5">
                <ProgressBar 
                  label="Renovações" 
                  current={kpiData.renovacoes.current} 
                  target={kpiData.renovacoes.target} 
                  formatFn={formatCurrency} 
                />
              </SpotlightCard>
            </div>

            {/* Row 2: Funnel & Donuts (Exact Looker Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              
              {/* Funnel Chart (Lead to Win equivalent) */}
              <SpotlightCard title="Funil de Conversão" className="h-[400px]">
                <LeadToWinFunnel data={funnelData} colorsTheme={colorsTheme} />
              </SpotlightCard>

              {/* 3 Donuts (Prospects by Seg/Vertical equivalent) */}
              <SpotlightCard title="Distribuição por Produto, Canal e Região" className="h-[400px]">
                <div className="grid grid-cols-3 h-full gap-4 items-start pb-4 pt-4">
                  
                  {/* Donut 1 - Produto */}
                  <div className="h-full flex flex-col items-center relative">
                    <div className="w-full h-[180px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donut1} innerRadius="55%" outerRadius="80%" dataKey="value" stroke="#1A1A1A" strokeWidth={3}>
                            {donut1.map((e, i) => <Cell key={i} fill={['#F39C38', '#d8751e', '#00AE00', '#555555'][i % 4]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-white/90 text-[11px] font-bold">Produto</span>
                      </div>
                    </div>
                    {/* Legend Produto */}
                    <div className="flex flex-col gap-1.5 mt-4 w-full px-4">
                      {donut1.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#F39C38', '#d8751e', '#00AE00', '#555555'][idx % 4] }} />
                            <span className="text-[10px] text-white/70 font-semibold truncate">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-white font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Donut 2 - Canal */}
                  <div className="h-full flex flex-col items-center relative">
                    <div className="w-full h-[180px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donut2} innerRadius="55%" outerRadius="80%" dataKey="value" stroke="#1A1A1A" strokeWidth={3}>
                            {donut2.map((e, i) => <Cell key={i} fill={['#FFB347', '#FF7F50', '#FFD700', '#DAA520'][i % 4]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-white/90 text-[11px] font-bold">Canal</span>
                      </div>
                    </div>
                    {/* Legend Canal */}
                    <div className="flex flex-col gap-1.5 mt-4 w-full px-4">
                      {donut2.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#FFB347', '#FF7F50', '#FFD700', '#DAA520'][idx % 4] }} />
                            <span className="text-[10px] text-white/70 font-semibold truncate">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-white font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Donut 3 - Região */}
                  <div className="h-full flex flex-col items-center relative">
                    <div className="w-full h-[180px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donut3} innerRadius="55%" outerRadius="80%" dataKey="value" stroke="#1A1A1A" strokeWidth={3}>
                            {donut3.map((e, i) => <Cell key={i} fill={['#00AE00', '#32CD32', '#00FA9A', '#2E8B57'][i % 4]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-white/90 text-[11px] font-bold">Região</span>
                      </div>
                    </div>
                    {/* Legend Região */}
                    <div className="flex flex-col gap-1.5 mt-4 w-full px-4">
                      {donut3.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#00AE00', '#32CD32', '#00FA9A', '#2E8B57'][idx % 4] }} />
                            <span className="text-[10px] text-white/70 font-semibold truncate">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-white font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SpotlightCard>

            </div>

            {/* Row 3: Bottom Charts/Tables (Exact Looker Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              
              {/* Evolução Diária (Line Area Chart) */}
              <SpotlightCard title="Evolução Diária" className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
                    <XAxis 
                      dataKey="dia" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="atual" 
                      stroke="#F39C38" 
                      strokeWidth={2} 
                      fill="#F39C38"
                      fillOpacity={0.15}
                      activeDot={{ r: 4, fill: "#F39C38", stroke: "#1A1A1A", strokeWidth: 2 }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#00AE00" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 4" 
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </SpotlightCard>

              {/* Histórico */}
              <SpotlightCard title="Entrada de Dados" className="h-[360px]">
                <div className="flex-1 overflow-auto w-full custom-scrollbar mt-2">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                   <thead>
                     <tr className="border-b border-[#333333]">
                       <th className="py-2.5 px-2 text-[10px] font-semibold text-white/50 uppercase tracking-wide">Tipo</th>
                       <th className="py-2.5 px-2 text-[10px] font-semibold text-white/50 uppercase tracking-wide">Data / Hora</th>
                       <th className="py-2.5 px-2 text-[10px] font-semibold text-white/50 uppercase tracking-wide">Observação</th>
                     </tr>
                   </thead>
                   <tbody>
                     {historicoDados.map((item, idx) => (
                       <tr key={item.id} className="border-b border-[#222222] hover:bg-[#222222] transition-colors">
                         <td className="py-3 px-2 text-[12px] text-white/90 font-medium">{item.tipoEntrada}</td>
                         <td className="py-3 px-2 text-[12px] text-white/60">{item.dataHora}</td>
                         <td className="py-3 px-2 text-[12px] text-white/80">{item.observacao}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                </div>
              </SpotlightCard>
              
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        * { cursor: none !important; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444444;
        }
      `}} />
    </div>
  );
}
