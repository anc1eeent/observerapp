/**
 * Two-way data binding between a form and a model object.
 *
 * model -> form: inputs are filled from the model's getters.
 * form -> model: every change in an input is written through the model's
 *   setter. If the setter throws a ValidationError, the message is shown
 *   in the element marked with data-error-for="<field>".
 */

function readInput(input) {
  return input.type === "checkbox" ? input.checked : input.value;
}

function writeInput(input, value) {
  if (input.type === "checkbox") {
    input.checked = Boolean(value);
  } else {
    input.value = value ?? "";
  }
}

/**
 * Binds the named fields of `form` to the same-named properties of `model`.
 * Returns { validate(), focusFirstInvalid(), unbind() }.
 */
export function bindForm(form, model, fieldNames) {
  const errors = new Map();
  const inputFor = (name) => form.elements.namedItem(name);
  const errorElementFor = (name) => form.querySelector(`[data-error-for="${name}"]`);

  function setError(name, message) {
    if (message) {
      errors.set(name, message);
    } else {
      errors.delete(name);
    }
    const errorElement = errorElementFor(name);
    if (errorElement) {
      errorElement.textContent = message;
    }
    inputFor(name).setAttribute("aria-invalid", message ? "true" : "false");
  }

  /** Writes one input into the model; returns false if the value is invalid. */
  function update(name) {
    try {
      model[name] = readInput(inputFor(name));
      setError(name, "");
      return true;
    } catch (error) {
      if (error.name !== "ValidationError") {
        throw error;
      }
      setError(name, error.message);
      return false;
    }
  }

  const listeners = fieldNames.map((name) => {
    const input = inputFor(name);
    const eventName = input.type === "checkbox" ? "change" : "input";
    const handler = () => update(name);
    input.addEventListener(eventName, handler);
    return () => input.removeEventListener(eventName, handler);
  });

  // Fill the form from the model.
  fieldNames.forEach((name) => {
    writeInput(inputFor(name), model[name]);
    setError(name, "");
  });

  return {
    /** Validates every field; returns true when the model holds valid data. */
    validate() {
      return fieldNames.map(update).every(Boolean);
    },
    focusFirstInvalid() {
      const name = fieldNames.find((field) => errors.has(field));
      if (name) {
        inputFor(name).focus();
      }
    },
    unbind() {
      listeners.forEach((removeListener) => removeListener());
    },
  };
}
