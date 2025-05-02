import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { IoReturnUpBack } from "react-icons/io5";
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Select from 'react-select';
import './CreditSummary.css';

const CreditSummary = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    levels: [],
    credits: null, // Changed from empty string to null
    categories: [],
    statuses: [],
    types: []
  });

  const categoryOptions = ['I', 'X', 'Z', 'Y', 'M', 'W', 'J'].map(item => ({ value: item, label: item }));
  const statusOptions = ['Pass', 'Pending', 'Resit', 'Repeat'].map(item => ({ value: item, label: item }));
  const typeOptions = ['compulsory', 'elective'].map(item => ({ value: item, label: item.charAt(0).toUpperCase() + item.slice(1) }));
  const levelOptions = ['3', '4', '5', '6'].map(item => ({ value: item, label: `Level ${item}` }));
  // New credit options from 1 to 9
  const creditOptions = Array.from({ length: 9 }, (_, i) => ({ 
    value: (i + 1).toString(), 
    label: (i + 1).toString() 
  }));

  const fetchCreditSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/credit-summary/${user.id}`, {
        params: {
          levels: filters.levels.map(l => l.value).join(','),
          credits: filters.credits ? filters.credits.value : '', // Updated to handle select object
          categories: filters.categories.map(c => c.value).join(','),
          statuses: filters.statuses.map(s => s.value).join(','),
          types: filters.types.map(t => t.value).join(',')
        },
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load credit summary");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditSummary();
  }, [filters]);

  const handleFilterChange = (filterType, selectedOptions) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: selectedOptions || []
    }));
  };

  const handleCreditChange = (selectedOption) => {
    setFilters(prev => ({
      ...prev,
      credits: selectedOption
    }));
  };

  const resetFilters = () => {
    setFilters({
      levels: [],
      credits: null, // Reset to null
      categories: [],
      statuses: [],
      types: []
    });
  };

  return (
    <div className="credit-summary-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <IoReturnUpBack />
      </button>
      <h2>Credit Summary</h2>
      
      <div className="filter-section">
        <div className="filter-group">
          <h4>Levels</h4>
          <Select
            isMulti
            options={levelOptions}
            value={filters.levels}
            onChange={(selected) => handleFilterChange('levels', selected)}
            className="filter-select"
            classNamePrefix="select"
            placeholder="Select levels..."
          />
        </div>

        <div className="filter-group">
          <h4>Credits</h4>
          <Select
            options={creditOptions}
            value={filters.credits}
            onChange={handleCreditChange}
            className="filter-select"
            classNamePrefix="select"
            placeholder="Select credit count..."
            isClearable
          />
        </div>

        <div className="filter-group">
          <h4>Categories</h4>
          <Select
            isMulti
            options={categoryOptions}
            value={filters.categories}
            onChange={(selected) => handleFilterChange('categories', selected)}
            className="filter-select"
            classNamePrefix="select"
            placeholder="Select categories..."
          />
        </div>

        <div className="filter-group">
          <h4>Status</h4>
          <Select
            isMulti
            options={statusOptions}
            value={filters.statuses}
            onChange={(selected) => handleFilterChange('statuses', selected)}
            className="filter-select"
            classNamePrefix="select"
            placeholder="Select statuses..."
          />
        </div>

        <div className="filter-group">
          <h4>Types</h4>
          <Select
            isMulti
            options={typeOptions}
            value={filters.types}
            onChange={(selected) => handleFilterChange('types', selected)}
            className="filter-select"
            classNamePrefix="select"
            placeholder="Select types..."
          />
        </div>

        <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
      </div>

      {loading ? (
        <div className="loading">Loading credit summary...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : summary ? (
        <div className="summary-tables">
          <div className="table-container">
            <h3>Basic Credit Information</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Credit Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Subjects Count</td>
                  <td>{summary.subjectsCount}</td>
                </tr>
                <tr>
                  <td>Total Credits</td>
                  <td>{summary.totalCredits}</td>
                </tr>
                <tr>
                  <td>Pass Credits</td>
                  <td>{summary.passCredits}</td>
                </tr>
                <tr>
                  <td>Pending Credits</td>
                  <td>{summary.pendingCredits}</td>
                </tr>
                <tr>
                  <td>Eligible Credits</td>
                  <td>{summary.eligibleCredits}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <h3>Detailed Credit Information</h3>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Credit Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Compulsory Credits</td>
                  <td>{summary.compulsoryCredits}</td>
                </tr>
                <tr>
                  <td>Elective Credits</td>
                  <td>{summary.electiveCredits}</td>
                </tr>
                <tr>
                  <td>Resit Credits</td>
                  <td>{summary.resitCredits}</td>
                </tr>
                <tr>
                  <td>Repeat Credits</td>
                  <td>{summary.repeatCredits}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CreditSummary;