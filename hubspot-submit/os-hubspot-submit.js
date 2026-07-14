(function () {
  const PORTAL_ID =
    document.currentScript?.dataset.portalId || window.HS_PORTAL_ID;

  function getValue(el, form, fieldName) {
    const type = (el.type || "").toLowerCase();

    // Radio group: find the checked one among same-named fields in this form
    if (type === "radio") {
      const checked = form.querySelector(
        `[data-os-form-field="${fieldName}"]:checked`,
      );
      return checked ? checked.value : "";
    }

    // Checkbox: single = boolean, multiple sharing a name = multi-select
    if (type === "checkbox") {
      const group = form.querySelectorAll(
        `[data-os-form-field="${fieldName}"]`,
      );
      if (group.length > 1) {
        return [...group]
          .filter((c) => c.checked)
          .map((c) => c.value)
          .join(";");
      }
      return el.checked
        ? el.value && el.value !== "on"
          ? el.value
          : "true"
        : "false";
    }

    // Multi-select dropdown
    if (el.multiple) {
      return [...el.selectedOptions].map((o) => o.value).join(";");
    }

    return el.value ?? "";
  }

  function handleSuccess(form) {
    // 1. Redirect wins if present
    const redirect = form.dataset.osSuccessRedirect;
    if (redirect) {
      window.location.href = redirect;
      return;
    }

    // 2. Reveal an existing element (by selector) instead of replacing
    const revealSel = form.dataset.osSuccessReveal;
    if (revealSel) {
      const el = document.querySelector(revealSel);
      if (el) el.style.display = "";
      if (form.dataset.osSuccessHideForm !== "false")
        form.style.display = "none";
      return;
    }

    // 3. Default: replace form with a message
    const msg =
      form.dataset.osSuccessMessage || "Your submission has been received";
    const cls = form.dataset.osSuccessClass || "form_success_text";
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = msg;
    form.replaceWith(p);
  }

  document.querySelectorAll("[data-os-form]").forEach((form) => {
    const FORM_ID = form.dataset.osForm;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();

      // Dedupe by field name so radio/checkbox groups produce one payload entry
      const seen = new Set();
      const fields = [];

      form.querySelectorAll("[data-os-form-field]").forEach((el) => {
        const name = el.dataset.osFormField;
        if (seen.has(name)) return;
        seen.add(name);
        fields.push({
          objectTypeId: el.dataset.osFormObject || "0-1",
          name,
          value: getValue(el, form, name),
        });
      });

      try {
        const res = await fetch(
          `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fields }),
          },
        );
        const data = await res.json();
        if (!data.errors) {
          handleSuccess(form);
        } else {
          console.error("HubSpot errors:", data.errors);
        }
      } catch (err) {
        console.error("Submission error:", err);
      }
    });
  });
})();
