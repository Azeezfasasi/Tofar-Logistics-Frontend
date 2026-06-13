import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/Api';
import { useProfile } from '../../context-api/ProfileContext';
import { Link } from 'react-router-dom';

function ManageBlogPosts() {
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee, isAuthenticated, isLoading: authLoading } = useProfile();

  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // State for search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for bulk actions
  const [selectedBlogs, setSelectedBlogs] = useState(new Set());
  const [bulkStatusAction, setBulkStatusAction] = useState('published');

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  // Fetch ALL blog posts (published, draft, archived) for admin management
  const {
    data: blogPosts, 
    isLoading: isBlogsLoading,
    isError: isBlogsError,
    error: blogsError,
  } = useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/blogs/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && (isAdmin || isEmployee),
  });

  // Filter and search logic
  const getFilteredAndSearchedBlogs = () => {
    if (!blogPosts) return [];
    
    return blogPosts.filter((blog) => {
      // Search filter - search in title and description
      const searchMatch = 
        blog.blogTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = filterStatus === '' || blog.status === filterStatus;
      
      // Category filter
      const categoryMatch = filterCategory === '' || blog.category === filterCategory;
      
      return searchMatch && statusMatch && categoryMatch;
    });
  };

  const filteredBlogs = getFilteredAndSearchedBlogs();
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Mutation for editing a blog
  const editBlogMutation = useMutation({
    mutationFn: async (updatedBlog) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/blogs/${updatedBlog._id}`, updatedBlog, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Blog updated successfully!');
      setActionError('');
      setEditingBlogId(null);
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update blog.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a blog
  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/blogs/${blogId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      setActionMessage('Blog deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete blog.');
      setActionMessage('');
    },
  });

  // Mutation for changing blog status
  const changeStatusMutation = useMutation({
    mutationFn: async ({ blogId, status }) => {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE_URL}/blogs/${blogId}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Blog status updated successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change blog status.');
      setActionMessage('');
    },
  });

  // Mutation for bulk deleting blogs
  const bulkDeleteMutation = useMutation({
    mutationFn: async (blogIds) => {
      const token = localStorage.getItem('token');
      await Promise.all(
        blogIds.map((blogId) =>
          axios.delete(`${API_BASE_URL}/blogs/${blogId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        )
      );
    },
    onSuccess: () => {
      setActionMessage(`${selectedBlogs.size} blog(s) deleted successfully!`);
      setActionError('');
      setSelectedBlogs(new Set());
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete blogs.');
      setActionMessage('');
    },
  });

  // Mutation for bulk changing blog status
  const bulkChangeStatusMutation = useMutation({
    mutationFn: async ({ blogIds, status }) => {
      const token = localStorage.getItem('token');
      await Promise.all(
        blogIds.map((blogId) =>
          axios.patch(`${API_BASE_URL}/blogs/${blogId}/status`, { status }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        )
      );
    },
    onSuccess: () => {
      setActionMessage(`${selectedBlogs.size} blog(s) status updated successfully!`);
      setActionError('');
      setSelectedBlogs(new Set());
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update blog status.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (blog) => {
    setEditingBlogId(blog._id);
    setEditTitle(blog.blogTitle);
    setEditCategory(blog.category);
    setEditDescription(blog.description);
    setActionMessage('');
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editCategory.trim() || !editDescription.trim()) {
      setActionError('All fields are required for editing.');
      return;
    }
    editBlogMutation.mutate({
      _id: editingBlogId,
      blogTitle: editTitle,
      category: editCategory,
      description: editDescription,
    });
  };

  // Handle delete
  const handleDeleteClick = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlogMutation.mutate(blogId);
    }
  };

  // Handle status change
  const handleChangeStatus = (blogId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    if (window.confirm(`Are you sure you want to change this blog's status to "${newStatus}"?`)) {
      changeStatusMutation.mutate({ blogId, status: newStatus });
    }
  };

  // Bulk action handlers
  const handleSelectBlog = (blogId) => {
    const newSelected = new Set(selectedBlogs);
    if (newSelected.has(blogId)) {
      newSelected.delete(blogId);
    } else {
      newSelected.add(blogId);
    }
    setSelectedBlogs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBlogs.size === paginatedBlogs.length) {
      setSelectedBlogs(new Set());
    } else {
      const allBlogIds = new Set(paginatedBlogs.map((blog) => blog._id));
      setSelectedBlogs(allBlogIds);
    }
  };

  const handleBulkDelete = () => {
    if (selectedBlogs.size === 0) {
      setActionError('Please select at least one blog to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedBlogs.size} blog(s)? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedBlogs));
    }
  };

  const handleBulkChangeStatus = () => {
    if (selectedBlogs.size === 0) {
      setActionError('Please select at least one blog to change status.');
      return;
    }
    if (window.confirm(`Are you sure you want to change the status of ${selectedBlogs.size} blog(s) to "${bulkStatusAction}"?`)) {
      bulkChangeStatusMutation.mutate({
        blogIds: Array.from(selectedBlogs),
        status: bulkStatusAction,
      });
    }
  };

  // Helper function to format date
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

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
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

  // Check if user is authenticated and is an admin
  if (!isAuthenticated && !isAdmin && isEmployee) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator to manage blog posts.
          <div className="mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for blog posts data
  if (isBlogsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading blog posts for management...
        </div>
      </section>
    );
  }

  // Render error state for blog posts data
  if (isBlogsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Error loading blog posts: {blogsError.message}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Blog Posts
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

        {/* Search and Filter Section */}
        {blogPosts && blogPosts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  id="filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="Shipment">Shipment</option>
                  <option value="Air Freight">Air Freight</option>
                  <option value="Cargo">Cargo</option>
                  <option value="Events">Events</option>
                  <option value="Testimony">Testimony</option>
                </select>
              </div>
            </div>
            {filteredBlogs.length > 0 && (
              <p className="text-sm text-gray-600 mt-3">
                Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredBlogs.length)}</span> of <span className="font-semibold">{filteredBlogs.length}</span> results
              </p>
            )}
          </div>
        )}

        {/* Bulk Actions Section */}
        {selectedBlogs.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium text-blue-900">
                {selectedBlogs.size} blog(s) selected
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  value={bulkStatusAction}
                  onChange={(e) => setBulkStatusAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="published">Publish</option>
                  <option value="draft">Draft</option>
                </select>
                <button
                  onClick={handleBulkChangeStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                  disabled={bulkChangeStatusMutation.isPending}
                >
                  {bulkChangeStatusMutation.isPending ? 'Updating...' : 'Change Status'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition duration-200"
                  disabled={bulkDeleteMutation.isPending}
                >
                  {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete Selected'}
                </button>
                <button
                  onClick={() => setSelectedBlogs(new Set())}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {blogPosts && blogPosts.length > 0 ? (
          <>
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedBlogs.size > 0 && selectedBlogs.size === paginatedBlogs.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {paginatedBlogs.length > 0 ? (
                  paginatedBlogs.map((blog) => (
                  <React.Fragment key={blog._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="checkbox"
                          checked={selectedBlogs.has(blog._id)}
                          onChange={() => handleSelectBlog(blog._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingBlogId === blog._id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          blog.blogTitle
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingBlogId === blog._id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full p-1 border rounded bg-white"
                          >
                            <option value="Shipment">Shipment</option>
                            <option value="Air Freight">Air Freight</option>
                            <option value="Cargo">Cargo</option>
                            <option value="Events">Events</option>
                            <option value="Testimony">Testimony</option>
                          </select>
                        ) : (
                          blog.category
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {blog.sentBy ? blog.sentBy.name : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(blog.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          blog.status === 'published' ? 'bg-green-100 text-green-800' :
                          blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingBlogId === blog._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              disabled={editBlogMutation.isPending}
                            >
                              {editBlogMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingBlogId(null)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={editBlogMutation.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(blog)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(blog._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={deleteBlogMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleChangeStatus(blog._id, blog.status)}
                              className={`text-sm px-2 py-1 rounded-md ${
                                blog.status === 'published'
                                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              } disabled:opacity-50`}
                              disabled={changeStatusMutation.isPending}
                            >
                              {blog.status === 'published' ? 'Set Draft' : 'Publish'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {editingBlogId === blog._id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-sm text-gray-700 bg-gray-50">
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-600">
                      No blog posts match your search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination Controls */}
            {filteredBlogs.length > itemsPerPage && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition duration-200 ${
                        page === currentPage
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">No blog posts to manage.</p>
        )}
      </div>
    </section>
  );
}

export default ManageBlogPosts;
