document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const searchInput = document.getElementById("activity-search");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("activity-sort");
  let activitiesData = {};
  let activityOptionsLoaded = false;

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      activitiesData = await response.json();

      if (!activityOptionsLoaded) {
        Object.entries(activitiesData).forEach(([name, details]) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          activitySelect.appendChild(option);
        });

        [...new Set(Object.values(activitiesData).map(({ category }) => category))]
          .sort()
          .forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
          });
        activityOptionsLoaded = true;
      }

      renderActivities();
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  function renderActivities() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortBy = sortSelect.value;
    const filteredActivities = Object.entries(activitiesData)
      .filter(([name, details]) => {
        const searchableText = [
          name,
          details.description,
          details.schedule,
          details.category,
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!selectedCategory || details.category === selectedCategory) &&
          (!searchTerm || searchableText.includes(searchTerm))
        );
      })
      .sort(([nameA, detailsA], [nameB, detailsB]) => {
        if (sortBy === "name") {
          return nameA.localeCompare(nameB);
        }
        return (
          detailsA.schedule_order - detailsB.schedule_order ||
          nameA.localeCompare(nameB)
        );
      });

    activitiesList.innerHTML = "";
    if (filteredActivities.length === 0) {
      activitiesList.innerHTML = "<p>No activities match your filters.</p>";
      return;
    }

    filteredActivities.forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p class="activity-category">${details.category}</p>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);
      });

      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  searchInput.addEventListener("input", renderActivities);
  categoryFilter.addEventListener("change", renderActivities);
  sortSelect.addEventListener("change", renderActivities);

  // Initialize app
  fetchActivities();
});
