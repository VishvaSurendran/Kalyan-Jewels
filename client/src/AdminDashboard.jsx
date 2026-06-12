// client/src/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './App.css';

function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Filtering
  const [filterRating, setFilterRating] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('https://kalyan-feedback-api.onrender.com');
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (id, newStatus) => {
    // Prompt for Employee Details before updating
    const empName = window.prompt("Enter your Employee Name:");
    if (!empName) return toast.error("Employee Name is required to proceed.");
    
    const empId = window.prompt("Enter your Employee ID:");
    if (!empId) return toast.error("Employee ID is required to proceed.");

    updateStatus(id, newStatus, empName, empId);
  };

  const updateStatus = async (id, newStatus, empName, empId) => {
    const toastId = toast.loading('Updating status...');
    try {
      const response = await fetch(`https://kalyan-feedback-api.onrender.com/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          resolvedByEmployeeName: empName,
          resolvedByEmployeeId: empId
        }),
      });

      if (response.ok) {
        toast.success(`Marked as ${newStatus}`, { id: toastId });
        setFeedbacks(feedbacks.map(fb => fb._id === id ? { 
          ...fb, 
          status: newStatus, 
          resolvedByEmployeeName: empName, 
          resolvedByEmployeeId: empId 
        } : fb));
      }
    } catch (error) {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  // 1. Filter the feedback based on Dropdown Status and Dropdown Rating
  let processedFeedbacks = feedbacks.filter((fb) => {
    const matchesStatus = filterStatus === 'All' || fb.status === filterStatus;
    
    // Convert filterRating string to a Number for strict comparison, unless it's 'All'
    const matchesRating = filterRating === 'All' || fb.rating === Number(filterRating);
    
    return matchesStatus && matchesRating;
  });

  // 2. Sort so 'Pending' always stays at the top
  processedFeedbacks.sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return 0; // Keep original date-based sorting for ties
  });

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-content">
          <h2>Admin Dashboard</h2>
          <Link to="/" className="back-link">← Back to Form</Link>
        </div>
      </header>

      <div className="dashboard-container">
        
        {/* Filter Controls */}
        <div className="admin-controls">
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="filter-dropdown"
            style={{ flex: 1 }} /* Added inline style to stretch equally */
          >
            <option value="All">All Ratings</option>
            <option value="5">★★★★★ - Excellent</option>
            <option value="4">★★★★☆ - Very Good</option>
            <option value="3">★★★☆☆ - Average</option>
            <option value="2">★★☆☆☆ - Poor</option>
            <option value="1">★☆☆☆☆ - Terrible</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-dropdown"
            style={{ flex: 1 }} /* Added inline style to stretch equally */
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Completed">Completed Only</option>
            <option value="Declined">Declined Only</option>
          </select>
        </div>

        {loading ? <p className="loading-text">Loading feedback...</p> : (
          <div className="feedback-grid">
            {processedFeedbacks.length === 0 && <p className="no-results">No feedback found.</p>}
            
            {processedFeedbacks.map((fb) => (
              <div key={fb._id} className={`feedback-card ${fb.status.toLowerCase()}`}>
                <div className="card-header">
                  <div>
                    <h3>{fb.name}</h3>
                    <span className="card-date">{new Date(fb.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-badge ${fb.status.toLowerCase()}`}>{fb.status}</span>
                </div>
                
                <div className="card-details">
                  <div className="detail-item"><span className="icon">📞</span> {fb.phone}</div>
                  <div className="detail-item"><span className="icon">📍</span> {fb.storeLocation}</div>
                  <div className="detail-item"><span className="icon">👤</span> Exec: {fb.executiveName || 'N/A'}</div>
                  <div className="detail-item"><span className="icon">⭐</span> {fb.rating}/5 ({fb.category})</div>
                </div>
                
                <div className="card-message">
                  <p>"{fb.message}"</p>
                </div>

                {/* Lock actions if not pending */}
                {fb.status === 'Pending' ? (
                  <div className="card-actions">
                    <button onClick={() => handleUpdateClick(fb._id, 'Completed')} className="btn-completed">Mark Complete</button>
                    <button onClick={() => handleUpdateClick(fb._id, 'Declined')} className="btn-declined">Decline</button>
                  </div>
                ) : (
                  <div className="resolution-info">
                    <p><strong>Resolved By:</strong> {fb.resolvedByEmployeeName} <span>(ID: {fb.resolvedByEmployeeId})</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;