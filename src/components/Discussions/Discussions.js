import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import defaultProfile from "../../assets/default-Profile.png";
import "./Discussions.css";
import { IoReturnUpBack } from "react-icons/io5";

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    course: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [filter, setFilter] = useState({
    course: "",
    search: "",
    sort: "newest",
  });

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.course) params.append("course", filter.course);
        if (filter.search) params.append("search", filter.search);
        if (filter.sort) params.append("sort", filter.sort);

        const response = await axios.get(
          `/api/discussions?${params.toString()}`
        );
        setDiscussions(response.data);
      } catch (error) {
        toast.error("Failed to fetch discussions");
        console.error("Error fetching discussions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [filter]);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/discussions",
        {
          title: newDiscussion.title,
          content: newDiscussion.content,
          course: newDiscussion.course,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      setDiscussions([response.data, ...discussions]);
      setNewDiscussion({ title: "", content: "", course: "" });
      setShowForm(false);
      toast.success("Discussion created successfully!");
    } catch (error) {
      toast.error("Failed to create discussion");
      console.error("Error creating discussion:", error);
    }
  };

  const handleAddReply = async (discussionId) => {
    if (!replyContent.trim()) {
      toast.warning("Reply cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `/api/discussions/${discussionId}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      setDiscussions(
        discussions.map((discussion) =>
          discussion._id === discussionId
            ? {
                ...discussion,
                replies: [...discussion.replies, response.data],
              }
            : discussion
        )
      );

      setReplyContent("");
      toast.success("Reply added successfully!");
    } catch (error) {
      toast.error("Failed to add reply");
      console.error("Error adding reply:", error);
    }
  };

  const handleDiscussionClick = (discussion) => {
    setSelectedDiscussion(
      selectedDiscussion && selectedDiscussion._id === discussion._id
        ? null
        : discussion
    );
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <motion.div
      className="discussions-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="discussions-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoReturnUpBack />
        </button>
        <h1>Student Discussions</h1>
        <motion.button
          className="new-discussion-btn"
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showForm ? "Cancel" : "+ New Discussion"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="discussion-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleCreateDiscussion} className="discussion-form">
              <h3>Create New Discussion</h3>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newDiscussion.title}
                  onChange={(e) =>
                    setNewDiscussion({
                      ...newDiscussion,
                      title: e.target.value,
                    })
                  }
                  required
                  maxLength="200"
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  value={newDiscussion.content}
                  onChange={(e) =>
                    setNewDiscussion({
                      ...newDiscussion,
                      content: e.target.value,
                    })
                  }
                  required
                  maxLength="5000"
                  rows="5"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="course">Course</label>
                  <input
                    type="text"
                    id="course"
                    value={newDiscussion.course}
                    onChange={(e) =>
                      setNewDiscussion({
                        ...newDiscussion,
                        course: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Post Discussion
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="discussions-filter">
        <div className="filter-group">
          <label htmlFor="course-filter">Filter by Course:</label>
          <input
            type="text"
            id="course-filter"
            value={filter.course}
            onChange={(e) => setFilter({ ...filter, course: e.target.value })}
            placeholder="e.g., CS101"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="search-filter">Search:</label>
          <input
            type="text"
            id="search-filter"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="Search discussions..."
          />
        </div>
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort by:</label>
          <select
            id="sort-filter"
            value={filter.sort}
            onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : discussions.length === 0 ? (
        <div className="no-discussions">
          <p>No discussions found. Be the first to start one!</p>
        </div>
      ) : (
        <div className="discussions-list">
          {discussions.map((discussion) => (
            <motion.div
              key={discussion._id}
              className="discussion-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="discussion-header"
                onClick={() => handleDiscussionClick(discussion)}
              >
                <div className="discussion-author">
                  <img
                    src={discussion.author.profilePicture || defaultProfile}
                    alt={discussion.author.name}
                    className="author-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultProfile;
                    }}
                  />
                  <div className="author-info">
                    <span className="author-name">
                      {discussion.author.name}
                    </span>
                    <span className="discussion-date">
                      {formatDate(discussion.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="discussion-meta">
                  <span className="discussion-course">{discussion.course}</span>
                </div>
              </div>
              <div
                className="discussion-content"
                onClick={() => handleDiscussionClick(discussion)}
              >
                <h3>{discussion.title}</h3>
                <p>{discussion.content}</p>
              </div>
              <div className="discussion-footer">
                <button className="reply-btn">
                  <span>💬</span> {discussion.replies.length} Replies
                </button>
              </div>

              <AnimatePresence>
                {selectedDiscussion &&
                  selectedDiscussion._id === discussion._id && (
                    <motion.div
                      className="discussion-replies"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {discussion.replies.length > 0 ? (
                        <div className="replies-list">
                          {discussion.replies.map((reply) => (
                            <div key={reply._id} className="reply-item">
                              <div className="reply-author">
                                <img
                                  src={
                                    reply.author.profilePicture ||
                                    defaultProfile
                                  }
                                  alt={reply.author.name}
                                  className="reply-avatar"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultProfile;
                                  }}
                                />
                                <div className="reply-author-info">
                                  <span className="reply-author-name">
                                    {reply.author.name}
                                  </span>
                                  <span className="reply-date">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="reply-content">
                                <p>
                                  <span>replied - </span>
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-replies">
                          No replies yet. Be the first to reply!
                        </div>
                      )}

                      <div className="add-reply">
                        <textarea
                          placeholder="Write your reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows="3"
                        />
                        <motion.button
                          className="submit-reply-btn"
                          onClick={() => handleAddReply(discussion._id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Post Reply
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Discussions;
