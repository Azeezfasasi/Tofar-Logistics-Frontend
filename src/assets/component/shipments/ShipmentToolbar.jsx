import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";

// The props have been updated to match the parent component
const ShipmentToolbar = ({
  searchQuery,
  onSearch,
  onStatusChange,
  onExport,
  selectedStatus,
  onFacilityChange,
  selectedFacility,
  facilities = [],
  statuses = [],
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1 md:flex-initial">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search by tracking number, sender, or destination..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full md:w-80 pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg transition-all"
          />
        </div>
      </div>

      {/* Facility and Status Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap">
        {/* Facility Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Facility:</label>
          <select
            value={selectedFacility}
            onChange={(e) => onFacilityChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all cursor-pointer hover:border-gray-400"
          >
            <option value="">All Facilities</option>
            {Array.isArray(facilities) && facilities.length > 0 ? (
              facilities.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}{f.count != null ? ` (${f.count})` : ''}
                </option>
              ))
            ) : (
              <>
                <option value="Atlanta">Atlanta</option>
                <option value="Indianapolis">Indianapolis</option>
                <option value="New York">New York</option>
                <option value="New jersey">New jersey</option>
                <option value="Maryland">Maryland</option>
                <option value="Dallas">Dallas</option>
                <option value="Houston">Houston</option>
                <option value="United States of America">United States of America</option>
                <option value="Canada">Canada</option>
                <option value="Ontario">Ontario</option>
                <option value="Calgary">Calgary</option>
                <option value="Edmonton">Edmonton</option>
                <option value="United Kingdom">United Kingdom</option>
              </>
            )}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all cursor-pointer hover:border-gray-400 max-w-[200px] lg:max-w-[300px]"
          >
            <option value="">All Statuses</option>
            {Array.isArray(statuses) && statuses.length > 0 ? (
              statuses.map((status) => (
                status.isActive && (
                  <option key={status._id} value={status.code || status.name.toLowerCase()}>
                    {status.name}
                  </option>
                )
              ))
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="processing">Processing</option>
                <option value="out-for-delivery">Out For Delivery</option>
                <option value="pickup-scheduled">Pickup Scheduled</option>
                <option value="picked-up">Picked Up</option>
                <option value="arrived-at-hub">Arrived at Hub</option>
                <option value="departed-from-hub">Departed from Hub</option>
                <option value="on-hold">On Hold</option>
                <option value="customs-clearance">Customs Clearance</option>
              </>
            )}
          </select>
        </div>

        {/* Export Button */}
        <Button 
          onClick={onExport}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 font-medium transition-all flex items-center gap-2 cursor-pointer ml-auto md:ml-0"
        >
          <Download size={18} /> Export
        </Button>
      </div>
    </div>
  );
};

export default ShipmentToolbar;
