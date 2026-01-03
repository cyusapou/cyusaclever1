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
  const dob = getValue("dob");
  const gender = getValue("gender");
  const level = getValue("level");
  const course = getValue("course");
  const address = getValue("address");
  const terms = document.getElementById("terms").checked;

  if (!fullName) { setError("err_fullName", "Full name is required"); ok = false; } else setError("err_fullName", "");
  if (!schoolName) { setError("err_schoolName", "School name is required"); ok = false; } else setError("err_schoolName", "");

  if (!email) { setError("err_email", "Email is required"); ok = false; }
  else if (!EMAIL_RE.test(email)) { setError("err_email", "Invalid email format"); ok = false; }
  else setError("err_email", "");

  if (!phone) { setError("err_phone", "Phone is required"); ok = false; }
  else if (!PHONE_RE.test(phone)) { setError("err_phone", "Phone must be 10 digits"); ok = false; }
  else setError("err_phone", "");

  if (!dob) { setError("err_dob", "Date of birth is required"); ok = false; } else setError("err_dob", "");
  if (!gender) { setError("err_gender", "Select gender"); ok = false; } else setError("err_gender", "");
  if (!level) { setError("err_level", "Select level"); ok = false; } else setError("err_level", "");
  if (!course) { setError("err_course", "Select course"); ok = false; } else setError("err_course", "");
  if (!address) { setError("err_address", "Address is required"); ok = false; } else setError("err_address", "");

  if (!terms) { setError("err_terms", "You must accept terms and conditions"); ok = false; } else setError("err_terms", "");

  return ok;
}

function renderSubmissions() {
  const raw = localStorage.getItem("registrations");
  const list = raw ? JSON.parse(raw) : [];
  submissionsList.innerHTML = "";

  for (const item of list) {
    const li = document.createElement("li");
    const contacts = Array.isArray(item.contacts) && item.contacts.length
      ? ` | Contacts: ${item.contacts.map((c) => c.name).filter(Boolean).join(", ")}`
      : "";
    li.textContent = `${item.fullName} | ${item.email} | ${item.course} | ${item.level}${contacts}`;
    submissionsList.appendChild(li);
  }
}

function addMember() {
  const idx = membersRoot.children.length + 1;
  const wrapper = document.createElement("div");
  wrapper.className = "member";
  wrapper.innerHTML = `
    <div class="member-title">Emergency Contact ${idx}</div>
    <div class="row">
      <div class="field">
        <label>Name</label>
        <input type="text" name="contactName_${idx}" placeholder="Contact name" />
      </div>
      <div class="field">
        <label>Phone</label>
        <input type="tel" name="contactPhone_${idx}" placeholder="07XX XXX XXX" />
      </div>
    </div>
    <div class="actions">
      <button type="button" class="remove" aria-label="Remove contact ${idx}">Remove Contact</button>
    </div>
  `;

  wrapper.querySelector(".remove").addEventListener("click", () => {
    wrapper.remove();
  });

  membersRoot.appendChild(wrapper);
}

addMemberBtn.addEventListener("click", addMember);

for (const name of ["fullName", "schoolName", "email", "phone", "dob", "gender", "level", "course", "address"]) {
  const el = form.elements[name];
  if (el) el.addEventListener("input", validate);
}

document.getElementById("terms").addEventListener("change", validate);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const contacts = Array.from(membersRoot.querySelectorAll(".member")).map((memberEl) => {
    const nameInput = memberEl.querySelector('input[name^="contactName_"]');
    const phoneInput = memberEl.querySelector('input[name^="contactPhone_"]');
    return {
      name: nameInput ? String(nameInput.value || "").trim() : "",
      phone: phoneInput ? String(phoneInput.value || "").trim().replace(/\s+/g, "") : "",
    };
  });

  const payload = {
    fullName: getValue("fullName"),
    schoolName: getValue("schoolName"),
    email: getValue("email"),
    phone: getValue("phone").replace(/\s+/g, ""),
    dob: getValue("dob"),
    gender: getValue("gender"),
    level: getValue("level"),
    course: getValue("course"),
    address: getValue("address"),
    contacts,
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
