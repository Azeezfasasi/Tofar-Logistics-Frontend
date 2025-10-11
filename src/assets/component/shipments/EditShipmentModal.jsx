import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function EditShipmentModal({ shipment, onClose, onSave }) {
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    receiverEmail: '',
    origin: '',
    destination: '',
    status: 'pending',
    weight: '',
    notes: '',
    length: '',
    width: '',
    height: '',
    volume: '',
    cost: '',
    items: [],
    shipmentPieces: '',
    shipmentType: '',
    shipmentPurpose: '',
    shipmentFacility: '',
  });

  // State for the new item input
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (shipment) {
      setFormData({
        senderName: shipment.senderName || '',
        senderPhone: shipment.senderPhone || '',
        senderEmail: shipment.senderEmail || '',
        senderAddress: shipment.senderAddress || '',
        recipientName: shipment.recipientName || '',
        recipientPhone: shipment.recipientPhone || '',
        recipientAddress: shipment.recipientAddress || '',
        receiverEmail: shipment.receiverEmail || '',
        weight: shipment.weight || '',
        origin: shipment.origin || '',
        destination: shipment.destination || '',
        status: shipment.status || '',
        notes: shipment.notes || '',
        length: shipment.length || '',
        width: shipment.width || '',
        height: shipment.height || '',
        volume: shipment.volume || '',
        cost: shipment.cost || '',
        items: shipment.items || [],
        shipmentPieces: shipment.shipmentPieces || '',
        shipmentType: shipment.shipmentType || '',
        shipmentPurpose: shipment.shipmentPurpose || '',
        shipmentFacility: shipment.shipmentFacility || '',
      });
    }
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...shipment, ...formData });
    onClose();
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() !== '') {
      // ✅ Corrected: Update formData state instead of 'form'
      setFormData(prevFormData => ({
        ...prevFormData,
        items: [...prevFormData.items, newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    // ✅ Corrected: Update formData state instead of 'form'
    setFormData(prevFormData => ({
      ...prevFormData,
      items: prevFormData.items.filter((_, i) => i !== index)
    }));
  };

  return (
  <div className='h-[500px] overflow-y-auto'>
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Edit Shipment</h2>
      
      <label>Sender Name</label>
      <Input name="senderName" placeholder="Sender Name" value={formData.senderName} onChange={handleChange} />
      
      <label>Sender Phone Number</label>
      <Input name="senderPhone" placeholder="Sender Phone Number" value={formData.senderPhone} onChange={handleChange} />
      
      <label>Sender Email Address</label>
      <Input name="senderEmail" placeholder="Sender Email Address" value={formData.senderEmail} onChange={handleChange} />
      
      <label>Sender Home Address</label>
      <Input name="senderAddress" placeholder="Sender Home Address" value={formData.senderAddress} onChange={handleChange} />

      <label>Receiver Name</label>
      <Input name="recipientName" placeholder="Receiver Name" value={formData.recipientName} onChange={handleChange} />
      
      <label>Receiver Email Address</label>
      <Input name="receiverEmail" placeholder="Receiver Email Address" value={formData.receiverEmail} onChange={handleChange} />
      
      <label>Receiver Phone Number</label>
      <Input name="recipientPhone" placeholder="Receiver Phone Number" value={formData.recipientPhone} onChange={handleChange} />
      
      <label>Receiver Address</label>
      <Input name="recipientAddress" placeholder="Receiver Home Address" value={formData.recipientAddress} onChange={handleChange} />
      
      <label>Weight (kg)</label>
      <Input name="weight" placeholder="weight (kg)" value={formData.weight} onChange={handleChange} />
      
      <label>Length - (Optional)</label>
      <Input name="length" placeholder="Length" value={formData.length} onChange={handleChange} />
      
      <label>Width - (Optional)</label>
      <Input name="width" placeholder="Width" value={formData.width} onChange={handleChange} />
      
      <label>Height - (Optional)</label>
      <Input name="height" placeholder="Height" value={formData.height} onChange={handleChange} />
      
      <label>Volume - (Optional)</label>
      <Input name="volume" placeholder="Volume" value={formData.volume} onChange={handleChange} />
      
      <label>Shipping Cost (₦) - (Optional)</label>
      <Input name="cost" placeholder="Shipping cost" value={formData.cost} onChange={handleChange} />

      <label>Origin</label>
      <Input name="origin" placeholder="Origin" value={formData.origin} onChange={handleChange} />

      <label>Destination</label>
      <Input name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} />

      <label>Shipment Type</label>
      <select name="shipmentType" value={formData.shipmentType} onChange={handleChange} className='w-full border border-solid border-blue-600 rounded p-2 focus:outline-none focus:ring focus:ring-blue-600'>
        <option value="">Choose Shipment Type</option>
        <option value="Boxes">Boxes</option>
        <option value="Padding">Padding</option>
        <option value="Package">Package</option>
        <option value="Document">Document</option>
        <option value="Other">Other</option>
      </select>

      <label>Shipment Pieces</label>
      <textarea
        name="shipmentPieces"
        value={formData.shipmentPieces}
        onChange={handleChange}
        placeholder='Enter the Pieces of the shipment'
        className="w-full border border-solid border-blue-600 rounded p-2 focus:outline-none focus:ring focus:ring-blue-600">
      </textarea>

      <label>Shipment Purpose</label>
      <select name="shipmentPurpose" value={formData.shipmentPurpose} onChange={handleChange} className='w-full border border-solid border-blue-600 rounded p-2 focus:outline-none focus:ring focus:ring-blue-600'>
        <option value="">Choose Shipment Purpose</option>
        <option value="Personal">Personal</option>
        <option value="Gift">Gift</option>
        <option value="Commercial">Commercial</option>
        <option value="Return for Repair">Return for Repair</option>
        <option value="Sample">Sample</option>
        <option value="Other">Other</option>
      </select>

      <label>Shipment Facility</label>
      <select name="shipmentFacility" value={formData.shipmentFacility} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'>
        <option value="">Choose Shipment Facility</option>
        <option value="Lagos">Lagos</option>
        <option value="Atlanta">Atlanta</option>
        <option value="Indianapolis">Indianapolis</option>
        <option value="New York">New York</option>
        <option value="New Jersey">New Jersey</option>
        <option value="Maryland">Maryland</option>
        <option value="Dallas">Dallas</option>
        <option value="Houston">Houston</option>
        <option value="United States of America">United States of America</option>
        <option value="Canada">Canada</option>
        <option value="Ontario">Ontario</option>
        <option value="Calgary">Calgary</option>
        <option value="Edmonton">Edmonton</option>
        <option value="United Kingdom">United Kingdom</option>
      </select>

      {/* section for adding items */}
      <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Items in Shipment</label>
          <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g., 'Food Items, Electronics, Clothing etc.'"
                className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'
              />
              <Button
                type="button"
                onClick={handleAddItem}
                className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center"
              >
                <FaPlus />
              </Button>
          </div>

          {/* Display items from formData state */}
          {formData.items.length > 0 && (
              <ul className="border border-solid border-gray-300 rounded p-2">
                  {formData.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center py-1">
                          <span>{item}</span>
                          <Button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 transition"
                              variant="ghost"
                          >
                              <FaTrash />
                          </Button>
                      </li>
                  ))}
              </ul>
          )}
      </div>

      <div className='mt-4 flex flex-col'>
        <label>Notes</label>
        <textarea name="notes" placeholder="Additional Details" value={formData.notes} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        <div className="flex justify-end space-x-2 mt-5">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={handleSubmit}>Save Changes</Button>
        </div>
      </div>
    </div>
  </div>
  );
}

