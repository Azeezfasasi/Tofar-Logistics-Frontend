import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../config/axiosConfig';
import { API_BASE_URL } from '../../../config/Api';
import { useProfile } from '../../context-api/ProfileContext';
import { Link } from 'react-router-dom';

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString(undefined, options);
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return 'Invalid Date';
  }
};

function ManageEvents() {
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee, isAuthenticated, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editCoOrganizer, setEditCoOrganizer] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For success messages
  const [actionError, setActionError] = useState(''); // For specific action errors

  // State for search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for bulk actions
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [bulkStatusAction, setBulkStatusAction] = useState('');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
  }, [editingEventId]);

  // Determine if the user has permission to manage events
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch ALL events (upcoming, completed, cancelled) for admin/pastor management
  const {
    data: events, // This will now contain all events
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ['adminEvents'], // Unique key for admin's view of all events
    queryFn: async () => {
      // Call the admin-specific endpoint to get all events
      // Your backend route GET /api/events/admin/all is protected by authorizeRole(['admin']).
      // If you want pastors to also fetch this, your backend route needs to be updated
      // to authorizeRole(['admin', 'pastor']).
      const response = await axiosInstance.get(`${API_BASE_URL}/events/admin/all`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    // Corrected: enabled if authenticated AND (isAdmin OR isEmployee)
    enabled: hasPermission,
  });

  // Filter and search logic
  const filteredEvents = events ? events.filter((event) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      event.eventTitle?.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.organizer?.toLowerCase().includes(searchLower) ||
      event.category?.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;

    // Category filter
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  // Mutation for editing an event
  const editEventMutation = useMutation({
    mutationFn: async (updatedEvent) => {
      const response = await axiosInstance.put(`${API_BASE_URL}/events/${updatedEvent._id}`, updatedEvent);
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Event updated successfully!');
      setActionError('');
      setEditingEventId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Refetch admin event list
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] }); // Also invalidate public list if status changed
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update event.');
      setActionMessage('');
    },
  });

  // Mutation for deleting an event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await axiosInstance.delete(`${API_BASE_URL}/events/${eventId}`);
    },
    onSuccess: () => {
      setActionMessage('Event deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Refetch admin event list
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] }); // Also invalidate public list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete event.');
      setActionMessage('');
    },
  });

  // Mutation for changing event status
  const changeStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }) => {
      const response = await axiosInstance.patch(`${API_BASE_URL}/events/${eventId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Event status updated successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Refetch admin event list
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] }); // Also invalidate public list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change event status.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (event) => {
    setEditingEventId(event._id);
    setEditEventTitle(event.eventTitle || '');
    setEditCategory(event.category || '');
    setEditDescription(event.description || '');
    setEditLocation(event.location || '');
    setEditDuration(event.duration || '');
    setEditTime(event.time || '');
    // Format date for input type="date" (YYYY-MM-DD)
    setEditDate(event.date ? new Date(event.date).toISOString().split('T')[0] : '');
    setEditAddress(event.address || '');
    setEditOrganizer(event.organizer || '');
    setEditCoOrganizer(event.coOrganizer || '');
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editEventTitle.trim() || !editCategory.trim() || !editDescription.trim() || !editDate.trim()) {
      setActionError('Title, Category, Description, and Date are required for editing.');
      return;
    }
    editEventMutation.mutate({
      _id: editingEventId,
      eventTitle: editEventTitle,
      category: editCategory,
      description: editDescription,
      location: editLocation,
      duration: editDuration,
      time: editTime,
      date: editDate, // Send as YYYY-MM-DD string, backend will parse
      address: editAddress,
      organizer: editOrganizer,
      coOrganizer: editCoOrganizer,
    });
  };

  // Handle delete
  const handleDeleteClick = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  // Handle status change
  const handleChangeStatus = (eventId, currentStatus) => {
    // Define all possible statuses in the desired order for cycling
    const statuses = ['upcoming', 'completed', 'cancelled'];
    // Find the current index of the status
    const currentIndex = statuses.indexOf(currentStatus);
    // Determine the next status in a circular manner
    const nextStatusIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextStatusIndex];

    if (window.confirm(`Are you sure you want to change this event's status to "${newStatus}"?`)) {
      changeStatusMutation.mutate({ eventId, status: newStatus });
    }
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (eventId) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.size === paginatedEvents.length && paginatedEvents.length > 0) {
      // Deselect all on current page
      paginatedEvents.forEach(event => newSelected.delete(event._id));
    } else {
      // Select all on current page
      paginatedEvents.forEach(event => newSelected.add(event._id));
    }
    setSelectedEvents(newSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) {
      setActionError('Please select at least one event to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedEvents.size} event(s)? This action cannot be undone.`)) {
      return;
    }

    setIsBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedEvents).map(eventId =>
          axiosInstance.delete(`${API_BASE_URL}/events/${eventId}`)
        )
      );
      setActionMessage(`Successfully deleted ${selectedEvents.size} event(s)!`);
      setActionError('');
      setSelectedEvents(new Set());
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete some events.');
      setActionMessage('');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedEvents.size === 0) {
      setActionError('Please select at least one event to update.');
      return;
    }

    if (!window.confirm(`Are you sure you want to change the status of ${selectedEvents.size} event(s) to "${newStatus}"?`)) {
      return;
    }

    setIsBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedEvents).map(eventId =>
          axiosInstance.patch(`${API_BASE_URL}/events/${eventId}/status`, { status: newStatus })
        )
      );
      setActionMessage(`Successfully updated status for ${selectedEvents.size} event(s)!`);
      setActionError('');
      setSelectedEvents(new Set());
      setBulkStatusAction('');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status for some events.');
      setActionMessage('');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking permissions...
        </div>
      </section>
    );
  }

  // Corrected: Check if user is authenticated AND (isAdmin OR isEmployee)
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator or Pastor to manage events.
          <div className="mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for events data (only if authorized)
  if (isEventsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading events for management...
        </div>
      </section>
    );
  }

  // Render error state for events data
  if (isEventsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading events: {eventsError.response?.data?.message || eventsError.message}
          <br/>
          Please ensure your backend route `/events/admin/all` is configured to allow 'pastor' role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Events
        </h2>

        {actionMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4" role="alert">
            <span className="block sm:inline">{actionMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
            <span className="block sm:inline">{actionError}</span>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="Shipment">Shipment</option>
                <option value="Cargo">Cargo</option>
                <option value="International Travel">International Travel</option>
              </select>
            </div>

            {/* Items per page info */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredEvents.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredEvents.length)}</span> of <span className="font-semibold">{filteredEvents.length}</span> events
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedEvents.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm font-semibold text-blue-900">
                {selectedEvents.size} event(s) selected
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Bulk Status Change */}
                <select
                  value={bulkStatusAction}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value);
                    }
                  }}
                  disabled={isBulkActionLoading}
                  className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Change Status To...</option>
                  <option value="upcoming">Mark as Upcoming</option>
                  <option value="completed">Mark as Completed</option>
                  <option value="cancelled">Mark as Cancelled</option>
                </select>

                {/* Bulk Delete */}
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
                >
                  {isBulkActionLoading ? 'Processing...' : 'Delete Selected'}
                </button>

                {/* Clear Selection */}
                <button
                  onClick={() => setSelectedEvents(new Set())}
                  disabled={isBulkActionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
        
        {filteredEvents.length > 0 ? (
          <div>
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={paginatedEvents.length > 0 && selectedEvents.size === paginatedEvents.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        title="Select all on this page"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEvents.map((event) => (
                  <React.Fragment key={event._id}>
                    <tr>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedEvents.has(event._id)}
                          onChange={() => handleCheckboxToggle(event._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingEventId === event._id ? (
                          <input
                            type="text"
                            value={editEventTitle}
                            onChange={(e) => setEditEventTitle(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          event.eventTitle
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full p-1 border rounded bg-white"
                          >
                            <option value="General">Choose Category</option>
                            <option value="Shipment">Shipment</option>
                            <option value="Cargo">Cargo</option>
                            <option value="International Travel">International Travel</option>
                          </select>
                        ) : (
                          event.category
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          event.location || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          formatDate(event.date)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          event.time || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingEventId === event._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              disabled={editEventMutation.isPending}
                            >
                              {editEventMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingEventId(null)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={editEventMutation.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(event)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(event._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={deleteEventMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleChangeStatus(event._id, event.status)}
                              className={`text-sm px-2 py-1 rounded-md ${
                                event.status === 'upcoming'
                                  ? 'bg-green-500 text-white hover:bg-green-600' // Change to Completed
                                  : event.status === 'completed'
                                  ? 'bg-red-500 text-white hover:bg-red-600' // Change to Cancelled
                                  : 'bg-blue-500 text-white hover:bg-blue-600' // Change to Upcoming
                              } disabled:opacity-50`}
                              disabled={changeStatusMutation.isPending}
                            >
                              {event.status === 'upcoming' ? 'Set Completed' :
                                event.status === 'completed' ? 'Set Cancelled' :
                                'Set Upcoming'
                              }
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {editingEventId === event._id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-sm text-gray-700 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                id="editDescription"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows="4"
                                className="w-full p-2 border rounded resize-y"
                              ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        id="editDuration"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="editAddress"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Organizer
                                    </label>
                                    <input
                                        type="text"
                                        id="editOrganizer"
                                        value={editOrganizer}
                                        onChange={(e) => setEditOrganizer(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editCoOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Co-Organizer
                                    </label>
                                    <input
                                        type="text"
                                        id="editCoOrganizer"
                                        value={editCoOrganizer}
                                        onChange={(e) => setEditCoOrganizer(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                {/* Generate pagination buttons with smart page display */}
                {(() => {
                  const pages = [];
                  const maxPagesToShow = 5;
                  const halfRange = Math.floor(maxPagesToShow / 2);
                  
                  let startPage = Math.max(1, currentPage - halfRange);
                  let endPage = Math.min(totalPages, currentPage + halfRange);
                  
                  // Adjust range if near the beginning or end
                  if (endPage - startPage < maxPagesToShow - 1) {
                    if (startPage === 1) {
                      endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                    } else {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }
                  }
                  
                  // Add first page if not in range
                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push('...');
                    }
                  }
                  
                  // Add page numbers in range
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                  
                  // Add last page if not in range
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push('...');
                    }
                    pages.push(totalPages);
                  }
                  
                  return pages.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 bg-white rounded-xl shadow-lg p-12">
            {events && events.length > 0 ? (
              <p>No events match your search or filter criteria. Try adjusting your filters.</p>
            ) : (
              <p>No events to manage.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ManageEvents;
