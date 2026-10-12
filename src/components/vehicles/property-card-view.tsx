import type { PropertyCard } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

interface PropertyCardViewProps {
  propertyCard: PropertyCard;
}

const DetailItem = ({ label, value, smallValue = false }: { label: string; value?: React.ReactNode, smallValue?: boolean }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{label}</p>
    <p className={`font-mono font-bold uppercase ${smallValue ? 'text-sm' : 'text-base'}`}>{value || 'N/A'}</p>
  </div>
);

const BackDetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{label}</p>
    <p className="font-mono text-xs uppercase font-bold">{value || 'N/A'}</p>
  </div>
);


export function PropertyCardView({ propertyCard }: PropertyCardViewProps) {
  const { front, back } = propertyCard;
  
  return (
    <div className="space-y-8">
      {/* Front of the card */}
      <div className="bg-white text-black rounded-xl shadow-2xl p-6 border-2 border-gray-200 w-full max-w-2xl mx-auto relative overflow-hidden font-sans">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 50H83.3333V150H116.667V50H150V16.6667H50V50Z" fill="black"/>
          </svg>
        </div>
        
        {/* Header */}
        <div className="relative grid grid-cols-3 items-start mb-4 pb-2 border-b-2 border-gray-300">
          <div className="flex items-center gap-2">
            <Image src="/coat-of-arms.svg" alt="Escudo de Colombia" width={50} height={50} />
            <div className="text-[8px] font-bold text-gray-600">
              <p>Libertad</p>
              <p>y Orden</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm tracking-wider">REPÚBLICA DE COLOMBIA</p>
            <p className="text-[10px] font-semibold">MINISTERIO DE TRANSPORTE</p>
          </div>
          <div className="flex justify-end">
            <div className="w-14 h-14 bg-black flex items-center justify-center rounded-full">
              <svg className="w-10 h-10" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 50H83.3333V150H116.667V50H150V16.6667H50V50Z" fill="#FBBF24"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative text-center mb-6">
          <p className="text-lg font-bold tracking-widest">LICENCIA DE TRÁNSITO No. <span className="font-mono">{front.numeroLicencia}</span></p>
        </div>

        {/* Main Content */}
        <div className="relative grid grid-cols-4 gap-x-4 gap-y-5">
          <DetailItem label="Placa" value={back.placa} />
          <DetailItem label="Marca" value={back.marca} />
          <DetailItem label="Línea" value={back.linea} />
          <DetailItem label="Modelo" value={back.modelo} />
          <DetailItem label="Cilindraje CC" value={back.cilindraje} smallValue />
          <DetailItem label="Color" value={back.color} />
          <DetailItem label="Servicio" value={back.servicio} />
          <DetailItem label="Capacidad Kg/PSJ" value={back.capacidad} smallValue />
          <DetailItem label="Clase de Vehículo" value={back.claseVehiculo} smallValue />
          <DetailItem label="Tipo Carrocería" value={back.carroceria} smallValue />
          <DetailItem label="Combustible" value="Gasolina" />
          <div></div>
          <DetailItem label="Número de Motor" value={back.numMotor} smallValue />
          <DetailItem label="VIN" value="*****" />
          <DetailItem label="Número de Serie" value={back.numSerie} smallValue />
          <DetailItem label="Número de Chasis" value={back.numChasis} smallValue />
        </div>
        
        {/* Footer */}
        <div className="relative mt-6 pt-2 border-t border-gray-300">
          <div className="flex justify-between items-end">
             <DetailItem label="Propietario: Apellido(s) y Nombre(s)" value={`${front.propietario.nombre}`} smallValue />
             <DetailItem label="Identificación" value={`C.C. ${front.propietario.documento}`} smallValue />
          </div>
        </div>
      </div>

      {/* Back of the card */}
      <div className="bg-white text-black rounded-xl shadow-2xl p-6 border-2 border-gray-200 w-full max-w-2xl mx-auto relative overflow-hidden font-sans">
        <div className="absolute -left-16 -top-16 opacity-[0.03]">
          <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 50H83.3333V150H116.667V50H150V16.6667H50V50Z" fill="black"/>
          </svg>
        </div>
        <div className="absolute -right-16 -bottom-16 opacity-[0.03]">
          <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-180">
            <path d="M50 50H83.3333V150H116.667V50H150V16.6667H50V50Z" fill="black"/>
          </svg>
        </div>
        
        <div className="relative z-10 space-y-4">
          <h3 className="font-bold text-center text-sm uppercase tracking-widest text-gray-700 mb-4">Información Adicional</h3>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 rounded-lg bg-gray-50 border">
            <h4 className="col-span-2 text-xs font-bold uppercase text-gray-600 border-b pb-1 mb-1">Datos del Propietario</h4>
            <BackDetailItem label="Dirección" value={front.propietario.direccion} />
            <BackDetailItem label="Ciudad" value={front.propietario.ciudad} />
            <BackDetailItem label="Teléfono" value={front.propietario.telefono} />
          </div>
          
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 p-4 rounded-lg bg-gray-50 border">
            <h4 className="col-span-3 text-xs font-bold uppercase text-gray-600 border-b pb-1 mb-1">Información de Importación</h4>
            <BackDetailItem label="Dec. Importación" value={back.importacion.declaracion} />
            <BackDetailItem label="Número" value={back.importacion.numero} />
            <BackDetailItem label="Fecha" value={format(new Date(back.importacion.fecha), 'dd/MM/yyyy')} />
             <BackDetailItem label="Ciudad" value={back.importacion.ciudad} />
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-3 p-4 rounded-lg bg-gray-50 border">
             <h4 className="col-span-3 text-xs font-bold uppercase text-gray-600 border-b pb-1 mb-1">Registro y Avalúo</h4>
            <BackDetailItem label="Organismo de Tránsito" value={front.organismoTransito} />
            <BackDetailItem label="Fecha Expedición" value={format(new Date(front.fechaExpedicion), 'dd/MM/yyyy')} />
            <BackDetailItem label="Limitaciones a la Propiedad" value={front.limitacionesPropiedad} />
            <BackDetailItem label="Avalúo Comercial" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(back.avaluoComercial)} />
          </div>

          <div className="text-center pt-4">
             <p className="text-xs text-gray-500">Firma Autorizada</p>
             <p className="font-serif text-lg italic">{front.firmaMatriculador}</p>
          </div>

        </div>
      </div>
    </div>
  );
}