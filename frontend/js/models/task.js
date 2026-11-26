/**
 * Task model.
 * Fields are private and can only be changed through setters, which
 * validate the value with the same limits as the API. A setter throws
 * a ValidationError, so a form bound to the model can show the message
 * next to the right field.
 */
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2000;

/** Error raised by a model setter; `field` names the invalid property. */
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export class Task {
  #id;
  #title;
  #description;
  #completed;

  constructor({ id = null, title = "", description = "", completed = false } = {}) {
    // Data from the API is already valid, so it is assigned directly.
    this.#id = id;
    this.#title = title;
    this.#description = description ?? "";
    this.#completed = Boolean(completed);
  }

  /** Creates a Task from an API response object. */
  static fromApi(data) {
    return new Task(data);
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  set title(value) {
    const title = String(value ?? "").trim();
    if (!title) {
      throw new ValidationError("title", "Title cannot be empty.");
    }
    if (title.length > TITLE_MAX_LENGTH) {
      throw new ValidationError("title", `Title must be at most ${TITLE_MAX_LENGTH} characters.`);
    }
    this.#title = title;
  }

  get description() {
    return this.#description;
  }

  set description(value) {
    const description = String(value ?? "").trim();
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      throw new ValidationError(
        "description",
        `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`,
      );
    }
    this.#description = description;
  }

  get completed() {
    return this.#completed;
  }

  set completed(value) {
    this.#completed = Boolean(value);
  }

  /** Returns an independent copy, so a dialog can edit it without touching the original. */
  clone() {
    return new Task({
      id: this.#id,
      title: this.#title,
      description: this.#description,
      completed: this.#completed,
    });
  }

  /** Request body for POST /tasks/ and PUT /tasks/{id}. */
  toPayload() {
    return {
      title: this.#title,
      description: this.#description || null,
      completed: this.#completed,
    };
  }
}
