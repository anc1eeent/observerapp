/**
 * Task model.
 * Fields are private and can only be changed through setters, which
 * validate the value with the same limits as the API. A setter throws
 * a ValidationError, so a form bound to the model can show the message
 * next to the right field.
 */
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const PRIORITIES = ["low", "medium", "high"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
  #priority;
  #dueDate;
  #createdAt;
  #focusSeconds;

  constructor({
    id = null,
    title = "",
    description = "",
    completed = false,
    priority = "medium",
    due_date = null,
    created_at = null,
    focus_seconds = 0,
  } = {}) {
    // Data from the API is already valid, so it is assigned directly.
    this.#id = id;
    this.#title = title;
    this.#description = description ?? "";
    this.#completed = Boolean(completed);
    this.#priority = priority;
    this.#dueDate = due_date ?? "";
    this.#createdAt = created_at;
    this.#focusSeconds = focus_seconds ?? 0;
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

  get priority() {
    return this.#priority;
  }

  set priority(value) {
    if (!PRIORITIES.includes(value)) {
      throw new ValidationError("priority", "Choose low, medium or high priority.");
    }
    this.#priority = value;
  }

  /** Due date as "YYYY-MM-DD", or "" when the task has no due date. */
  get dueDate() {
    return this.#dueDate;
  }

  set dueDate(value) {
    const dueDate = String(value ?? "").trim();
    if (dueDate && !ISO_DATE.test(dueDate)) {
      throw new ValidationError("dueDate", "Enter a valid date.");
    }
    this.#dueDate = dueDate;
  }

  /** Read-only: set by the API. */
  get createdAt() {
    return this.#createdAt;
  }

  /** Read-only: total time of Pomodoro sessions linked to this task. */
  get focusSeconds() {
    return this.#focusSeconds;
  }

  /** Returns an independent copy, so a dialog can edit it without touching the original. */
  clone() {
    return new Task({
      id: this.#id,
      title: this.#title,
      description: this.#description,
      completed: this.#completed,
      priority: this.#priority,
      due_date: this.#dueDate,
      created_at: this.#createdAt,
      focus_seconds: this.#focusSeconds,
    });
  }

  /** Request body for POST /tasks/ and PUT /tasks/{id}. */
  toPayload() {
    return {
      title: this.#title,
      description: this.#description || null,
      completed: this.#completed,
      priority: this.#priority,
      due_date: this.#dueDate || null,
    };
  }
}
