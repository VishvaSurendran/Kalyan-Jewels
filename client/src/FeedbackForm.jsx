// client/src/FeedbackForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './App.css';

function FeedbackForm() {
  const [formData, setFormData] = useState({ 
    name: '', phone: '', storeLocation: '', executiveName: '', category: 'Gold', rating: '5', message: '' 
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Submitting your feedback...');
    try {
      const response = await fetch('https://kalyan-feedback-api.onrender.com/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Thank you for your valuable feedback!', { id: toastId });
        setFormData({ name: '', phone: '', storeLocation: '', executiveName: '', category: 'Gold', rating: '5', message: '' }); 
      } else {
        toast.error('Something went wrong.', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error.', { id: toastId });
    }
  };

  return (
    <div className="page-wrapper">
      {/* Link to Admin Panel */}
      <Link to="/admin" className="admin-link">Admin View (Demo)</Link>
      
      <div className="form-container">
        <div className="brand-header">
          <h2>Kalyan Jewellers</h2>
          <p>Customer Experience Survey</p>
        </div>
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="row-group">
            <div className="input-group half-width">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group half-width">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="row-group">
            <div className="input-group half-width">
              <label>Store Location</label>
              <input type="text" name="storeLocation" value={formData.storeLocation} onChange={handleChange} required />
            </div>
            <div className="input-group half-width">
              <label>Sales Executive</label>
              <input type="text" name="executiveName" value={formData.executiveName} onChange={handleChange} />
            </div>
          </div>
          <div className="row-group">
            <div className="input-group half-width">
              <label>Product Interest</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Gold">Gold Jewellery</option>
                <option value="Diamond">Diamond Collection</option>
                <option value="Silver">Silver Items</option>
              </select>
            </div>
            <div className="input-group half-width">
              <label>Experience Rating</label>
              <select name="rating" value={formData.rating} onChange={handleChange}>
                <option value="5">★★★★★ - Excellent</option>
                <option value="4">★★★★☆ - Very Good</option>
                <option value="3">★★★☆☆ - Average</option>
                <option value="2">★★☆☆☆ - Poor</option>
                <option value="1">★☆☆☆☆ - Terrible</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Your Feedback</label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows="3" required />
          </div>
          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;