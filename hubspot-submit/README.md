# HubSpot Form Submitter

A single reusable script that wires any HTML form up to HubSpot's Forms API. Hosted once, used everywhere — no per-site code edits. Each form describes its own fields in HTML.

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

## Success message

On success, the form is replaced with:

```html
<p class="lfb_success-message">
  Thanks for reaching out. Our business services team will be in touch.
</p>
```

Style `.lfb_success-message` to taste. Edit the text in `form.js` if you want something different globally.

## Gotchas

- **Field name mismatch = failed submission.** Every `data-os-form-field` must exist as a property on the target object _and_ be included in the form's field list in HubSpot. One bad field name errors the whole submit.
- **Required fields** rely on the native `required` attribute — including consent checkboxes. Mark them `required` in the HTML.
- **Multi-select values** must match HubSpot's internal option values character-for-character.
- Errors are logged to the browser console (`HubSpot errors:` / `Submission error:`), not shown to the user.

## Not covered

GDPR consent tracking (`legalConsentOptions`) is a separate payload block, not a `data-os-form-field`. Add it to the script if you need it.
