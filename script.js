const form = document.getElementById("regForm");
const membersRoot = document.getElementById("members");
const submissionsList = document.getElementById("submissions");
const addMemberBtn = document.getElementById("addMember");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

function setError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message || "";
}

function getValue(name) {
  const el = form.elements[name];
  return el ? String(el.value || "").trim() : "";
}

function validate() {
  let ok = true;

  const fullName = getValue("fullName");
  const schoolName = getValue("schoolName");
  const email = getValue("email");
  const phone = getValue("phone").replace(/\s+/g, "");
  const projectTitle = getValue("projectTitle");
  const projectType = getValue("projectType");
  const terms = document.getElementById("terms").checked;

  if (!fullName) { setError("err_fullName", "Full name is required"); ok = false; } else setError("err_fullName", "");
  if (!schoolName) { setError("err_schoolName", "School name is required"); ok = false; } else setError("err_schoolName", "");

  if (!email) { setError("err_email", "Email is required"); ok = false; }
  else if (!EMAIL_RE.test(email)) { setError("err_email", "Invalid email format"); ok = false; }
  else setError("err_email", "");

  if (!phone) { setError("err_phone", "Phone is required"); ok = false; }
  else if (!PHONE_RE.test(phone)) { setError("err_phone", "Phone must be 10 digits"); ok = false; }
  else setError("err_phone", "");

  if (!projectTitle) { setError("err_projectTitle", "Project title is required"); ok = false; } else setError("err_projectTitle", "");
  if (!projectType) { setError("err_projectType", "Select project type"); ok = false; } else setError("err_projectType", "");

  if (!terms) { setError("err_terms", "You must accept terms and conditions"); ok = false; } else setError("err_terms", "");

  return ok;
}

function renderSubmissions() {
  const raw = localStorage.getItem("registrations");
  const list = raw ? JSON.parse(raw) : [];
  submissionsList.innerHTML = "";

  for (const item of list) {
    const li = document.createElement("li");
    const members = Array.isArray(item.members) && item.members.length
      ? ` | Members: ${item.members.map((m) => m.name).filter(Boolean).join(", ")}`
      : "";
    li.textContent = `${item.fullName} | ${item.email} | ${item.schoolName} | ${item.projectTitle} (${item.projectType})${members}`;
    submissionsList.appendChild(li);
  }
}

function addMember() {
  const idx = membersRoot.children.length + 1;
  const wrapper = document.createElement("div");
  wrapper.className = "member";
  wrapper.innerHTML = `
    <div class="member-title">Team Member ${idx}</div>
    <div class="row">
      <div class="field">
        <label>Name</label>
        <input type="text" name="memberName_${idx}" placeholder="Member name" />
      </div>
      <div class="field">
        <label>Email</label>
        <input type="email" name="memberEmail_${idx}" placeholder="member@example.com" />
      </div>
    </div>
    <div class="actions">
      <button type="button" class="remove" aria-label="Remove member ${idx}">Remove Member</button>
    </div>
  `;

  wrapper.querySelector(".remove").addEventListener("click", () => {
    wrapper.remove();
  });

  membersRoot.appendChild(wrapper);
}

addMemberBtn.addEventListener("click", addMember);

for (const name of ["fullName", "schoolName", "email", "phone", "projectTitle", "projectType"]) {
  const el = form.elements[name];
  if (el) el.addEventListener("input", validate);
}

document.getElementById("terms").addEventListener("change", validate);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const members = Array.from(membersRoot.querySelectorAll(".member")).map((memberEl) => {
    const nameInput = memberEl.querySelector('input[name^="memberName_"]');
    const emailInput = memberEl.querySelector('input[name^="memberEmail_"]');
    return {
      name: nameInput ? String(nameInput.value || "").trim() : "",
      email: emailInput ? String(emailInput.value || "").trim() : "",
    };
  });

  const payload = {
    fullName: getValue("fullName"),
    schoolName: getValue("schoolName"),
    email: getValue("email"),
    phone: getValue("phone").replace(/\s+/g, ""),
    projectTitle: getValue("projectTitle"),
    projectType: getValue("projectType"),
    members,
    submittedAt: new Date().toISOString(),
  };

  const raw = localStorage.getItem("registrations");
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(payload);
  localStorage.setItem("registrations", JSON.stringify(list));

  renderSubmissions();
  form.reset();
  validate();
});

renderSubmissions();
