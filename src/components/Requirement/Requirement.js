import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Requirement.css";
import { IoReturnUpBack } from "react-icons/io5";
import PropTypes from 'prop-types';

const DegreeEligibility = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/courses/${user.id}/eligibility`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.data?.requirements) {
        throw new Error("Invalid data structure received from server");
      }

      setEligibility(response.data);
    } catch (err) {
      console.error("Eligibility check error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to check eligibility"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, [user.id]);

  const handleRefresh = () => {
    fetchEligibility();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading eligibility data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button className="refresh-button" onClick={handleRefresh}>
          Try Again
        </button>
      </div>
    );
  }

  if (!eligibility) {
    return (
      <div className="no-data-container">
        <p>No eligibility data found</p>
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="eligibility-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <IoReturnUpBack />
      </button>

      <h1>Degree Award Eligibility</h1>

      <div className={`status-banner ${eligibility.allRequirementsMet ? "met" : "not-met"}`}>
        {eligibility.allRequirementsMet ? (
          <>
            <div className="status-icon">✅</div>
            <p>All requirements met for degree award!</p>
          </>
        ) : (
          <>
            <div className="status-icon">⚠️</div>
            <p>Not all requirements are met yet</p>
          </>
        )}
      </div>

      <div className="requirements-grid">

        <RequirementCard
          title="Industrial (I) & Engineering (X)"
          met={eligibility.requirements.combined.met}
          current={eligibility.requirements.combined.current}
          min="65 (Total)"
          additional={[
            `Level 5/6: ${eligibility.requirements.combined.currentLevel5_6}/30`,
            `Level 6: ${eligibility.requirements.combined.currentLevel6}/15`,
          ]}
          remaining={Math.max(
            eligibility.requirements.combined.remainingCredits,
            eligibility.requirements.combined.remainingLevel5_6,
            eligibility.requirements.combined.remainingLevel6
          )}
        />

        <RequirementCard
          title="General (J)"
          met={eligibility.requirements.general.met}
          current={eligibility.requirements.general.current}
          min={eligibility.requirements.general.min}
          max={eligibility.requirements.general.max}
          remaining={eligibility.requirements.general.remaining}
          exceeded={eligibility.requirements.general.exceeded}
        />

        <RequirementCard
          title="Management (M)"
          met={eligibility.requirements.management.met}
          current={eligibility.requirements.management.current}
          min={eligibility.requirements.management.min}
          max={eligibility.requirements.management.max}
          additional={[
            `Level 5+: ${eligibility.requirements.management.level5 || 0}/${eligibility.requirements.management.minLevel5}`
          ]}
          remaining={Math.max(
            eligibility.requirements.management.remaining || 0,
            eligibility.requirements.management.remainingLevel5 || 0
          )}
        />

        <RequirementCard
          title="Mathematics (Z)"
          met={eligibility.requirements.mathematics.met}
          current={eligibility.requirements.mathematics.current}
          min={eligibility.requirements.mathematics.min}
          max={eligibility.requirements.mathematics.max}
          additional={[
            `Level 5+: ${eligibility.requirements.mathematics.level5 || 0}/3`
          ]}
          remaining={Math.max(
            eligibility.requirements.mathematics.remaining || 0,
            eligibility.requirements.mathematics.remainingLevel5 || 0
          )}
        />

        <RequirementCard
          title="Project (Y)"
          met={eligibility.requirements.project.met}
          current={eligibility.requirements.project.current}
          min={eligibility.requirements.project.min}
          max={eligibility.requirements.project.max}
          additional={[
            `Level 6: ${eligibility.requirements.project.level6 || 0}/6`
          ]}
          remaining={Math.max(
            eligibility.requirements.project.remaining || 0,
            eligibility.requirements.project.remainingLevel6 || 0
          )}
        />

        <RequirementCard
          title="Total Credits"
          met={eligibility.requirements.total.met}
          current={eligibility.requirements.total.current}
          min={eligibility.requirements.total.min}
          additional={[
            `Level 5/6: ${eligibility.requirements.total.level5_6}/60`,
            `Level 6: ${eligibility.requirements.total.level6}/30`,
          ]}
          remaining={Math.max(
            eligibility.requirements.total.remaining || 0,
            eligibility.requirements.total.remainingLevel5_6 || 0,
            eligibility.requirements.total.remainingLevel6 || 0
          )}
        />
      </div>
    </div>
  );
};

const RequirementCard = ({
  title,
  met,
  current,
  min,
  max,
  additional,
  remaining,
  exceeded,
}) => {


  return (
    <div className={`requirement-card ${met ? "met" : "not-met"}`}>
      <div className="card-header">
        <h3>{title}</h3>
        <div className={`status-icon ${met ? "met" : "not-met"}`}>
          {met ? "✓" : "✗"}
        </div>
      </div>

      

      <div className="details">
        <div className="detail-row">
          <span className="detail-label">Current:</span>
          <span className="detail-value">{current} credits</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Requirement:</span>
          <span className="detail-value">
            {min}
            {max ? `-${max}` : "+"} credits
          </span>
        </div>

        {additional?.map((item, i) => (
          <div key={i} className="detail-row additional-requirement">
            <span className="detail-label"></span>
            <span className="detail-value">{item}</span>
          </div>
        ))}

        {remaining > 0 && (
          <div className="detail-row remaining">
            <span className="detail-label">Remaining:</span>
            <span className="detail-value">{remaining} credits</span>
          </div>
        )}

        {exceeded > 0 && (
          <div className="detail-row exceeded">
            <span className="detail-label">Exceeded by:</span>
            <span className="detail-value">{exceeded} credits</span>
          </div>
        )}
      </div>
    </div>
  );
};

RequirementCard.propTypes = {
  title: PropTypes.string.isRequired,
  met: PropTypes.bool.isRequired,
  current: PropTypes.number.isRequired,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  max: PropTypes.number,
  additional: PropTypes.arrayOf(PropTypes.string),
  remaining: PropTypes.number,
  exceeded: PropTypes.number
};

export default DegreeEligibility;