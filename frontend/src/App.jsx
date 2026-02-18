import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("low");

  const [loadingLLM, setLoadingLLM] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClassify = async () => {
    if (!description) return;

    setLoadingLLM(true);

    try {
      const res = await fetch(`${API_BASE}/tickets/classify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (data.suggested_category)
        setCategory(data.suggested_category);
      if (data.suggested_priority)
        setPriority(data.suggested_priority);

    } catch (err) {
      console.error("LLM error", err);
    }

    setLoadingLLM(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await fetch(`${API_BASE}/tickets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
        }),
      });

      // clear form
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("low");

      alert("Ticket submitted successfully!");

    } catch (err) {
      console.error("Submit error", err);
    }

    setSubmitting(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h2>Submit Support Ticket</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            maxLength="200"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleClassify}
            style={{ width: "100%", height: "100px", marginBottom: "10px" }}
          />
          {loadingLLM && <p>Analyzing description...</p>}
        </div>

        <div>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}

export default App;
