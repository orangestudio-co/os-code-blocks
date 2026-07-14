# OS HubSpot Submit

A single reusable script that wires any HTML form up to HubSpot's Forms API. Hosted once, used everywhere — no per-site code edits. Each form describes its own fields and success behavior in HTML.

## Setup

Include the script once per site. Set your Portal ID on the script tag:

```html
<script
  src="https://cdn.jsdelivr.net/gh/orangestudio-co/os-code-blocks/hubspot-submit/os-hubspot-submit.js"
  data-portal-id="47780539"
></script>
```

> Alternatively, set `window.HS_PORTAL_ID = '47780539'` in a `<script>` before the file loads.

## Building a form

- Add `data-os-form="FORM_ID"` to the `<form>` (the HubSpot form's UUID).
- Add `data-os-form-field="PROPERTY"` to each input. The value must be the HubSpot property's **internal name** (`firstname`, not "First Name").

```html
<form data-os-form="43d16efd-62ca-41aa-9c10-4bb117c7d8f8">
  <input data-os-form-field="firstname" name="first-name" required />
  <input data-os-form-field="email" name="email" type="email" required />
  <button type="submit">Send</button>
</form>
```

That's the whole setup for a basic contact form. The script finds the form, collects every `data-os-form-field`, and submits on `submit`.

## Field objects (contact vs. company, etc.)

Fields default to the **contact** object (`0-1`). To send a field to another object, add `data-os-form-object`:

```html
<input
  data-os-form-field="name"
  data-os-form-object="0-2"
  name="company-name"
/>
```

Common object type IDs: `0-1` contact, `0-2` company.

## Input types

Works automatically with text, email, textarea, and single-select dropdowns. Also handles:

**Radio** — same `data-os-form-field` on each option, distinct `value`:

```html
<input type="radio" data-os-form-field="preferred_contact" value="email" />
<input type="radio" data-os-form-field="preferred_contact" value="phone" />
```

**Checkbox (boolean)** — submits `"true"` / `"false"`:

```html
<input type="checkbox" data-os-form-field="opt_in" required />
```

**Multi-select** (several checkboxes sharing a field name, or `<select multiple>`) — submits values joined by `;`. Values must match the option internal values on the HubSpot property exactly:

```html
<input type="checkbox" data-os-form-field="interests" value="Consulting" />
<input type="checkbox" data-os-form-field="interests" value="Support" />
```

## Success behavior

Choose per-form in HTML. Priority order: redirect → reveal → message.

**Redirect** to a thank-you page:

```html
<form data-os-form="..." data-os-success-redirect="/thank-you"></form>
```

**Reveal an existing hidden element** — for pre-built styled success blocks:

```html
<form data-os-form="..." data-os-success-reveal="#signup-success">
  <div id="signup-success" style="display:none">
    <h3>You're in!</h3>
    <a href="/next">Continue</a>
  </div>
</form>
```

Hides the form by default; add `data-os-success-hide-form="false"` to keep it visible. The target must start hidden via inline `display:none`.

**Message replace** (the default) — replaces the form with a `<p>`. Override text and/or class:

```html
<form
  data-os-form="..."
  data-os-success-message="You're on the list!"
  data-os-success-class="my-custom-success"
></form>
```

With no success attributes at all, you get:

- Text: `Your submission has been received`
- Class: `form_success_text`

## Gotchas

- **Field name mismatch = failed submission.** Every `data-os-form-field` must exist as a property on the target object _and_ be included in the form's field list in HubSpot. One bad field name errors the whole submit.
- **Required fields** rely on the native `required` attribute — including consent checkboxes. Mark them `required` in the HTML.
- **Multi-select values** must match HubSpot's internal option values character-for-character.
- **Success message** uses `textContent`, so HTML in `data-os-success-message` won't render (use the reveal option for rich content).
- Errors are logged to the browser console (`HubSpot errors:` / `Submission error:`), not shown to the user.

## Not covered

GDPR consent tracking (`legalConsentOptions`) is a separate payload block, not a `data-os-form-field`. Add it to the script if you need it.
