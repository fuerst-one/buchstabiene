export class NoSessionError extends Error {
  constructor() {
    super("No session");
    this.name = "NoSessionError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class CompanyNotFoundError extends Error {
  constructor() {
    super("Company not found");
    this.name = "CompanyNotFoundError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}
