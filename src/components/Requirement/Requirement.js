import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Requirement.css";
import { IoReturnUpBack } from "react-icons/io5";

const DegreeEligibility = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEligibility = async () => {
    try {
      const response = await axios.get(`/api/courses/${user.id}/eligibility`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEligibility(response.data);
      setError(null);
    } catch (err) {
      console.error("Eligibility check error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
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
    setLoading(true);
    fetchEligibility();
  };

  if (loading) return <div className="loading">Loading eligibility data...</div>;
  if (error)
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={handleRefresh}>Try Again</button>
      </div>
    );
  if (!eligibility) return <div>No eligibility data found</div>;

  return (
    <div className="eligibility-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <IoReturnUpBack />
      </button>

      <h1>Degree Award Eligibility</h1>

      <div className={`status-banner ${eligibility.allRequirementsMet ? "met" : "not-met"}`}>
        {eligibility.allRequirementsMet ? (
          <p>✅ All requirements met for degree award!</p>
        ) : (
          <p>⚠️ Not all requirements are met yet</p>
        )}
      </div>

      <div className="requirements-grid">
        <RequirementCard
          title="Industrial (I)"
          met={eligibility.requirements.industrial.met}
          current={eligibility.requirements.industrial.current}
          min={eligibility.requirements.industrial.min}
          max={eligibility.requirements.industrial.max}
          remaining={eligibility.requirements.industrial.remaining}
          exceeded={eligibility.requirements.industrial.exceeded}
        />

        <RequirementCard
          title="Engineering (X)"
          met={eligibility.requirements.engineering.met}
          current={eligibility.requirements.engineering.current}
          min="30 (Level 5/6)"
          additional={[
            `Level 5/6: ${eligibility.requirements.engineering.level5_6}/30`,
            `Level 6: ${eligibility.requirements.engineering.level6}/15`,
          ]}
          remaining={Math.max(
            eligibility.requirements.engineering.remainingLevel5_6,
            eligibility.requirements.engineering.remainingLevel6
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
            `Level 5+: ${eligibility.requirements.management.level5}/12`,
          ]}
          remaining={Math.max(
            eligibility.requirements.management.remaining,
            eligibility.requirements.management.remainingLevel5
          )}
        />

        <RequirementCard
          title="Mathematics (Z)"
          met={eligibility.requirements.mathematics.met}
          current={eligibility.requirements.mathematics.current}
          min={eligibility.requirements.mathematics.min}
          max={eligibility.requirements.mathematics.max}
          additional={[
            `Level 5+: ${eligibility.requirements.mathematics.level5}/3`,
          ]}
          remaining={Math.max(
            eligibility.requirements.mathematics.remaining,
            eligibility.requirements.mathematics.remainingLevel5
          )}
        />

        <RequirementCard
          title="Project (Y)"
          met={eligibility.requirements.project.met}
          current={eligibility.requirements.project.current}
          min={eligibility.requirements.project.min}
          max={eligibility.requirements.project.max}
          additional={[
            `Level 6: ${eligibility.requirements.project.level6}/6`,
          ]}
          remaining={Math.max(
            eligibility.requirements.project.remaining,
            eligibility.requirements.project.remainingLevel6
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
            eligibility.requirements.total.remaining,
            eligibility.requirements.total.remainingLevel5_6,
            eligibility.requirements.total.remainingLevel6
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
  const showProgressBar = typeof min === 'number';
  const progressPercent = showProgressBar ? Math.min(100, (current / min) * 100) : 0;

  return (
    <div className={`requirement-card ${met ? "met" : "not-met"}`}>
      <h3>{title}</h3>
      
      {showProgressBar && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progressPercent)}%</span>
        </div>
      )}
      
      <div className="details">
        <p>
          <strong>Current:</strong> {current} credits
        </p>
        <p>
          <strong>Requirement:</strong> {min}
          {max ? `-${max}` : "+"} credits
        </p>
        
        {additional?.map((item, i) => (
          <p key={i} className="additional-requirement">
            {item}
          </p>
        ))}
        
        {remaining > 0 && (
          <p className="remaining">
            <strong>Remaining:</strong> {remaining} credits
          </p>
        )}
        
        {exceeded > 0 && (
          <p className="exceeded">
            <strong>Exceeded by:</strong> {exceeded} credits
          </p>
        )}
      </div>
      
      <div className="status-icon">{met ? "✓" : "✗"}</div>
    </div>
  );
};

export default DegreeEligibility;