import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import account from '../../images/account.svg';
import { useProfile } from '../../context-api/ProfileContext';
import { Sidenav, Nav } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import ListIcon from '@rsuite/icons/List';
import UserInfoIcon from '@rsuite/icons/UserInfo';
import PeoplesIcon from '@rsuite/icons/Peoples';
import GridIcon from '@rsuite/icons/Grid';
import MessageIcon from '@rsuite/icons/Message';
import GearIcon from '@rsuite/icons/Gear';
import TextImageIcon from '@rsuite/icons/TextImage';
import EventDetailIcon from '@rsuite/icons/EventDetail';
import CalendarIcon from '@rsuite/icons/Calendar';
import DetailIcon from '@rsuite/icons/Detail';
import OffRoundIcon from '@rsuite/icons/OffRound';
import LogoutButton from './LogoutButton';
import tofar from '../../images/tofar.png';
import { Ship, UserPen, ClipboardPlus   } from 'lucide-react';


function DashHeader() {
  const {currentUser, isAdmin, isAgent, isEmployee, isClient} = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef();
  const profileDropdownRef = useRef();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      // Add a small delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileDropdownOpen]);

  // Map route paths to eventKeys
  const menuKeyByPath = {
    '/app/dashboard': { key: '1', parent: null },
    '/app/account/allshipments': { key: '2-1', parent: '2' },
    '/app/account/myshipments': { key: '2-2', parent: '2' },
    '/app/account/createshipment': { key: '2-3', parent: '2' },
    '/app/account/archived-shipments': { key: '2-4', parent: '2' },
    '/app/trackshipment': { key: '2-5', parent: '2' },
    '/app/account/manage-facilities': { key: '2-6', parent: '2' },
    '/app/account/manage-shipment-statuses': { key: '2-7', parent: '2' },
    '/app/account/contactformresponses': { key: '3', parent: null },
    '/app/account/allposts': { key: '4-1', parent: '4' },
    '/app/account/allblogpost': { key: '4-2', parent: '4' },
    '/app/account/addnewpost': { key: '4-3', parent: '4' },
    '/app/account/allevents': { key: '5-1', parent: '5' },
    '/app/account/addevent': { key: '5-2', parent: '5' },
    '/app/account/myappointments': { key: '6-1', parent: '6' },
    '/app/account/bookappointment': { key: '6-2', parent: '6' },
    '/app/account/allappointments': { key: '6-3', parent: '6' },
    '/app/account/sendnewsletter': { key: '7-1', parent: '7' },
    '/app/account/allnewsletter': { key: '7-2', parent: '7' },
    '/app/account/Newslettersubscribers': { key: '7-3', parent: '7' },
    '/app/account/allgalleryimages': { key: '8-1', parent: '8' },
    '/app/account/addnewgallery': { key: '8-2', parent: '8' },
    '/app/account/allusers': { key: '9-1', parent: '9' },
    '/app/account/addnewuser': { key: '9-2', parent: '9' },
    '/app/account/changeuserpassword': { key: '9-3', parent: '9' },
    '/app/account/profile': { key: '10', parent: null },
    '/app/account/send-test-sms': { key: '11', parent: null },
    '/app/account/manage-messageslides': { key: '12-1', parent: '12' },
  };
  
  // Normalize pathname to handle trailing slashes and query params
    const cleanPath = location.pathname.replace(/\/$/, '').split('?')[0];
    const routeInfo = menuKeyByPath[location.pathname] || menuKeyByPath[cleanPath];
    const activeKey = routeInfo ? routeInfo.key : null;
    // Compute defaultOpenKeys for Sidenav
    let defaultOpenKeys = [];
    if (routeInfo) {
        if (routeInfo.parent) {
            defaultOpenKeys = [routeInfo.parent];
        } else if (Object.values(menuKeyByPath).some(info => info.parent === routeInfo.key)) {
            defaultOpenKeys = [routeInfo.key];
        }
    }

  return (
    <nav className="bg-gray-500 text-white px-3 font-inter sticky top-0 z-50 overflow-visible">
      <div className="container mx-auto flex justify-between items-center relative py-2 overflow-visible">
        {/* Logo */}
        <Link to="/" className="flex items-center bg-gray-100 p-1 rounded-md">
          <img
            src={tofar}
            alt="Adesola Plastic Stores Logo"
            className="h-[60px] w-[60px] md:h-70px] md:w-[70px] mr-0"
          />
        </Link>

        {/* Icons for Desktop (User, Wishlist, Cart) */}
        <div className="hidden lg:flex items-center space-x-4 relative" ref={menuRef}>
            {/* Desktop Profile Dropdown */}
            <div className="relative z-40" ref={profileDropdownRef}>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleProfileDropdown();
                }}
                type="button"
                className="hover:text-orange-400 transition-colors flex flex-row justify-start items-center gap-2 duration-300 cursor-pointer p-2 rounded"
              >
                {currentUser?.profileImageUrl ? (
                  <img 
                    src={currentUser.profileImageUrl} 
                    alt={currentUser.name}
                    className='w-10 h-10 rounded-full object-cover border-2 border-white' 
                  />
                ) : (
                  <img 
                    src={account} 
                    alt="account" 
                    className='w-7 h-7 text-blue-500' 
                  />
                )}
                <div className='mr-2 flex flex-col items-start justify-center'>
                    <div className='text-[14px]'>{currentUser?.name}</div>
                    <div className='text-[12px] capitalize'>{currentUser?.role}</div>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </button>

              {/* Desktop Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div 
                  className="fixed top-22 right-2 w-56 bg-white text-gray-900 rounded-lg shadow-2xl py-2 z-[100] border border-gray-200" 
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProfileDropdownOpen(false);
                      navigate('/app/account/allshipments');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900 bg-white border-none cursor-pointer flex items-center gap-1"
                  >
                    <Ship className='w-4 h-4' /> Manage Shipments
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProfileDropdownOpen(false);
                      navigate('/app/account/createshipment');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900 bg-white border-none cursor-pointer flex items-center gap-1"
                  >
                    <ClipboardPlus className='w-4 h-4' /> Create Shipment
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProfileDropdownOpen(false);
                      navigate('/app/account/profile');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900 bg-white border-none cursor-pointer flex items-center gap-1"
                  >
                    <UserPen className='w-4 h-4' /> Profile
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div onClick={() => setIsProfileDropdownOpen(false)} className="px-4 py-2">
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
        </div>

        
        <div className="lg:hidden flex items-center gap-4 relative" ref={menuRef}>

          {/* profile image and name with dropdown */}
          <div className="relative z-40" ref={profileDropdownRef}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleProfileDropdown();
              }}
              className="hover:text-orange-400 transition-colors flex flex-row justify-start items-center gap-1 duration-300 p-1 rounded hover:bg-gray-600"
              type="button"
            >
              {currentUser?.profileImageUrl ? (
                <img 
                  src={currentUser.profileImageUrl} 
                  alt={currentUser.name}
                  className='w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white' 
                />
              ) : (
                <img 
                  src={account} 
                  alt="account" 
                  className='w-7 h-7 text-blue-500' 
                />
              )}
              <div className='flex flex-col items-start justify-center'>
                  <div className='text-[11px] md:text-[14px]'>{currentUser?.name}</div>
                  <div className='text-[11px] capitalize'>{currentUser?.role}</div>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="fixed top-22 right-2 w-56 bg-white text-gray-900 rounded-lg shadow-2xl py-2 z-[100] border border-gray-200 animate-in fade-in zoom-in duration-200 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
                <Link 
                  to="/app/account/allshipments" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors text-sm font-medium cursor-pointer no-underline text-gray-900 flex items-center gap-1"
                  style={{ pointerEvents: 'auto', display: 'flex' }}
                >
                  <Ship className='w-4 h-4' /> Manage Shipments
                </Link>
                <Link 
                  to="/app/account/createshipment" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors text-sm font-medium cursor-pointer no-underline text-gray-900 flex items-center gap-1"
                  style={{ pointerEvents: 'auto', display: 'flex' }}
                >
                  <ClipboardPlus className='w-4 h-4' /> Create Shipment
                </Link>
                <Link 
                  to="/app/account/profile" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors text-sm font-medium cursor-pointer no-underline text-gray-900 flex items-center gap-1"
                  style={{ pointerEvents: 'auto', display: 'flex' }}
                >
                  <UserPen className='w-4 h-4' /> Profile
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <div onClick={() => setIsProfileDropdownOpen(false)} className="px-4 py-2 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>

            {/* Hamburger Menu for Mobile */}
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered) */}
      <div
        className={`lg:hidden ${
          isOpen ? 'block' : 'hidden'
        } py-2 px-0 transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col space-y-2">
          <Sidenav defaultOpenKeys={defaultOpenKeys}>
            <Sidenav.Body>
              <Nav activeKey={activeKey}>
                {(isAdmin || isEmployee || isClient || isAgent) && (
                  <Nav.Item eventKey="1" icon={<DashboardIcon />} as={Link} to="/app/dashboard">
                      Dashboard
                </Nav.Item>
                )}
                {(isAdmin || isEmployee || isClient || isAgent) && (
                <Nav.Menu eventKey="2" title="Shipments" icon={<DetailIcon />}>
                  {(isAdmin || isEmployee) && (
                  <Nav.Item eventKey="2-1" as={Link} to="/app/account/allshipments">All Shipments</Nav.Item>
                  )}
                  {(isAdmin || isAgent || isClient || isEmployee) && (
                  <Nav.Item eventKey="2-2" as={Link} to="/app/account/myshipments">My Shipment</Nav.Item>
                  )}
                  {(isAdmin || isAgent || isEmployee) && (
                  <Nav.Item eventKey="2-3" as={Link} to="/app/account/createshipment">Create Shipment</Nav.Item>
                  )}
                  {(isAdmin || isAgent || isEmployee) && (
                  <Nav.Item eventKey="2-4" as={Link} to="/app/account/archived-shipments">Delivered Shipments</Nav.Item>
                  )}
                  {(isAdmin || isAgent || isClient || isEmployee) && (
                  <Nav.Item eventKey="2-4" as={Link} to="/app/trackshipment">Track Shipment</Nav.Item>
                  )}
                  {(isAdmin || isEmployee) && (
                  <Nav.Item eventKey="2-6" as={Link} to="/app/account/manage-facilities">Manage Facilities</Nav.Item>
                  )}
                  {(isAdmin || isEmployee) && (
                  <Nav.Item eventKey="2-7" as={Link} to="/app/account/manage-shipment-statuses">Manage Shipment Statuses</Nav.Item>
                  )}
                  </Nav.Menu>
                )}
                {(isAdmin || isEmployee) && (
                <Nav.Item eventKey="3" icon={<TextImageIcon />} as={Link} to="/app/account/contactformresponses">
                    Quote Request Responses
                </Nav.Item>
                )}
                {(isAdmin || isEmployee || isClient) && (
                <Nav.Menu eventKey="4" title="Blog Post" icon={<ListIcon />}>
                    <Nav.Item eventKey="4-1" as={Link} to="/app/account/allposts">All Posts</Nav.Item>
                    {(isAdmin || isAgent|| isEmployee) && (
                    <Nav.Item eventKey="4-2" as={Link} to="/app/account/allblogpost">Manage Blog Posts</Nav.Item>
                    )}
                    {(isAdmin || isAgent || isEmployee) && (
                    <Nav.Item eventKey="4-3" as={Link} to="/app/account/addnewpost">Add New Post</Nav.Item>
                    )}
                </Nav.Menu>
                )}
                {(isAdmin || isEmployee) && (
                <Nav.Menu eventKey="5" title="Events" icon={<EventDetailIcon />}>
                    <Nav.Item eventKey="5-1" as={Link} to="/app/account/allevents">Manage All Events</Nav.Item>
                    <Nav.Item eventKey="5-2" as={Link} to="/app/account/addevent">Add New Event</Nav.Item>
                </Nav.Menu>
                )}
                {(isAdmin || isAgent || isEmployee || isClient) && (
                <Nav.Menu eventKey="6" title="Appointments" icon={<CalendarIcon/>}>
                    <Nav.Item eventKey="6-1" as={Link} to="/app/account/myappointments">My Appointments</Nav.Item>
                    <Nav.Item eventKey="6-2" as={Link} to="/app/account/bookappointment">Book Appointment</Nav.Item>
                    {(isAdmin || isEmployee) && (
                    <Nav.Item eventKey="6-3" as={Link} to="/app/account/allappointments">All Appointments</Nav.Item>
                    )}
                </Nav.Menu>
                )}
                {(isAdmin || isEmployee) && (
                <Nav.Menu eventKey="7" title="Newsletter" icon={<MessageIcon />}>
                    <Nav.Item eventKey="7-1" as={Link} to="/app/account/sendnewsletter">Send Newsletter</Nav.Item>
                    <Nav.Item eventKey="7-2" as={Link} to="/app/account/allnewsletter">All Newsletters</Nav.Item>
                    <Nav.Item eventKey="7-3" as={Link} to="/app/account/Newslettersubscribers">Subscribers</Nav.Item>
                </Nav.Menu>
                )}
                {(isAdmin || isEmployee) && (
                <Nav.Menu eventKey="8" title="Gallery" icon={<GridIcon />}>
                    <Nav.Item eventKey="8-1" as={Link} to="/app/account/allgalleryimages">All Gallery</Nav.Item>
                    <Nav.Item eventKey="8-2" as={Link} to="/app/account/addnewgallery">Add New Gallery</Nav.Item>
                </Nav.Menu>
                )}
                {(isAdmin || isEmployee) && (
                <Nav.Menu eventKey="9" title="Manage Users" icon={<PeoplesIcon />}>
                    <Nav.Item eventKey="9-1" as={Link} to="/app/account/allusers">All Users</Nav.Item>
                    <Nav.Item eventKey="9-2" as={Link} to="/app/account/addnewuser">Add New User</Nav.Item>
                    <Nav.Item eventKey="9-3" as={Link} to="/app/account/changeuserpassword">Change User Password</Nav.Item>
                </Nav.Menu>
                )}
                {(isAdmin || isAgent || isEmployee || isClient) && (
                <Nav.Item eventKey="10" icon={<UserInfoIcon />} as={Link} to="/app/account/profile">
                    Profile
                </Nav.Item>
                )}
                {(isAdmin || isEmployee) && (
                <Nav.Item eventKey="11" icon={<UserInfoIcon />} as={Link} to="/app/account/sms-dashboard">
                    SMS Dashboard
                </Nav.Item>
                )}
                {(isAdmin) && (
                <Nav.Menu eventKey="12" title="Manage Messages Slides" icon={<GearIcon />}>
                    <Nav.Item eventKey="12-1" as={Link} to="/app/account/manage-messageslides">Messages Slides</Nav.Item>
                </Nav.Menu>
                )}
                {(isAdmin || isAgent || isEmployee || isClient) && (
                <Nav.Item icon={<OffRoundIcon />}>
                    <LogoutButton />
                </Nav.Item>
                )}
              </Nav>
            </Sidenav.Body>
        </Sidenav>
        </div>
      </div>
    </nav>
  );
}

export default DashHeader;
