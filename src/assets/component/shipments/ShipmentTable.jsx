import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Download, Mail, Eye, Trash2, FileText, Printer, Truck, RefreshCcw, QrCode } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ShipmentTable({ shipments, onActionClick, selectedShipments = [], onSelectShipment, onSelectAll }) {
  const [currentPage, setCurrentPage] = useState(1);

  // filter out shipments with delivered status (case-insensitive)
  const visibleShipments = shipments.filter(s => String(s.status).toLowerCase() !== 'delivered');

  const totalPages = Math.ceil(visibleShipments.length / ITEMS_PER_PAGE) || 1;
  const paginated = visibleShipments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Check if all items on current page are selected
  const allPagedSelected = paginated.length > 0 && paginated.every(s => selectedShipments.includes(s._id));
  
  // Check if some items on current page are selected
  const somePagedSelected = paginated.some(s => selectedShipments.includes(s._id)) && !allPagedSelected;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white uppercase sticky top-0 z-10">
          <tr>
            <th className="p-4 font-semibold w-12">
              <input
                type="checkbox"
                checked={allPagedSelected}
                ref={el => {
                  if (el) {
                    el.indeterminate = somePagedSelected && !allPagedSelected;
                  }
                }}
                onChange={(e) => {
                  if (onSelectAll) {
                    onSelectAll(e.target.checked, paginated.map(s => s._id));
                  }
                }}
                className="w-5 h-5 cursor-pointer"
              />
            </th>
            <th className="p-4 font-semibold">#</th>
            <th className="p-4 font-semibold">Tracking No</th>
            <th className="p-4 font-semibold">Sender</th>
            <th className="p-4 font-semibold">Receiver</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Destination</th>
            <th className="p-4 font-semibold">Facility</th>
            <th className="p-4 font-semibold">Date</th>
            <th className="p-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginated.map((shipment, idx) => (
            <tr key={shipment._id} className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${selectedShipments.includes(shipment._id) ? 'bg-blue-50' : ''}`}>
              <td className="p-4 text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={selectedShipments.includes(shipment._id)}
                  onChange={(e) => {
                    if (onSelectShipment) {
                      onSelectShipment(shipment._id, e.target.checked);
                    }
                  }}
                  className="w-5 h-5 cursor-pointer"
                />
              </td>
              <td className="p-4 text-gray-600 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
              <td className="p-4 font-semibold text-gray-900">{shipment.trackingNumber}</td>
              <td className="p-4 text-gray-700">{shipment.senderName}</td>
              <td className="p-4 text-gray-700">{shipment.recipientName}</td>
              <td className="p-4">
                <span
                  className={`font-semibold capitalize w-fit px-3 py-1.5 rounded-full text-xs
                    ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                    shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'pickup-scheduled' ? 'bg-amber-100 text-amber-800' :
                    shipment.status === 'out-for-delivery' ? 'bg-pink-100 text-pink-800' :
                    shipment.status === 'picked-up' ? 'bg-purple-100 text-purple-800' :
                    shipment.status === 'arrived-at-hub' ? 'bg-violet-100 text-violet-800' :
                    shipment.status === 'departed-from-hub' ? 'bg-indigo-100 text-indigo-800' :
                    shipment.status === 'on-hold' ? 'bg-rose-100 text-rose-800' :
                    shipment.status === 'customs-clearance' ? 'bg-cyan-100 text-cyan-800' :
                    shipment.status === 'Awaiting Pickup' ? 'bg-fuchsia-100 text-fuchsia-800' :
                    shipment.status === 'failed-delivery-attempt' ? 'bg-rose-100 text-rose-800' :
                    shipment.status === 'Awaiting Delivery' ? 'bg-lime-100 text-lime-800' :
                    shipment.status === 'Arrived Carrier Connecting facility' ? 'bg-teal-100 text-teal-800' :
                    shipment.status === 'Departed CARGO realm facility (Nig)' ? 'bg-orange-100 text-orange-800' :
                    shipment.status === 'Arrived nearest airport' ? 'bg-sky-100 text-sky-800' :
                    shipment.status === 'Shipment is Delayed' ? 'bg-red-200 text-red-900' :
                    shipment.status === 'Delivery date not available' ? 'bg-gray-200 text-gray-800' :
                    shipment.status === 'Available for pick up,check phone for instructions' ? 'bg-emerald-100 text-emerald-800' :
                    shipment.status === 'Processed in Lagos Nigeria' ? 'bg-amber-200 text-amber-900' :
                    shipment.status === 'Pending Carrier lift' ? 'bg-indigo-200 text-indigo-900' :
                    shipment.status === 'Scheduled to depart on the next movement' ? 'bg-pink-200 text-pink-900' :
                    shipment.status === 'Received from flight' ? 'bg-cyan-200 text-cyan-900' :
                    shipment.status === 'Package is received and accepted by airline' ? 'bg-green-200 text-green-900' :
                    shipment.status === 'Customs clearance completed' ? 'bg-emerald-200 text-emerald-900' :
                    shipment.status === 'Delivery is booked' ? 'bg-indigo-100 text-indigo-800' :
                    shipment.status === 'Arrived at an international sorting facility and will be ready for delivery soon' ? 'bg-purple-200 text-purple-900' :
                    shipment.status === 'pending' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`
                  }
                >
                  {shipment.status}
                </span>

              </td>
              <td className="p-4 text-gray-700">{shipment.destination}</td>
              <td className="p-4 text-gray-700">{shipment.shipmentFacility}</td>
              <td className="p-4 text-gray-600 text-sm">{new Date(shipment.createdAt).toLocaleDateString()}</td>
              <td className="p-4 space-x-1.5 flex justify-end">
                <button 
                  onClick={() => onActionClick(shipment, 'qr')}
                  className='p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-150 hover:scale-110'
                  title="View QR Code"
                >
                  <QrCode size={18} />
                </button>
                <button 
                  onClick={() => onActionClick(shipment, 'print')}
                  className='p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-150 hover:scale-110'
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => onActionClick(shipment, 'edit')}
                  className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 hover:scale-110'
                  title="Edit Shipment"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => onActionClick(shipment, 'reply')}
                  className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150 hover:scale-110'
                  title="Send Reply"
                >
                  <Mail size={18} />
                </button>
                <button 
                  onClick={() => onActionClick(shipment, 'status')}
                  className='p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-150 hover:scale-110'
                  title="Update Status"
                >
                  <RefreshCcw size={18} />
                </button>
                <button 
                  onClick={() => onActionClick(shipment, 'delete')}
                  className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 hover:scale-110'
                  title="Delete Shipment"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {paginated.length === 0 && (
            <tr>
              <td colSpan={10} className="p-8 text-center">
                <div className="text-5xl mb-2">📦</div>
                <p className="text-gray-500 font-medium">No shipments found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search criteria</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600 font-medium">
          Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span> • Total: <span className="font-bold text-gray-900">{visibleShipments.length}</span> shipments
        </div>
        <div className="flex gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            ← Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
